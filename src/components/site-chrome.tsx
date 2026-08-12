import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { createClient } from '@/lib/supabase/server';
import { Wordmark } from './wordmark';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/plus', label: 'Plus' },
  { href: '/safety', label: 'Safety' },
  { href: '/privacy', label: 'Privacy' }
];

export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.steady30.app';

const ProfileButton = ({ compact = false }: { compact?: boolean }) => (
  <Link
    href="/me"
    aria-label="Open profile"
    title="Open profile"
    className={`inline-flex items-center justify-center rounded-full border border-line-strong text-ink hover:bg-card-hover ${
      compact ? 'size-11' : 'size-10'
    }`}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[1.8]">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20c.7-3.2 3-5 6.5-5s5.8 1.8 6.5 5" />
    </svg>
  </Link>
);

export const SiteHeader = ({ signedIn = false }: { signedIn?: boolean }) => (
  <header className="relative border-b border-line">
    <div className="mx-auto flex w-full max-w-[1060px] items-center justify-between gap-3 px-5 py-3 sm:min-h-[74px] sm:py-0">
      <Wordmark />
      <nav
        aria-label="Main"
        className="hidden items-center gap-x-5 gap-y-2 text-sm text-muted sm:flex"
      >
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-ink hover:underline">
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
        {signedIn ? (
          <ProfileButton />
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-primary px-4 font-bold text-on-primary hover:bg-primary-hover"
          >
            Sign in
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-2 sm:hidden">
        {signedIn ? (
          <ProfileButton compact />
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-[14px] font-bold text-on-primary"
          >
            Start
          </Link>
        )}
        <details className="group relative">
          <summary className="flex size-11 list-none items-center justify-center rounded-full border border-line-strong text-[20px] font-bold marker:content-none hover:bg-card-hover">
            <span className="sr-only">Open menu</span>
            <span aria-hidden="true" className="group-open:hidden">☰</span>
            <span aria-hidden="true" className="hidden group-open:block">×</span>
          </summary>
          <nav
            aria-label="Mobile menu"
            className="absolute right-0 top-[calc(100%+10px)] z-20 flex w-[min(280px,calc(100vw-40px))] flex-col rounded-2xl border border-line bg-card p-2 shadow-[0_18px_42px_rgb(0_0_0_/_0.14)]"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3 text-[15px] font-semibold text-muted hover:bg-card-hover hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/steady-now"
              className="mt-1 rounded-xl border border-line-strong px-4 py-3 text-[15px] font-bold"
            >
              Steady Now — no account needed
            </Link>
            <div className="mt-1 flex items-center justify-between border-t border-line px-4 py-3 text-[14px] text-muted">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
          </nav>
        </details>
      </div>
    </div>
  </header>
);

const footerLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/safety', label: 'Safety' },
  { href: '/community-guidelines', label: 'Community rules' },
  { href: '/delete-account', label: 'Delete account' },
  { href: 'mailto:support@steady30.online', label: 'Support' }
];

export const SiteFooter = () => (
  <footer className="mt-auto border-t border-line py-9 text-sm text-muted">
    <div className="mx-auto flex w-full max-w-[1060px] flex-col justify-between gap-6 px-5 sm:flex-row">
      <div className="flex flex-col gap-1">
        <span>© {new Date().getFullYear()} Steady30</span>
        <span className="text-subtle">An educational self-help tool. Not medical treatment.</span>
      </div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-3 sm:justify-end">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-ink hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </footer>
);

/** Page shell for the public marketing and legal surface. */
export const SiteShell = async ({
  children,
  signedIn
}: {
  children: React.ReactNode;
  signedIn?: boolean;
}) => {
  let hasSession = signedIn;

  if (hasSession === undefined) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      hasSession = Boolean(user);
    } else {
      hasSession = false;
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader signedIn={hasSession} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};
