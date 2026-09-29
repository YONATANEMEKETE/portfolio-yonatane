import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  recordPageView: vi.fn(),
  getViewCount: vi.fn(),
}));

vi.mock('@/lib/views', () => ({
  recordPageView: mocks.recordPageView,
  getViewCount: mocks.getViewCount,
}));

const { GET, POST } = await import('./route');

function post(body: string) {
  return POST(
    new Request('http://localhost/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  it('records the path and returns the fresh count in one round trip', async () => {
    const response = await post(JSON.stringify({ path: '/projects' }));

    expect(mocks.recordPageView).toHaveBeenCalledWith('/projects');
    expect(await response.json()).toEqual({ count: 42 });
  });

  it('falls back to the root path for a missing or invalid path', async () => {
    await post(JSON.stringify({ path: 'not-a-path' }));
    await post(JSON.stringify({}));

    expect(mocks.recordPageView).toHaveBeenNthCalledWith(1, '/');
    expect(mocks.recordPageView).toHaveBeenNthCalledWith(2, '/');
  });

  it('survives a malformed body', async () => {
    const response = await post('{ not json');

    expect(mocks.recordPageView).toHaveBeenCalledWith('/');
    expect(response.status).toBe(200);
  });

  it('returns 503 when the insert fails', async () => {
    mocks.recordPageView.mockRejectedValue(new Error('write failed'));

    const response = await post(JSON.stringify({ path: '/' }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ count: null });
  });
});
