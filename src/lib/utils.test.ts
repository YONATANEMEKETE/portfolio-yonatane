import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignores falsy values', () => {
    expect(cn('a', undefined, null, false, '', 'b')).toBe('a b');
  });

  it('lets the last conflicting Tailwind class win', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
