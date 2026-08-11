import Link from 'next/link';
import { Wordmark } from '@/components/site-chrome';
import { ThemeToggle } from '@/components/theme-toggle';
import { requireStaff } from '@/lib/session';

/** Staff console. Never prerendered, never cached — same rule as (app). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SECTIONS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/cohorts', label: 'Cohorts' },
  { href: '/admin/guides', label: 'Peer guides' }
];

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const { role } = await requireStaff();

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="border-b border-line bg-card">
        <div className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4">
            <Wordmark href="/today" />
            <span className="rounded-md border border-line-strong px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-5 text-[14px]">
            <Link href="/today" className="text-muted hover:text-ink hover:underline">
              Leave console
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <nav aria-label="Console sections" className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[1100px] flex-wrap gap-1 px-5 py-2">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-[10px] px-3 py-2 text-[14px] text-muted hover:bg-card-hover hover:text-ink"
            >
              {section.label}
            </Link>
          ))}
        </div>
      </nav>

      <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-10">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
