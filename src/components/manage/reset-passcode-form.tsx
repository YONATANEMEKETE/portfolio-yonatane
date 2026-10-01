'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { resetPasscode, type ResetPasscodeResult } from '@/app/(auth)/reset/actions';
import { cn } from '@/lib/utils';
import { resetPasscodeSchema } from '@/lib/validation';

type ResetFormValues = z.infer<typeof resetPasscodeSchema>;

/**
 * The new-passcode form behind a valid ?token= on /reset. Same rules as the
 * /manage/auth passcode manager (4–8 chars + confirm); on success the action
 * has already set a fresh session cookie, so this navigates to /manage the
 * same way the login form does.
 */
export function ResetPasscodeForm({ token }: { token: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasscodeSchema),
    defaultValues: { token, passcode: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result: ResetPasscodeResult = await resetPasscode(values);

    if (!result.ok) {
      setError('root', { message: result.error });
      return;
    }

    // The action's Set-Cookie has been stored by now, so this navigation
    // carries the fresh session — proxy.ts and the layout let it through.
    router.push('/manage');
    router.refresh();
  });

  const errorMessage = errors.passcode?.message ?? errors.confirm?.message ?? errors.root?.message;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      <input type="hidden" {...register('token')} />

      <div>
        <label htmlFor="reset-passcode" className="sr-only">
          New passcode
        </label>
        <input
          id="reset-passcode"
          type="password"
          autoComplete="new-password"
          placeholder="New passcode (4–8 characters)"
          autoFocus
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
        <label htmlFor="reset-confirm" className="sr-only">
          Confirm new passcode
        </label>
        <input
          id="reset-confirm"
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
            isSubmitting && 'hover:from-tile-start hover:to-tile-end cursor-not-allowed opacity-50',
          )}
        >
          {isSubmitting ? 'Resetting…' : 'Reset passcode'}
        </button>
      </div>
    </form>
  );
}
