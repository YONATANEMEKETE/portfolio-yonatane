import { describe, expect, it } from 'vitest';

import { parseFrontmatter, renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders headings, emphasis and lists', async () => {
    const html = await renderMarkdown('# Title\n\nSome *text* and a list:\n\n- one\n- two\n');

    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<em>text</em>');
    expect(html).toContain('<li>one</li>');
  });

  it('renders GFM tables and strikethrough', async () => {
    const html = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |\n\n~~gone~~\n');

    expect(html).toContain('<table>');
    expect(html).toContain('<th>a</th>');
    expect(html).toContain('<del>gone</del>');
  });

  it('highlights fenced code, which proves the language class survives sanitize', async () => {
    const html = await renderMarkdown('```ts\nconst answer: number = 42;\n```\n');

    expect(html).toContain('data-language="ts"');
    // Token colours come from Shiki as inline styles.
    expect(html).toMatch(/<span style="color:/);
    expect(html).toContain('answer');
  });

  it('drops raw html instead of rendering it', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>\n\nplain\n');

    expect(html).not.toContain('<script');
    expect(html).toContain('plain');
  });
});

describe('parseFrontmatter', () => {
  it('splits frontmatter from the body', () => {
    const { data, content } = parseFrontmatter<{ name: string; stack: string[] }>(
      '---\nname: Shipyard\nstack: [Next.js, Prisma]\n---\n\nCase study body.\n',
    );

    expect(data.name).toBe('Shipyard');
    expect(data.stack).toEqual(['Next.js', 'Prisma']);
    expect(content.trim()).toBe('Case study body.');
  });

  it('treats a file without frontmatter as all body', () => {
    const { data, content } = parseFrontmatter('Just prose.\n');

    expect(data).toEqual({});
    expect(content.trim()).toBe('Just prose.');
  });
});
