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

/**
 * The passcode is 4–8 characters (Yonatane's call — shorter than the original
 * min-8 spec in auth.md; argon2id + the M4 login lockout carry the load).
 * `confirm` exists so a typo in a masked field can't lock the owner out.
 */
export const updatePasscodeSchema = z
  .object({
    passcode: z.string().min(4, 'At least 4 characters').max(8, 'At most 8 characters'),
    confirm: z.string().min(1, 'Confirm the passcode'),
  })
  .refine((values) => values.passcode === values.confirm, {
    message: 'Passcodes do not match.',
    path: ['confirm'],
  });

export type UpdatePasscodeForm = z.infer<typeof updatePasscodeSchema>;

/**
 * Login only demands a non-empty string: the 4–8 rule is enforced when the
 * passcode is *set*, and an odd-length value should fail as "wrong passcode"
 * rather than as a validation message.
 */
export const loginSchema = z.object({
  passcode: z.string().min(1, 'Enter the passcode.').max(128, 'Passcode too long.'),
});

export type LoginForm = z.infer<typeof loginSchema>;
