'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wordmark } from './site-chrome';
import { ThemeToggle } from './theme-toggle';
import { createClient } from '@/lib/supabase/client';

/**
 * The four tabs from ../Steady30/src/app/(app)/(tabs)/_layout.tsx.
 * Bottom tabs on mobile — identical to native — and a left rail from 1024px.
 */
const TABS = [
  { href: '/today', label: 'Today' },
  { href: '/community', label: 'Community' },
  { href: '/learn', label: 'Learn' },
  { href: '/me', label: 'Me' }
];

const SignOutButton = ({ className }: { className?: string }) => {
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.replace('/');
    router.refresh();
  };

  return (
    <button type="button" onClick={signOut} className={className}>
      Sign out
    </button>
  );
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* desktop rail */}
      <nav
        aria-label="Sections"
        className="sticky top-0 hidden h-dvh w-[216px] shrink-0 flex-col gap-1 border-r border-line bg-card px-4 py-6 lg:flex"
      >
        <div className="mb-6 px-2">
          <Wordmark href="/today" />
        </div>

        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive(tab.href) ? 'page' : undefined}
            className={`rounded-[10px] px-3 py-2 text-[15px] ${
              isActive(tab.href)
                ? 'bg-primary-muted font-semibold text-ink'
                : 'text-muted hover:bg-card-hover hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        ))}

        <div className="flex-1" />

        {/* Pinned, always. It is the control someone reaches for under pressure. */}
        <Link
          href="/steady-now"
          className="rounded-full border border-line-strong px-3 py-2 text-center text-[14px] font-semibold hover:bg-card-hover"
        >
          Steady Now
        </Link>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <SignOutButton className="text-[13px] text-muted underline underline-offset-[3px] hover:text-ink" />
          <ThemeToggle />
        </div>
      </nav>

      {/* mobile top bar */}
      <header className="flex items-center justify-between border-b border-line px-5 py-3 lg:hidden">
        <Wordmark href="/today" />
        <div className="flex items-center gap-3">
          <Link
            href="/steady-now"
            className="rounded-full border border-line-strong px-3 py-1.5 text-[13px] font-semibold"
          >
            Steady Now
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" className="flex-1 pb-28 lg:pb-0">
          {children}
        </main>

        {/* mobile bottom tabs */}
        <nav
          aria-label="Sections"
          className="safe-bottom fixed inset-x-0 bottom-0 flex border-t border-line bg-card lg:hidden"
        >
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive(tab.href) ? 'page' : undefined}
              className={`flex-1 py-3 text-center text-[12px] ${
                isActive(tab.href) ? 'font-bold text-ink' : 'text-muted'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
