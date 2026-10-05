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

/**
 * /forgot only accepts an id the server itself generated (a cuid from the
 * RecipientEmail table) — there's nothing for the visitor to type, just a
 * choice to make. Length-capped so a garbage id can't be smuggled through.
 */
export const forgotSchema = z.object({
  recipientEmailId: z.string().min(1, 'Pick an address.').max(64, 'Invalid address.'),
});

export type ForgotForm = z.infer<typeof forgotSchema>;

/**
 * /reset: the token arrives from the emailed link, the passcode follows the
 * same 4–8 rule as /manage/auth (auth.md). Kept as its own schema rather than
 * extending updatePasscodeSchema — that one is .refine()d, and refined schemas
 * don't extend cleanly; the two must evolve together, so a comment pins that.
 */
export const resetPasscodeSchema = z
  .object({
    token: z.string().min(1, 'Missing reset token.').max(128, 'Invalid reset token.'),
    passcode: z.string().min(4, 'At least 4 characters').max(8, 'At most 8 characters'),
    confirm: z.string().min(1, 'Confirm the passcode'),
  })
  .refine((values) => values.passcode === values.confirm, {
    message: 'Passcodes do not match.',
    path: ['confirm'],
  });

export type ResetPasscodeForm = z.infer<typeof resetPasscodeSchema>;

/**
 * Article editor (/manage/new, M6). The five scalar fields — body is Tiptap
 * state and lands with the editor, not as a form field here. excerpt max is
 * 160 because it doubles as the meta description (design.md).
 */
export const ARTICLE_CATEGORIES = ['TECH', 'PERSONAL'] as const;

/**
 * R2 cover rules, shared by the picker (client) and the presign action
 * (server) — one source of truth for what may be uploaded.
 */
export const COVER_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
] as const;
export const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Validates the picked File before any bytes move. */
export const coverFileSchema = z
  .instanceof(File, { message: 'Add a cover image.' })
  .refine(
    (file) => (COVER_MIME_TYPES as readonly string[]).includes(file.type),
    'Cover must be a jpg, png, webp, avif or gif.',
  )
  .refine((file) => file.size <= COVER_MAX_BYTES, 'Cover must be under 5 MB.');

/** The presign request: what the browser is about to PUT to R2. */
export const coverUploadSchema = z.object({
  name: z.string().min(1, 'Missing file name.').max(200, 'File name too long.'),
  type: z.enum(COVER_MIME_TYPES),
  size: z
    .number()
    .int()
    .positive('Missing file size.')
    .max(COVER_MAX_BYTES, 'Cover must be under 5 MB.'),
});

/**
 * The form stores the R2 object key after upload — not the File, not a URL.
 * The public base lives in R2_PUBLIC_URL and is prefixed at render time, so
 * the bucket or CDN can change without a data migration.
 */
export const coverKeySchema = z
  .string()
  .min(1, 'Add a cover image.')
  .regex(
    /^articles\/covers\/[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/,
    'That does not look like a cover image key.',
  );

export const articleBodySchema = z
  .object({
    type: z.literal('doc'),
    content: z.array(z.unknown()),
  })
  .refine((body) => !containsPendingUpload(body), {
    message: 'Wait for image uploads to finish before saving.',
  });

/**
 * An in-flight imageUpload node has no URL yet — saving it would store a
 * dead upload widget. The doc must only contain finished (image) nodes.
 */
function containsPendingUpload(node: unknown): boolean {
  if (Array.isArray(node)) return node.some(containsPendingUpload);
  if (node !== null && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if (record.type === 'imageUpload') return true;
    return Object.values(record).some(containsPendingUpload);
  }
  return false;
}

export const articleSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.').max(120, 'At most 120 characters.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Enter a slug.')
    .max(120, 'At most 120 characters.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only.'),
  excerpt: z
    .string()
    .trim()
    .min(1, 'Enter an excerpt.')
    .max(160, 'At most 160 characters — it doubles as the meta description.'),
  category: z.enum(ARTICLE_CATEGORIES),
  cover: coverKeySchema,
  body: articleBodySchema,
});

export type ArticleForm = z.infer<typeof articleSchema>;
