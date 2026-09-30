import { z } from 'zod';

/** The hard cap from auth.md: at most 5 recovery addresses. */
export const MAX_EMAILS = 5;

/**
 * One schema for both sides: the client resolver renders the messages, the
 * server action re-validates — never trust the browser.
 */
export const addEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter an email address')
    .pipe(z.email('Enter a valid email address')),
});

export type AddEmailForm = z.infer<typeof addEmailSchema>;
