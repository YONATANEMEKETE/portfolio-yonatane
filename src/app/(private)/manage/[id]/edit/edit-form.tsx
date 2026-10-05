'use client';

import { ArticleForm, type ArticleFormValues } from '@/components/manage/article-form';

import { updateArticle } from './actions';

/**
 * Client island for the edit page: binds the row id to the shared
 * ArticleForm in edit mode so the server component above stays async.
 */
export function EditArticleForm({
  id,
  initial,
  status,
  coverUrl,
}: {
  id: string;
  initial: ArticleFormValues;
  status: 'DRAFT' | 'PUBLISHED';
  coverUrl: string;
}) {
  return (
    <ArticleForm
      initial={initial}
      status={status}
      coverUrl={coverUrl}
      onUpdate={(values) => updateArticle(id, values)}
    />
  );
}
