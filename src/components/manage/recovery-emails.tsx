'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import {
  addRecipientEmail,
  removeRecipientEmail,
  type RecoveryEmailRow,
} from '@/app/(private)/manage/auth/actions';
import { addEmailSchema, MAX_EMAILS } from '@/lib/validation';
import { cn } from '@/lib/utils';

type AddEmailForm = z.infer<typeof addEmailSchema>;

/**
 * The recovery-emails manager: list from the DB (passed in by the server
 * page), add/remove through server actions. Client validation renders the
 * friendly messages; the server re-validates and owns the real rules (cap,
 * uniqueness).
 */
export function RecoveryEmails({ initialEmails }: { initialEmails: RecoveryEmailRow[] }) {
  const [emails, setEmails] = useState<RecoveryEmailRow[]>(initialEmails);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AddEmailForm>({
    resolver: zodResolver(addEmailSchema),
    defaultValues: { email: '' },
  });

  const full = emails.length >= MAX_EMAILS;
  const busy = isSubmitting || removingId !== null;

  const onSubmit = handleSubmit(async (values) => {
    if (full) {
      return;
    }
    if (emails.some((row) => row.email === values.email)) {
      setError('email', { message: 'Already on the list.' });
      return;
    }

    const result = await addRecipientEmail(values);

    if (!result.ok) {
      setError('root', { message: result.error });
      return;
    }

    clearErrors();
    setEmails((current) => [...current, result.email]);
    reset({ email: '' });
  });

  const onRemove = async (id: string) => {
    setRemovingId(id);
    const result = await removeRecipientEmail(id);
    setRemovingId(null);

    if (!result.ok) {
      setError('root', { message: result.error });
      return;
    }

    clearErrors();
    setEmails((current) => current.filter((row) => row.id !== id));
  };

  const errorMessage = errors.email?.message ?? errors.root?.message;

  return (
    <div className="mt-4">
      <form onSubmit={onSubmit} noValidate className="flex items-start gap-2">
        <div className="grow">
          <label htmlFor="recovery-email" className="sr-only">
            Recovery email
          </label>
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={full || busy}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? 'recovery-email-error' : undefined}
            {...register('email')}
            className={cn(
              'border-line-soft placeholder:text-faint w-full rounded-full border bg-white px-4 py-2 font-mono text-[13px] transition-colors',
              'focus:border-brand focus:outline-none',
              errors.email && 'border-destructive',
              (full || busy) && 'opacity-50',
            )}
          />
        </div>
        <button
          type="submit"
          disabled={full || busy}
          aria-busy={isSubmitting}
          className={cn(
            'border-line-soft from-tile-start to-tile-end text-ink shrink-0 rounded-full border bg-linear-to-b px-4 py-2 font-mono text-[13px] transition-colors',
            'hover:from-white hover:to-white',
            (full || busy) &&
              'hover:from-tile-start hover:to-tile-end cursor-not-allowed opacity-50',
          )}
        >
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      <p
        id="recovery-email-error"
        role="alert"
        className={cn('text-destructive mt-2 font-mono text-[12px]', !errorMessage && 'sr-only')}
      >
        {errorMessage}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-muted-ink font-mono text-[12px]">
          {emails.length} / {MAX_EMAILS}
        </p>
        {full && (
          <p className="text-muted-ink font-mono text-[12px]">
            Limit reached — remove one to add another.
          </p>
        )}
      </div>

      {emails.length === 0 ? (
        <div className="border-line-soft text-muted-ink mt-3 flex items-center justify-center rounded-[12px] border border-dashed py-8 font-mono text-[13px]">
          No addresses yet.
        </div>
      ) : (
        <ul className="border-line-soft divide-line-soft mt-3 divide-y rounded-[12px] border">
          {emails.map((row) => {
            const removing = removingId === row.id;

            return (
              <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-ink font-mono text-[13px] break-all">{row.email}</span>
                <button
                  type="button"
                  onClick={() => void onRemove(row.id)}
                  disabled={busy}
                  aria-busy={removing}
                  className={cn(
                    'text-muted-ink hover:text-destructive shrink-0 font-mono text-[12px] transition-colors',
                    busy && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
