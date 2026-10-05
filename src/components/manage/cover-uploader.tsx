'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { coverFileSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';

/** A stalled CORS/preflight request should not leave the picker disabled forever. */
const R2_UPLOAD_TIMEOUT_MS = 60_000;

/**
 * Cover picker for the article form. The form field holds the R2 object key;
 * this component owns the flow around it: pick → validate → presign (server
 * action) → PUT straight to R2 → hand the key back through onChange.
 *
 * The preview is a blob URL of the picked File, not the public R2 URL — the
 * key is all the form has, and R2_PUBLIC_URL is server-only. While uploading,
 * the preview shows with a disabled overlay; a failed upload reverts to the
 * plate and shows why.
 *
 * In edit mode the form already holds a key: pass it as `value` with its
 * public URL as `initialUrl` so the current cover renders until the owner
 * picks a replacement (blob preview) or removes it.
 */
export function CoverUploader({
  value,
  initialUrl = null,
  onChange,
  error,
}: {
  value?: string;
  initialUrl?: string | null;
  onChange: (key: string | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const preview = useMemo(() => (picked ? URL.createObjectURL(picked) : null), [picked]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Edit mode: the form already holds a key. Show its public URL until the
  // owner picks a replacement (blob preview wins) or removes it.
  const existing = !preview && value && initialUrl ? initialUrl : null;

  async function upload(file: File) {
    // Client-side first so a bad pick never round-trips; the action re-runs
    // the same rules — the browser is not the authority.
    const parsed = coverFileSchema.safeParse(file);
    if (!parsed.success) {
      setUploadError(parsed.error.issues[0]?.message ?? 'Invalid image.');
      return;
    }

    setUploadError(null);
    setPicked(file);
    setUploading(true);

    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/manage/cover', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(R2_UPLOAD_TIMEOUT_MS),
      });
      const result = (await response.json().catch(() => null)) as {
        key?: string;
        error?: string;
      } | null;
      if (!response.ok || !result?.key) {
        throw new Error(result?.error ?? `Upload failed (HTTP ${response.status}).`);
      }
      onChange(result.key);
    } catch (cause) {
      // Nothing landed in the form — back to the plate with a readable reason.
      setPicked(null);
      setUploadError(uploadErrorMessage(cause));
    } finally {
      setUploading(false);
    }
  }

  function handlePick(file: File | undefined | null) {
    if (!file || uploading) return;
    void upload(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="article-cover" className="text-muted-ink font-mono text-[13px]">
        Cover image
      </label>

      {preview || existing ? (
        <div className="border-line-soft relative aspect-[16/9] overflow-hidden rounded-[16px] border bg-white">
          {preview ? (
            /* blob: preview bypasses the image optimizer, hence unoptimized. */
            <Image src={preview} alt="Cover preview" unoptimized fill className="object-cover" />
          ) : (
            existing && <Image src={existing} alt="Current cover" fill className="object-cover" />
          )}
          {uploading ? (
            <div className="bg-background/70 absolute inset-0 flex items-center justify-center font-mono text-[13px] backdrop-blur-sm">
              Uploading to R2…
            </div>
          ) : (
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="border-line-soft bg-background/80 hover:text-ink rounded-full border px-3 py-1 font-mono text-[12px] backdrop-blur-md transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  setPicked(null);
                  setUploadError(null);
                  onChange(null);
                }}
                className="border-line-soft bg-background/80 text-destructive rounded-full border px-3 py-1 font-mono text-[12px] backdrop-blur-md transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handlePick(event.dataTransfer.files[0]);
          }}
          className={cn(
            'border-line-soft text-muted-ink flex aspect-[16/9] w-full items-center justify-center rounded-[16px] border border-dashed bg-white font-mono text-[13px] transition-colors',
            'hover:text-ink hover:border-brand',
            dragging && 'border-brand text-ink',
            (error || uploadError) && 'border-destructive',
          )}
        >
          Drop an image or click to pick · 16:9 · max 5 MB
        </button>
      )}

      <input
        ref={inputRef}
        id="article-cover"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        onChange={(event) => {
          handlePick(event.target.files?.[0]);
          // Reset so picking the same file again still fires a change event.
          event.target.value = '';
        }}
      />

      <p role="alert" className="text-destructive font-mono text-[12px]">
        {error ?? uploadError}
      </p>
    </div>
  );
}

function uploadErrorMessage(cause: unknown) {
  if (cause instanceof DOMException && cause.name === 'TimeoutError') {
    return 'R2 upload timed out. Check the bucket CORS policy and try again.';
  }

  if (cause instanceof TypeError) {
    return 'Could not reach the upload server. Check your connection and try again.';
  }

  return cause instanceof Error ? cause.message : 'Upload failed — try again.';
}
