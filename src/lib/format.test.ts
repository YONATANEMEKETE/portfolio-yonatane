import { describe, expect, it } from 'vitest';

import { formatViewCount } from './format';

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
