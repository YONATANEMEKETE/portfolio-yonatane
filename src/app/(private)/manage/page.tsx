// Blogs role of /manage: article list, search, filters, editor (M6).
export default function ManagePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-[26px] leading-[34px]">Blogs</h1>
          <p className="text-muted-ink font-mono text-[14px]">Articles, drafts and publishing.</p>
        </div>
        <span className="border-line-soft text-muted-ink rounded-full border bg-white px-4 py-1.5 font-mono text-[13px]">
          + New article
        </span>
      </div>

      {/* Placeholder list — real rows, filters and search land in M6. */}
      <div className="border-line-soft text-muted-ink flex items-center justify-center rounded-[16px] border bg-white py-20 font-mono text-[13px]">
        No articles yet — the editor and list land here in M6.
      </div>
    </div>
  );
}
