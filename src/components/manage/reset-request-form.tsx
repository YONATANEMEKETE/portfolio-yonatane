'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { requestResetLink, type RequestResetLinkResult } from '@/app/(auth)/forgot/actions';
import { cn } from '@/lib/utils';
import { forgotSchema } from '@/lib/validation';

export type MaskedEmail = { id: string; masked: string };

type ForgotFormValues = z.infer<typeof forgotSchema>;

/**
 * The masked picker for /forgot. The server has already done the masking —
 * this component only ever sees `{ id, masked }`, never a raw address
 * (auth.md). On success it swaps the form for the generic confirmation.
 */
export function ResetRequestForm({ emails }: { emails: MaskedEmail[] }) {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { recipientEmailId: emails[0]?.id ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result: RequestResetLinkResult = await requestResetLink(values);

    if (!result.ok) {
      setError('root', { message: result.error });
      return;
    }

    setSentMessage(result.message);
  });

  if (sentMessage) {
    return (
      <p role="status" className="text-ink font-mono text-[13px] leading-relaxed">
        {sentMessage}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <fieldset disabled={isSubmitting} className="flex flex-col gap-2">
        {emails.map((email) => (
          <label
            key={email.id}
            className="border-line-soft hover:border-brand flex cursor-pointer items-center gap-3 rounded-full border px-4 py-2 transition-colors"
          >
            <input
              type="radio"
              value={email.id}
              {...register('recipientEmailId')}
              className="accent-brand size-4 cursor-pointer"
            />
            <span className="text-ink font-mono text-[13px]">{email.masked}</span>
          </label>
        ))}
      </fieldset>

      {errors.recipientEmailId && (
        <p role="alert" className="text-destructive font-mono text-[12px]">
          {errors.recipientEmailId.message}
        </p>
      )}

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
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </div>
    </form>
  );
}
