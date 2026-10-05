import { ArticleForm } from '@/components/manage/article-form';

// New article editor (M6) — metadata form below; Tiptap body + submit land next.
export default function NewArticlePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-ink text-[26px] leading-[34px]">New article</h1>
        <p className="text-muted-ink font-mono text-[14px]">Write and publish a new post.</p>
      </div>

      <ArticleForm />
    </div>
  );
}
