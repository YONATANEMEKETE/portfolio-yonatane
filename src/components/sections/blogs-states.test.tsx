import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BlogsError } from './blogs-error';
import { BlogsSkeleton } from './blogs-skeleton';
import { EmptyBlogs } from './empty-blogs';

describe('EmptyBlogs', () => {
  it('renders empty message and link to all blogs', () => {
    const html = renderToStaticMarkup(<EmptyBlogs />);

    expect(html).toContain('No featured blogs yet');
    expect(html).toContain('href="/blogs"');
    expect(html).toContain('View all blogs');
  });
});

describe('BlogsError', () => {
  it('renders error notice and link to archive', () => {
    const html = renderToStaticMarkup(<BlogsError />);

    expect(html).toContain('Writing is unavailable right now');
    expect(html).toContain('href="/blogs"');
    expect(html).toContain('Browse archive');
  });
});

describe('BlogsSkeleton', () => {
  it('renders accessible loading state with skeleton rows', () => {
    const html = renderToStaticMarkup(<BlogsSkeleton />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading featured blogs…"');
    expect(html).toContain('animate-pulse');
  });
});
