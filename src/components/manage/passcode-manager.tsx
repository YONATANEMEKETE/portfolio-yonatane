'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { updatePasscode, type UpdatePasscodeResult } from '@/app/(private)/manage/auth/actions';
import { updatePasscodeSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';

type UpdatePasscodeForm = z.infer<typeof updatePasscodeSchema>;

const updatedFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * Shows the passcode's *state* (set / when it was last changed — never the
 * value: only an argon2id hash exists) and lets the owner rotate it.
 */
export function PasscodeManager({ passcodeUpdatedAt }: { passcodeUpdatedAt: string | null }) {
  const [updatedAt, setUpdatedAt] = useState<string | null>(passcodeUpdatedAt);
  const [justSaved, setJustSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasscodeForm>({
    resolver: zodResolver(updatePasscodeSchema),
    defaultValues: { passcode: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setJustSaved(false);

    const result: UpdatePasscodeResult = await updatePasscode(values);

    if (!result.ok) {
      setError('root', { message: result.error });
      return;
    }

    clearErrors();
    setUpdatedAt(result.updatedAt);
    setJustSaved(true);
    reset({ passcode: '', confirm: '' });
  });

  const errorMessage = errors.passcode?.message ?? errors.confirm?.message ?? errors.root?.message;

  return (
    <div className="mt-4">
      <p className="text-muted-ink flex items-center gap-2 font-mono text-[13px]">
        <span
          aria-hidden
          className={cn('size-2 rounded-full', updatedAt ? 'bg-success' : 'bg-warning')}
        />
        {updatedAt
          ? `Set · updated ${updatedFormatter.format(new Date(updatedAt))}`
          : 'No passcode set yet'}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-3 flex flex-col gap-2">
        <div>
          <label htmlFor="new-passcode" className="sr-only">
            New passcode
          </label>
          <input
            id="new-passcode"
            type="password"
            autoComplete="new-password"
            placeholder="New passcode (4–8 characters)"
            disabled={isSubmitting}
            aria-invalid={errors.passcode ? true : undefined}
            {...register('passcode')}
            className={cn(
              'border-line-soft placeholder:text-faint w-full rounded-full border bg-white px-4 py-2 font-mono text-[13px] transition-colors',
              'focus:border-brand focus:outline-none',
              errors.passcode && 'border-destructive',
              isSubmitting && 'opacity-50',
            )}
          />
        </div>

        <div>
          <label htmlFor="confirm-passcode" className="sr-only">
            Confirm new passcode
          </label>
          <input
            id="confirm-passcode"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new passcode"
            disabled={isSubmitting}
            aria-invalid={errors.confirm ? true : undefined}
            {...register('confirm')}
            className={cn(
              'border-line-soft placeholder:text-faint w-full rounded-full border bg-white px-4 py-2 font-mono text-[13px] transition-colors',
              'focus:border-brand focus:outline-none',
              errors.confirm && 'border-destructive',
              isSubmitting && 'opacity-50',
            )}
          />
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <p
            role="alert"
            className={cn('text-destructive font-mono text-[12px]', !errorMessage && 'sr-only')}
          >
            {errorMessage}
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={cn(
              'border-line-soft from-tile-start to-tile-end text-ink shrink-0 rounded-full border bg-linear-to-b px-4 py-2 font-mono text-[13px] transition-colors',
              'hover:from-white hover:to-white',
              isSubmitting &&
                'hover:from-tile-start hover:to-tile-end cursor-not-allowed opacity-50',
            )}
          >
            {isSubmitting ? 'Saving…' : 'Update'}
          </button>
        </div>
      </form>

      <p
        role="status"
        className={cn('text-success mt-2 font-mono text-[12px]', !justSaved && 'sr-only')}
      >
        Passcode updated.
      </p>
    </div>
  );
}
