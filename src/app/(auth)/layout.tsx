import type { Metadata } from 'next';

// Login sits outside the guarded (private) layout — its guard is the proxy
// exclusion + the session check on the page itself. No chrome: just the form,
// centered on an otherwise empty screen.
export const metadata: Metadata = {
  title: 'Login · Manage',
  robots: { index: false, follow: false },
};

export default function ManageLoginLayout({ children }: LayoutProps<'/'>) {
  return <main className="flex min-h-screen items-center justify-center px-4">{children}</main>;
}
