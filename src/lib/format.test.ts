import { describe, expect, it } from 'vitest';

import { countBodyWords, formatArticleDate, formatReadTime, formatViewCount } from './format';

describe('formatViewCount', () => {
  it('formats small counts unchanged', () => {
    expect(formatViewCount(0)).toBe('0');
    expect(formatViewCount(7)).toBe('7');
    expect(formatViewCount(999)).toBe('999');
  });

  it('groups thousands', () => {
    expect(formatViewCount(12480)).toBe('12,480');
    expect(formatViewCount(1234567)).toBe('1,234,567');
  });
});

describe('formatArticleDate', () => {
  it('renders short month and year', () => {
    expect(formatArticleDate('2026-03-14T00:00:00.000Z')).toBe('Mar 2026');
    expect(formatArticleDate(new Date('2026-01-05T00:00:00.000Z'))).toBe('Jan 2026');
  });
});

describe('countBodyWords', () => {
  it('counts text leaves and skips node metadata', () => {
    const body = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'left', placeholder: 'write something' },
          content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Hello  world' }],
        },
        { type: 'image', attrs: { src: 'cover.png', alt: 'not counted' } },
        { type: 'paragraph', content: [{ type: 'text', text: 'one more' }] },
      ],
    };

    expect(countBodyWords(body)).toBe(4);
  });

  it('returns zero for empty or non-doc input', () => {
    expect(countBodyWords({ type: 'doc', content: [] })).toBe(0);
    expect(countBodyWords(null)).toBe(0);
    expect(countBodyWords('not json')).toBe(0);
  });
});

describe('formatReadTime', () => {
  it('rounds up at 200 words per minute with a one-minute floor', () => {
    const words = (count: number) =>
      Array.from({ length: count }, (_, index) => ({
        type: 'text',
        text: `word${index}`,
      }));
    const doc = (count: number) => ({
      type: 'doc',
      content: [{ type: 'paragraph', content: words(count) }],
    });

    expect(formatReadTime(doc(0))).toBe('1 min read');
    expect(formatReadTime(doc(199))).toBe('1 min read');
    expect(formatReadTime(doc(201))).toBe('2 min read');
    expect(formatReadTime(doc(1800))).toBe('9 min read');
  });

  it('formats explicit numbers with a one-minute floor', () => {
    expect(formatReadTime(0)).toBe('1 min read');
    expect(formatReadTime(6)).toBe('6 min read');
    expect(formatReadTime(15)).toBe('15 min read');
  });
});
