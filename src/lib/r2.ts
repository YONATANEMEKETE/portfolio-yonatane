import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'node:crypto';

import { COVER_MIME_TYPES } from '@/lib/validation';

/**
 * R2 via its S3-compatible API. The bucket (portfolio-yonatan) is public, so
 * reads are plain URLs; only uploads go through signing: the server hands the
 * browser a presigned PUT and the file travels straight to R2 — bytes never
 * pass through this app (see (private)/manage/new/actions.ts).
 *
 * Credentials: the Access Key ID / Secret pair (S3 API), not the R2 API token.
 * Region is "auto" for every R2 endpoint.
 */

const EXT_BY_TYPE: Record<(typeof COVER_MIME_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

/** Presigned PUTs are short-lived — the browser uploads immediately after. */
export const PRESIGN_EXPIRES_SECONDS = 5 * 60;

let client: S3Client | null = null;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`r2: ${name} is not set.`);
  return value;
}

function getClient() {
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    // Let the SDK use R2's bucket-hostname endpoint. This is the form shown
    // in Cloudflare's presigned browser-upload examples and avoids redirects
    // that can leave a cross-origin PUT pending in the browser.
    // The SDK's default CRC32 prefill would land in the presigned query and
    // make the browser's PUT fail checksum validation on the real body.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
  return client;
}

/** Public URL for a key — the bucket is public, so nothing is signed to read. */
export function coverPublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error('r2: R2_PUBLIC_URL is not set.');
  return `${base.replace(/\/+$/, '')}/${key}`;
}

/** Filename → key-safe slug; non-latin names fall back to "cover". */
function slugBase(name: string) {
  const slug = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return slug || 'cover';
}

/**
 * articles/covers/<slug>-<8 hex>.<ext> — the random suffix makes keys unique
 * so re-uploading "cover.png" never overwrites yesterday's object (and never
 * fights the browser cache).
 */
export function coverKey(name: string, type: (typeof COVER_MIME_TYPES)[number]) {
  return `articles/covers/${slugBase(name)}-${randomBytes(4).toString('hex')}.${EXT_BY_TYPE[type]}`;
}

export function articleImageKey(name: string, type: (typeof COVER_MIME_TYPES)[number]) {
  return `articles/images/${slugBase(name)}-${randomBytes(4).toString('hex')}.${EXT_BY_TYPE[type]}`;
}

/**
 * The presigned PUT. What actually makes it safe: the key is random and
 * unguessable, the rules (type/size) were validated server-side before
 * signing, and the URL dies in 5 minutes. Note the signature binds only the
 * host + query (UNSIGNED-PAYLOAD) — Content-Type is not cryptographically
 * bound; the browser sends the declared type so the object lands with the
 * right metadata, and the type itself was already checked above.
 */
export async function presignCoverUpload({
  name,
  type,
}: {
  name: string;
  type: (typeof COVER_MIME_TYPES)[number];
}) {
  const key = coverKey(name, type);
  const uploadUrl = await getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: requireEnv('R2_BUCKET_NAME'), Key: key, ContentType: type }),
    { expiresIn: PRESIGN_EXPIRES_SECONDS },
  );

  return { key, uploadUrl };
}

export async function presignArticleImageUpload({
  name,
  type,
}: {
  name: string;
  type: (typeof COVER_MIME_TYPES)[number];
}) {
  const key = articleImageKey(name, type);
  const uploadUrl = await getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: requireEnv('R2_BUCKET_NAME'), Key: key, ContentType: type }),
    { expiresIn: PRESIGN_EXPIRES_SECONDS },
  );

  return { key, uploadUrl };
}

export function articleImagePublicUrl(key: string) {
  return coverPublicUrl(key);
}
