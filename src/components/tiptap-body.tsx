import type { JSONContent } from '@tiptap/core';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { StarterKit } from '@tiptap/starter-kit';
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string';

import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';

import { ProseAnnotations } from '@/components/prose-annotations';
import { cn } from '@/lib/utils';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function isSafeUrl(value: unknown) {
  if (typeof value !== 'string' || value === '') return false;
  // Relative links + anchors stay on this site — always fine.
  if (value.startsWith('/') || value.startsWith('#')) return true;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

/**
 * Walk the doc and neutralize hostile attrs before rendering: javascript:
 * links, event handlers smuggled into attrs, and non-http(s) image sources
 * all get dropped. In-flight imageUpload placeholders (which validation
 * rejects before they reach the DB) are flattened to their inner content so
 * generateHTML never meets an unknown node. Mutates the passed doc (callers
 * pass a fresh copy).
 */
function sanitizeTiptapDoc(node: unknown): void {
  if (Array.isArray(node)) {
    for (const child of node) sanitizeTiptapDoc(child);
    return;
  }
  if (node === null || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;

  if (Array.isArray(record.marks)) {
    for (const mark of record.marks) {
      if (mark === null || typeof mark !== 'object') continue;
      const markRecord = mark as Record<string, unknown>;
      if (markRecord.type === 'link') {
        const attrs = markRecord.attrs as Record<string, unknown> | undefined;
        if (!attrs || !isSafeUrl(attrs.href)) {
          // Keep the text, drop the link.
          markRecord.type = 'text';
          delete markRecord.attrs;
        }
      }
    }
  }

  if (record.type === 'image') {
    const attrs = (record.attrs ?? {}) as Record<string, unknown>;
    if (!isSafeUrl(attrs.src)) delete attrs.src;
    delete attrs.onError;
    delete attrs.onLoad;
    record.attrs = attrs;
  }

  // An in-flight upload widget has no readable form — flatten it so the
  // renderer never meets an unknown node type.
  if (record.type === 'imageUpload') {
    record.type = 'paragraph';
    delete record.attrs;
  }

  for (const key of ['attrs', 'content']) {
    const value = record[key];
    if (value !== null && typeof value === 'object') sanitizeTiptapDoc(value);
  }
}

/**
 * Render a Tiptap (ProseMirror) JSON body to HTML, with the same extension
 * list the editor writes with — so what the reader sees matches what the
 * writer wrote. Editor-only draft nodes (imageUpload placeholders) never
 * reach the DB (validation rejects them); sanitizeTiptapDoc below strips
 * their wrapper if one ever slips through.
 */
export function renderTiptapBody(body: unknown): string {
  if (body === null || typeof body !== 'object') return '';
  const doc = JSON.parse(JSON.stringify(body)) as JSONContent;
  sanitizeTiptapDoc(doc);

  // renderToHTMLString (not generateHTML): core's renderer touches `document`,
  // which doesn't exist on the server — this one is DOM-free by design.
  return renderToHTMLString({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: { openOnClick: false, enableClickSelection: false },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
    ],
    content: doc,
    options: {
      // imageUpload placeholders are flattened by the sanitizer, but stay
      // silent if an unknown node ever slips through instead of throwing.
      unhandledNode: () => '',
      unhandledMark: ({ node }: { node: { text?: string } }) => node.text ?? '',
    },
  });
}

/**
 * Read-only article body. Styling lives in the shared `.prose` theme, same as
 * project details — the reader inherits the site voice for free.
 */
export function TiptapBody({ body, className }: { body: unknown; className?: string }) {
  const html = renderTiptapBody(body);

  return (
    <ProseAnnotations>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className={cn('prose max-w-none', className)}
      />
    </ProseAnnotations>
  );
}
