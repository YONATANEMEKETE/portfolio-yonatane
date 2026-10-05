import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  articleImageKey,
  coverKey,
  coverPublicUrl,
  presignCoverUpload,
  PRESIGN_EXPIRES_SECONDS,
} from './r2';

beforeEach(() => {
  vi.stubEnv('R2_ACCOUNT_ID', 'test-account');
  vi.stubEnv('R2_ACCESS_KEY_ID', 'test-key');
  vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-secret');
  vi.stubEnv('R2_BUCKET_NAME', 'portfolio-yonatan');
  vi.stubEnv('R2_PUBLIC_URL', 'https://pub.example.r2.dev');
});

describe('coverKey', () => {
  it('builds articles/covers/<slug>-<8 hex>.<ext>', () => {
    expect(coverKey('My Post!.png', 'image/png')).toMatch(
      /^articles\/covers\/my-post-[0-9a-f]{8}\.png$/,
    );
  });

  it('maps mime types to extensions and falls back to "cover" for non-latin names', () => {
    expect(coverKey('日本語.jpg', 'image/jpeg')).toMatch(
      /^articles\/covers\/cover-[0-9a-f]{8}\.jpg$/,
    );
    expect(coverKey('photo', 'image/webp')).toMatch(/\.webp$/);
  });

  it('is unique per call so a re-upload never overwrites an existing object', () => {
    expect(coverKey('cover.png', 'image/png')).not.toBe(coverKey('cover.png', 'image/png'));
  });
});

describe('coverPublicUrl', () => {
  it('prefixes the public base without double slashes', () => {
    expect(coverPublicUrl('articles/covers/x.png')).toBe(
      'https://pub.example.r2.dev/articles/covers/x.png',
    );

    vi.stubEnv('R2_PUBLIC_URL', 'https://pub.example.r2.dev/');
    expect(coverPublicUrl('articles/covers/x.png')).toBe(
      'https://pub.example.r2.dev/articles/covers/x.png',
    );
  });

  it('throws when the base is not configured', () => {
    vi.stubEnv('R2_PUBLIC_URL', undefined);
    expect(() => coverPublicUrl('articles/covers/x.png')).toThrow('R2_PUBLIC_URL');
  });
});

describe('articleImageKey', () => {
  it('keeps inline images in their own R2 prefix', () => {
    expect(articleImageKey('Body image.webp', 'image/webp')).toMatch(
      /^articles\/images\/body-image-[0-9a-f]{8}\.webp$/,
    );
  });
});

describe('presignCoverUpload', () => {
  it('signs a short-lived PUT against the bucket (no network — signing is local)', async () => {
    const { key, uploadUrl } = await presignCoverUpload({ name: 'My Post.png', type: 'image/png' });

    expect(key).toMatch(/^articles\/covers\/my-post-[0-9a-f]{8}\.png$/);
    // Bucket-hostname endpoint used by R2's presigned browser-upload flow.
    expect(uploadUrl).toContain('https://portfolio-yonatan.test-account.r2.cloudflarestorage.com/');
    expect(uploadUrl).toContain(`X-Amz-Expires=${PRESIGN_EXPIRES_SECONDS}`);
    expect(uploadUrl).toContain('X-Amz-Signature=');
    // No SDK default checksum in the query — it would poison the browser's PUT.
    expect(uploadUrl).not.toContain('x-amz-checksum');
  });
});
