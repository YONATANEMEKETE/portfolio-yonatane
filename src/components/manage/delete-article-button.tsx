'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteArticle } from '@/app/(private)/manage/delete-actions';
import { AlertDialog } from '@/components/manage/alert-dialog';

/**
 * Delete icon button for one manage card. Click opens a confirm dialog
 * (native <dialog>, focus-trapped, Esc/backdrop to dismiss) — the destructive
 * action never fires from a bare icon click. Confirming deletes and refreshes
 * the server list so the row drops out; a failure surfaces inside the dialog.
 */
export function DeleteArticleButton({
  id,
  title,
  className,
}: {
  id: string;
  title: string;
  className: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await deleteArticle(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError('Could not delete the article. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        title="Delete article"
        aria-label={`Delete ${title}`}
        aria-haspopup="dialog"
        className={className}
      >
        <Trash2 aria-hidden className="size-4" />
      </button>

      <AlertDialog
        open={open}
        title="Delete this article?"
        description={`“${title}” will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        pending={pending}
        error={error}
        onConfirm={onConfirm}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
      />
    </>
  );
}
