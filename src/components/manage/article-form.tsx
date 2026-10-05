'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { JSONContent } from '@tiptap/core';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';

import { articleSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { CategoryTabs } from '@/components/manage/category-tabs';
import { CoverUploader } from '@/components/manage/cover-uploader';
import { uploadArticleImage } from '@/components/manage/article-image-upload';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { createArticle } from '@/app/(private)/manage/new/actions';

export type ArticleFormValues = z.infer<typeof articleSchema>;

/** Result contract the edit page's update action must satisfy. */
export type UpdateResult =
  { ok: true } | { ok: false; error: string; field?: 'slug' | 'body' | 'root' };

/** Title → slug: lowercase, accents stripped, non-alphanumerics to hyphens. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EXCERPT_MAX = 160;
const EMPTY_BODY = { type: 'doc' as const, content: [{ type: 'paragraph' }] };

const fieldClass = (hasError?: boolean) =>
  cn(
    'border-line-soft placeholder:text-faint w-full rounded-full border bg-white px-4 py-2 font-mono text-[13px] transition-colors',
    'focus:border-brand focus:outline-none',
    hasError && 'border-destructive',
  );

/**
 * The article editor (M6). Metadata + Tiptap body in one react-hook-form.
 *
 * Two modes, one component (so create and edit never drift apart):
 * - create (`initial` omitted): empty defaults, submitted through
 *   createArticle as DRAFT or PUBLISHED via `submitAs`.
 * - edit (`initial` set): pre-filled from the article row, submitted through
 *   `onUpdate` with a plain-JSON body. The Update button stays disabled until
 *   the form is dirty (touched + changed from `initial`), valid, and idle —
 *   validation runs `onChange` so the button enables the moment the form
 *   becomes both dirty and valid, and `aria-disabled` + tooltip explain why
 *   a disabled button can't be clicked yet.
 *
 * Slug follows the title until the owner edits it by hand (slugTouched), then
 * it stays theirs — renaming a title must never silently rewrite a URL.
 * In edit mode the slug starts touched (it came from the DB, not the title),
 * so typing a new title never rewrites a live URL.
 */
export function ArticleForm({
  initial,
  coverUrl = null,
  onUpdate,
  status,
}: {
  initial?: ArticleFormValues;
  coverUrl?: string | null;
  onUpdate?: (values: ArticleFormValues) => Promise<UpdateResult>;
  status?: 'DRAFT' | 'PUBLISHED';
} = {}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [pendingAction, setPendingAction] = useState<'DRAFT' | 'PUBLISHED' | null>(null);
  const [updating, setUpdating] = useState(false);
  const {
    register,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    mode: 'onChange',
    defaultValues: initial ?? {
      title: '',
      slug: '',
      excerpt: '',
      category: 'TECH',
      cover: '',
      body: EMPTY_BODY,
    },
  });

  // The edit page loads its article on the server and hands it down — when
  // navigation lands on a different id, reset the form onto the new row.
  useEffect(() => {
    if (initial) reset(initial);
  }, [initial, reset]);

  const slugTouched = useRef(editing);
  useEffect(() => {
    slugTouched.current = editing ? Boolean(initial?.slug) : slugTouched.current;
  }, [editing, initial?.slug]);
  const slugField = register('slug');
  // useWatch, not watch: the reactive subscription is safe in effect deps —
  // the watch() function itself is not (react-hooks/incompatible-library).
  const title = useWatch({ control, name: 'title' });
  const excerpt = useWatch({ control, name: 'excerpt' });

  useEffect(() => {
    if (!slugTouched.current) setValue('slug', slugify(title ?? ''), { shouldValidate: true });
  }, [title, setValue]);

  // Two explicit submitters — pendingAction owns the per-button spinner so
  // only the clicked button shows loading; isSubmitting (RHF) disables both.
  const submitAs = (status: 'DRAFT' | 'PUBLISHED') =>
    handleSubmit(async (values) => {
      clearErrors('root');
      setPendingAction(status);
      try {
        // Tiptap state must cross the client/server boundary as plain JSON:
        // node attrs have historically carried the upload function (see
        // image-upload-node.tsx), which arrives as a client reference and
        // crashes Prisma serialization. The round-trip drops functions.
        const body = JSON.parse(JSON.stringify(values.body ?? {})) as typeof values.body;
        const result = await createArticle({ ...values, body, status });

        if (!result.ok) {
          setError(result.field ?? 'root', { message: result.error });
          return;
        }

        router.push('/manage');
      } catch {
        setError('root', { message: 'Could not save the article. Try again.' });
      } finally {
        setPendingAction(null);
      }
    });

  const formInvalid = !isValid || isSubmitting;
  const draftBusy = pendingAction === 'DRAFT';
  const publishBusy = pendingAction === 'PUBLISHED';

  // Edit mode: one Update button. Disabled until the form is dirty (changed
  // from the loaded row), valid, and idle — `mode: onChange` keeps isValid
  // live so the button enables the moment an edit becomes submittable.
  const submitUpdate = handleSubmit(async (values) => {
    if (!onUpdate) return;
    clearErrors('root');
    setUpdating(true);
    try {
      // Same plain-JSON round-trip as create: drops any client references
      // Tiptap node attrs may carry before Prisma serialization.
      const body = JSON.parse(JSON.stringify(values.body ?? {})) as typeof values.body;
      const result = await onUpdate({ ...values, body });

      if (!result.ok) {
        setError(result.field ?? 'root', { message: result.error });
        return;
      }

      router.push('/manage');
      router.refresh();
    } catch {
      setError('root', { message: 'Could not save the article. Try again.' });
    } finally {
      setUpdating(false);
    }
  });

  const updateDisabled = !isDirty || !isValid || updating || isSubmitting;
  const updateHint = updating
    ? 'Saving your changes…'
    : !isDirty
      ? 'Make a change to enable updating.'
      : !isValid
        ? 'Fix the highlighted fields to enable updating.'
        : 'Save your changes.';

  return (
    <form className="flex flex-col gap-4" noValidate>
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="article-title" className="text-muted-ink font-mono text-[13px]">
          Title
        </label>
        <input
          id="article-title"
          type="text"
          placeholder="Post title"
          aria-invalid={errors.title ? true : undefined}
          className={fieldClass(!!errors.title)}
          {...register('title')}
        />
        <p role="alert" className="text-destructive font-mono text-[12px]">
          {errors.title?.message}
        </p>
      </div>

      {/* Excerpt — doubles as the meta description, hence the counter. */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="article-excerpt" className="text-muted-ink font-mono text-[13px]">
            Excerpt
          </label>
          <span className="text-faint font-mono text-[12px]">
            {excerpt?.length ?? 0}/{EXCERPT_MAX}
          </span>
        </div>
        <textarea
          id="article-excerpt"
          rows={3}
          placeholder="One or two sentences for the card and search results"
          aria-invalid={errors.excerpt ? true : undefined}
          className={cn(
            'border-line-soft placeholder:text-faint w-full resize-y rounded-[16px] border bg-white px-4 py-2 font-mono text-[13px] transition-colors',
            'focus:border-brand focus:outline-none',
            errors.excerpt && 'border-destructive',
          )}
          {...register('excerpt')}
        />
        <p role="alert" className="text-destructive font-mono text-[12px]">
          {errors.excerpt?.message}
        </p>
      </div>

      {/* Slug + category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="article-slug" className="text-muted-ink font-mono text-[13px]">
            Slug
          </label>
          <div
            className={cn(
              'border-line-soft focus-within:border-brand flex items-center rounded-full border bg-white transition-colors',
              errors.slug && 'border-destructive',
            )}
          >
            <span className="text-faint pl-4 font-mono text-[13px]">/blogs/</span>
            <input
              id="article-slug"
              type="text"
              placeholder="auto-from-title"
              aria-invalid={errors.slug ? true : undefined}
              className="placeholder:text-faint w-full rounded-full bg-transparent px-1.5 py-2 font-mono text-[13px] focus:outline-none"
              {...slugField}
              onChange={(event) => {
                // First keystroke opts out of title-following for good.
                slugTouched.current = true;
                slugField.onChange(event);
              }}
            />
          </div>
          <p role="alert" className="text-destructive font-mono text-[12px]">
            {errors.slug?.message}
          </p>
        </div>

        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-muted-ink font-mono text-[13px]">Category</legend>
              <CategoryTabs value={field.value} onChange={field.onChange} />
            </fieldset>
          )}
        />
      </div>

      {/* Cover — the field holds the R2 object key; the uploader owns the
          presign + PUT flow and keeps a blob preview of the picked file. In
          edit mode the current cover renders from `coverUrl` until replaced. */}
      <Controller
        control={control}
        name="cover"
        render={({ field, fieldState }) => (
          <CoverUploader
            value={field.value}
            initialUrl={coverUrl}
            onChange={(key) => field.onChange(key ?? '')}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-muted-ink font-mono text-[13px]" htmlFor="article-body">
          Body
        </label>
        <Controller
          control={control}
          name="body"
          render={({ field }) => (
            <div
              id="article-body"
              className="border-line-soft overflow-hidden rounded-[16px] border bg-white"
            >
              {/* key remounts Tiptap onto the loaded doc — its `content` prop
                  is initial-only, so without this the edit form would show a
                  blank body even though RHF holds the real value. */}
              <SimpleEditor
                key={editing ? (status ?? 'edit') + initial?.slug : 'new'}
                content={field.value as JSONContent}
                onChange={(value) => field.onChange(value)}
                uploadImage={uploadArticleImage}
              />
            </div>
          )}
        />
        <p role="alert" className="text-destructive font-mono text-[12px]">
          {errors.body?.message}
        </p>
      </div>

      {/* Submit — Save draft keeps it private, Publish sets publishedAt. In
          edit mode a single Update button replaces both: it stays disabled
          until the form is dirty, valid, and idle. */}
      {editing ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          <p
            role="alert"
            className={cn('text-destructive font-mono text-[12px]', !errors.root && 'sr-only')}
          >
            {errors.root?.message}
          </p>
          <button
            type="button"
            disabled={updateDisabled}
            aria-busy={updating}
            title={updateHint}
            onClick={submitUpdate}
            className={cn(
              'border-line-soft from-tile-start to-tile-end text-ink rounded-full border bg-linear-to-b px-4 py-2 font-mono text-[13px] transition-colors',
              'hover:from-white hover:to-white',
              updateDisabled &&
                'hover:from-tile-start hover:to-tile-end cursor-not-allowed opacity-50',
            )}
          >
            {updating ? 'Updating…' : 'Update'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 pt-2">
          <p
            role="alert"
            className={cn('text-destructive font-mono text-[12px]', !errors.root && 'sr-only')}
          >
            {errors.root?.message}
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={formInvalid}
              aria-busy={draftBusy}
              onClick={submitAs('DRAFT')}
              className={cn(
                'border-line-soft text-muted-ink hover:text-ink rounded-full border bg-white px-4 py-2 font-mono text-[13px] transition-colors',
                formInvalid && 'cursor-not-allowed opacity-50',
              )}
            >
              {draftBusy ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              disabled={formInvalid}
              aria-busy={publishBusy}
              onClick={submitAs('PUBLISHED')}
              className={cn(
                'border-line-soft from-tile-start to-tile-end text-ink rounded-full border bg-linear-to-b px-4 py-2 font-mono text-[13px] transition-colors',
                'hover:from-white hover:to-white',
                formInvalid &&
                  'hover:from-tile-start hover:to-tile-end cursor-not-allowed opacity-50',
              )}
            >
              {publishBusy ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
