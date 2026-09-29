import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ createMany: vi.fn() }));

vi.mock('@/lib/prisma', () => ({
  getPrisma: () => ({ pageView: { createMany: mocks.createMany } }),
}));

const { getClientIp, hashVisitor, recordPageView, utcDay } = await import('./views');

function headers(values: Record<string, string>) {
  return new Headers(values);
}

beforeEach(() => {
  process.env.VIEW_HASH_SALT = 'test-salt';
  mocks.createMany.mockReset();
});

afterEach(() => {
  delete process.env.VIEW_HASH_SALT;
});

describe('getClientIp', () => {
  it('takes the first address in x-forwarded-for', () => {
    expect(getClientIp(headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    );
  });

  it('falls back to cloudflare then x-real-ip, then a local marker', () => {
    expect(getClientIp(headers({ 'cf-connecting-ip': '198.51.100.4' }))).toBe('198.51.100.4');
    expect(getClientIp(headers({ 'x-real-ip': '198.51.100.9' }))).toBe('198.51.100.9');
    expect(getClientIp(headers({}))).toBe('local');
  });
});

describe('hashVisitor', () => {
  it('is stable for the same ip so dedupe survives restarts', () => {
    expect(hashVisitor('203.0.113.7')).toBe(hashVisitor('203.0.113.7'));
  });

  it('differs per ip', () => {
    expect(hashVisitor('203.0.113.7')).not.toBe(hashVisitor('203.0.113.8'));
  });

  it('never stores a raw ip', () => {
    expect(hashVisitor('203.0.113.7')).not.toContain('203.0.113.7');
  });

  it('refuses to hash without a salt', () => {
    delete process.env.VIEW_HASH_SALT;

    expect(() => hashVisitor('203.0.113.7')).toThrow(/VIEW_HASH_SALT/);
  });
});

describe('utcDay', () => {
  it('buckets to midnight UTC', () => {
    expect(utcDay(new Date('2026-09-29T23:59:59Z')).toISOString()).toBe('2026-09-29T00:00:00.000Z');
    expect(utcDay(new Date('2026-09-30T00:00:01Z')).toISOString()).toBe('2026-09-30T00:00:00.000Z');
  });

  it('does not use local midnight', () => {
    // Same instant, so the same bucket regardless of the host timezone.
    expect(utcDay(new Date('2026-09-29T23:59:59Z')).getTime()).toBe(
      utcDay(new Date('2026-09-29T23:59:59+00:00')).getTime(),
    );
  });
});

describe('recordPageView', () => {
  it('relies on the unique constraint to ignore repeat visits', async () => {
    mocks.createMany.mockResolvedValue({ count: 1 });

    const created = await recordPageView({ path: '/projects', ip: '203.0.113.7' });

    expect(mocks.createMany).toHaveBeenCalledWith({
      data: [
        {
          path: '/projects',
          visitorHash: hashVisitor('203.0.113.7'),
          day: utcDay(),
        },
      ],
      skipDuplicates: true,
    });
    expect(created).toBe(1);
  });

  it('reports zero when the visitor already counted today', async () => {
    mocks.createMany.mockResolvedValue({ count: 0 });

    expect(await recordPageView({ path: '/', ip: '203.0.113.7' })).toBe(0);
  });
});
