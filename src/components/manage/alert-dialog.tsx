'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Minimal confirm dialog on the native <dialog> element — no new dependency.
 * `showModal()` traps focus and closes on Esc for free; `onClose` fires for
 * every dismissal (Cancel click, Esc, backdrop) so the caller can clear its
 * pending/error state. The panel matches the manage cards (white, 16px
 * radius, soft border, mono microcopy).
 */
export function AlertDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  pending = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // <dialog> is imperative: mirror the `open` prop onto showModal/close.
  // The guards make a stray re-run (or an Esc-close that already shut it) a
  // no-op rather than a re-open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Focus the safe choice first (Cancel) — destructive dialogs should
      // never land focus on the danger button.
      dialog.querySelector<HTMLButtonElement>('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      onClose={onClose}
      onClick={(event) => {
        // Backdrop click: the click target is the <dialog> itself, not the panel.
        if (event.target === event.currentTarget && !pending) event.currentTarget.close();
      }}
      className="border-line-soft m-auto rounded-[16px] border bg-white p-0 shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop:bg-black/40"
    >
      <div className="flex w-[min(22rem,calc(100vw-3rem))] flex-col gap-3 p-5">
        <h2 id="alert-dialog-title" className="text-ink text-[16px] leading-[22px] font-medium">
          {title}
        </h2>
        <p id="alert-dialog-description" className="text-muted-ink font-mono text-[13px]">
          {description}
        </p>
        {error && (
          <p role="alert" className="text-destructive font-mono text-[12px]">
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            data-autofocus
            disabled={pending}
            onClick={() => dialogRef.current?.close()}
            className={cn(
              'border-line-soft text-muted-ink hover:text-ink rounded-full border bg-white px-4 py-1.5 font-mono text-[13px] transition-colors',
              pending && 'cursor-not-allowed opacity-50',
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            aria-busy={pending}
            onClick={onConfirm}
            className={cn(
              'bg-destructive rounded-full px-4 py-1.5 font-mono text-[13px] text-white transition-opacity',
              pending ? 'cursor-wait opacity-70' : 'hover:opacity-90',
            )}
          >
            {pending ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
