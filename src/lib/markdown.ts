import { readFile } from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

/** Markdown content lives at the repo root, committed rather than edited in /manage. */
const contentDir = path.join(process.cwd(), 'content');

/**
 * The one pipeline, used for `content/**\/*.md` and article bodies alike.
 *
 * Order matters: rehype-sanitize runs before rehype-pretty-code, so it strips
 * anything the markdown carried while still leaving the `language-*` class that
 * Shiki needs, and Shiki's own output is never sanitized away. Pretty code is
 * async, which is why this returns a promise rather than React nodes.
 */
export async function renderMarkdown(source: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypePrettyCode, { theme: 'github-light', keepBackground: false })
    .use(rehypeStringify)
    .process(source);

  return String(file);
}

/** Frontmatter is parsed the same way for every content file. */
export function parseFrontmatter<T extends Record<string, unknown>>(raw: string) {
  const { data, content } = matter(raw);

  return { data: data as T, content };
}

export async function readMarkdownFile<T extends Record<string, unknown>>(filePath: string) {
  const raw = await readFile(path.join(contentDir, filePath), 'utf8');

  return parseFrontmatter<T>(raw);
}
