import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sendResetLink } from '@/lib/email';

const sendMock = vi.hoisted(() => vi.fn());
// A constructor mock — the implementation must be a regular function, since
// `new Resend(...)` can't invoke an arrow.
const ResendMock = vi.hoisted(() =>
  vi.fn(function () {
    return { emails: { send: sendMock } };
  }),
);

vi.mock('resend', () => ({ Resend: ResendMock }));

beforeEach(() => {
  vi.clearAllMocks();
  // Defaults for every test: no key (dev-fallback territory), a sender, and
  // non-production. stubEnv keeps TS happy about the read-only NODE_ENV.
  vi.stubEnv('RESEND_API_KEY', undefined);
  vi.stubEnv('EMAIL_FROM', 'Portfolio <onboarding@resend.dev>');
  vi.stubEnv('NODE_ENV', 'test');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function setEnv(values: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(values)) {
    vi.stubEnv(key, value);
  }
}

describe('sendResetLink', () => {
  it('sends from EMAIL_FROM with the link in both text and html', async () => {
    setEnv({ RESEND_API_KEY: 're_test_key' });
    sendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null });
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await sendResetLink({ to: 'me@example.com', url: 'https://site/reset?token=t' });

    expect(result).toEqual({ ok: true });
    expect(ResendMock).toHaveBeenCalledWith('re_test_key');
    expect(sendMock).toHaveBeenCalledTimes(1);

    const payload = sendMock.mock.calls[0]![0]!;
    expect(payload.from).toBe('Portfolio <onboarding@resend.dev>');
    expect(payload.to).toBe('me@example.com');
    expect(payload.subject).toBe('Reset your passcode');
    expect(payload.text).toContain('https://site/reset?token=t');
    expect(payload.html).toContain('https://site/reset?token=t');
    // The URL is also printed as plain text in the html — mail clients strip
    // clickable anchors for localhost/private hosts, so the copyable fallback
    // is load-bearing.
    expect(payload.html).toContain('word-break:break-all');
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('email-1'));
    consoleLog.mockRestore();
  });

  it('maps a Resend API error to a failure without throwing', async () => {
    setEnv({ RESEND_API_KEY: 're_test_key' });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'Monthly quota exceeded', name: 'monthly_quota_exceeded', statusCode: 429 },
    });

    const result = await sendResetLink({ to: 'me@example.com', url: 'https://site/reset?token=t' });

    expect(result).toEqual({ ok: false, error: 'Monthly quota exceeded' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('maps a thrown network error to a failure without throwing', async () => {
    setEnv({ RESEND_API_KEY: 're_test_key' });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    sendMock.mockRejectedValue(new Error('fetch failed'));

    const result = await sendResetLink({ to: 'me@example.com', url: 'https://site/reset?token=t' });

    expect(result).toEqual({ ok: false, error: 'fetch failed' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('falls back to logging the link outside production when email is unconfigured', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await sendResetLink({ to: 'me@example.com', url: 'https://site/reset?token=t' });

    expect(result).toEqual({ ok: true });
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('https://site/reset?token=t'));
    expect(ResendMock).not.toHaveBeenCalled();
    consoleLog.mockRestore();
  });

  it('refuses to fake a send in production when email is unconfigured', async () => {
    setEnv({ NODE_ENV: 'production' });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await sendResetLink({ to: 'me@example.com', url: 'https://site/reset?token=t' });

    expect(result).toEqual({ ok: false, error: 'Email is not configured.' });
    expect(ResendMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('treats a missing sender address as unconfigured too', async () => {
    setEnv({ RESEND_API_KEY: 're_test_key', EMAIL_FROM: undefined });
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await sendResetLink({ to: 'me@example.com', url: 'https://site/reset?token=t' });

    // Not production → same dev fallback, so a forgotten EMAIL_FROM can't
    // silently break local testing.
    expect(result).toEqual({ ok: true });
    expect(consoleLog).toHaveBeenCalled();
    consoleLog.mockRestore();
  });
});
