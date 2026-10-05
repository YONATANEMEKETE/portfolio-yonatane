import type { UploadFunction } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';

type ArticleImageResponse = {
  url?: string;
  error?: string;
};

/** Uploads an inline article image through the authenticated R2-backed route. */
export const uploadArticleImage: UploadFunction = async (file, onProgress, abortSignal) => {
  const form = new FormData();
  form.append('file', file);
  onProgress?.({ progress: 10 });

  const response = await fetch('/api/manage/article-image', {
    method: 'POST',
    body: form,
    signal: abortSignal,
  });
  const result = (await response.json().catch(() => null)) as ArticleImageResponse | null;

  if (!response.ok || !result?.url) {
    throw new Error(result?.error ?? `Image upload failed (HTTP ${response.status}).`);
  }

  onProgress?.({ progress: 100 });
  return result.url;
};
