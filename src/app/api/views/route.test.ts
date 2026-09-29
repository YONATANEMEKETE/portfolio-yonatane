import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  recordPageView: vi.fn(),
  getViewCount: vi.fn(),
}));

// The real getClientIp runs here; only the database calls are stubbed.
vi.mock('@/lib/views', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/views')>()),
  recordPageView: mocks.recordPageView,
  getViewCount: mocks.getViewCount,
}));

const { GET, POST } = await import('./route');

function post(body: string, ip?: string) {
  return POST(
    new Request('http://localhost/api/views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ip ? { 'x-forwarded-for': ip } : {}),
      },
      body,
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getViewCount.mockResolvedValue(42);
});

describe('GET /api/views', () => {
  it('returns the current count', async () => {
    const response = await GET();

    expect(await response.json()).toEqual({ count: 42 });
    expect(response.status).toBe(200);
  });

  it('degrades to 503 instead of throwing when the database fails', async () => {
    mocks.getViewCount.mockRejectedValue(new Error('no database'));

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ count: null });
  });
});

describe('POST /api/views', () => {
  it('records the path with the visitor ip and returns the fresh count', async () => {
    const response = await post(JSON.stringify({ path: '/projects' }), '203.0.113.7, 10.0.0.1');

    // Dedupe keys off the client address, not the proxy hops behind it.
    expect(mocks.recordPageView).toHaveBeenCalledWith({ path: '/projects', ip: '203.0.113.7' });
    expect(await response.json()).toEqual({ count: 42 });
  });

  it('falls back to a local marker when no proxy header is present', async () => {
    await post(JSON.stringify({ path: '/' }));

    expect(mocks.recordPageView).toHaveBeenCalledWith({ path: '/', ip: 'local' });
  });

  it('falls back to the root path for a missing or invalid path', async () => {
    await post(JSON.stringify({ path: 'not-a-path' }), '203.0.113.7');
    await post(JSON.stringify({}), '203.0.113.7');

    expect(mocks.recordPageView).toHaveBeenNthCalledWith(1, {
      path: '/',
      ip: '203.0.113.7',
    });
    expect(mocks.recordPageView).toHaveBeenNthCalledWith(2, {
      path: '/',
      ip: '203.0.113.7',
    });
  });

  it('survives a malformed body', async () => {
    const response = await post('{ not json', '203.0.113.7');

    expect(mocks.recordPageView).toHaveBeenCalledWith({ path: '/', ip: '203.0.113.7' });
    expect(response.status).toBe(200);
  });

  it('returns 503 when the insert fails', async () => {
    mocks.recordPageView.mockRejectedValue(new Error('write failed'));

    const response = await post(JSON.stringify({ path: '/' }), '203.0.113.7');

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ count: null });
  });
});
