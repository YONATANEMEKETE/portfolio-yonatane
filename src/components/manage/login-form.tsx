'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { login, type LoginResult } from '@/app/(auth)/manage/login/actions';
import { loginSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { passcode: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result: LoginResult = await login(values);

    if (!result.ok) {
      setError('root', { message: result.error });
      return;
    }

    // The action's Set-Cookie has been stored by now (the await resolved with
    // the response), so this RSC navigation to /manage already carries it —
    // proxy.ts lets it through, the layout does the real session check.
    router.push('/manage');
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <div>
        <label htmlFor="login-passcode" className="sr-only">
          Passcode
        </label>
        <input
          id="login-passcode"
          type="password"
          autoComplete="current-password"
          placeholder="Passcode"
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

      <div className="flex items-center justify-between gap-3">
        <p
          role="alert"
          className={cn('text-destructive font-mono text-[12px]', !errors.root && 'sr-only')}
        >
          {errors.root?.message}
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
          {isSubmitting ? 'Checking…' : 'Unlock'}
        </button>
      </div>
    </form>
  );
}
