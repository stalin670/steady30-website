import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export const Wordmark = ({ href = '/' }: { href?: string }) => (
  <Link href={href} className="flex items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.5px]">
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-full border-2 border-current text-[15px] leading-none"
    >
      S
    </span>
    Steady30
  </Link>
);

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/plus', label: 'Plus' },
  { href: '/safety', label: 'Safety' },
  { href: '/privacy', label: 'Privacy' }
];

export const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.steady30.app';

export const SiteHeader = ({ signedIn = false }: { signedIn?: boolean }) => (
  <header className="border-b border-line">
    <div className="mx-auto flex w-full max-w-[1060px] flex-wrap items-center justify-between gap-x-7 gap-y-4 px-5 py-4 sm:min-h-[74px] sm:py-0">
      <Wordmark />
      <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-ink hover:underline">
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
        <Link
          href={signedIn ? '/today' : '/sign-in'}
          className="inline-flex min-h-9 items-center justify-center rounded-full bg-primary px-4 font-bold text-on-primary hover:bg-primary-hover"
        >
          {signedIn ? 'Open Steady30' : 'Sign in'}
        </Link>
      </nav>
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
export const SiteShell = ({
  children,
  signedIn = false
}: {
  children: React.ReactNode;
  signedIn?: boolean;
}) => (
  <div className="flex min-h-dvh flex-col">
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <SiteHeader signedIn={signedIn} />
    <main id="main" className="flex-1">
      {children}
    </main>
    <SiteFooter />
  </div>
);
