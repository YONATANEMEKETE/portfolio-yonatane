import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import proxy from '@/proxy';

const BASE = 'http://localhost:3000';

function request(path: string, cookie?: string) {
  return new NextRequest(`${BASE}${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe('proxy', () => {
  it('redirects cookie-less /manage requests to the login page', () => {
    for (const path of ['/manage', '/manage/auth', '/manage/blogs']) {
      const response = proxy(request(path));

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(`${BASE}/manage/login`);
    }
  });

  it('lets requests with a session cookie through', () => {
    const response = proxy(request('/manage/auth', 'pf_session=anything'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('always lets the login page through, even cookie-less', () => {
    const response = proxy(request('/manage/login'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('does not touch routes outside /manage', () => {
    const response = proxy(request('/blogs'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('location')).toBeNull();
  });
});
