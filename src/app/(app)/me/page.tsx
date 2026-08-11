import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { CompletionState } from '@/lib/core/database';
import { getPlusStatus } from '@/lib/entitlement';
import { requireMember } from '@/lib/session';
import { SignOutButton } from './sign-out-button';

export const metadata: Metadata = {
  title: 'My account',
  robots: { index: false, follow: false }
};

type Row = { href: string; label: string; badge?: string; emphasis?: boolean };

const Me = async () => {
  const { supabase, profile } = await requireMember();

  const [completion, isPlus] = await Promise.all([
    supabase.rpc('get_completion_state'),
    getPlusStatus(supabase)
  ]);

  const hasCompletedAttempt = Boolean(
    (completion.data as CompletionState | null)?.completed_attempt
  );

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';

  // Same order as ../Steady30/src/screens/me-screen.tsx.
  const rows: Row[] = [
    ...(isStaff
      ? [{ href: '/admin', label: 'Moderation console', badge: profile!.role, emphasis: true }]
      : []),
    { href: '/plus', label: 'Steady30 Plus', badge: isPlus ? 'Active' : undefined, emphasis: true },
    ...(hasCompletedAttempt
      ? [{ href: '/completion', label: 'Completion and maintenance' }]
      : []),
    { href: '/guides/me', label: 'Alumni peer guide' },
    { href: '/guides', label: 'Community peer guides' },
    { href: '/cohort', label: 'My 30-day cohort' },
    { href: '/weekly-review', label: 'Weekly pattern review', badge: isPlus ? undefined : 'Plus' },
    { href: '/trusted-contacts', label: 'Trusted contacts' },
    { href: '/attempts', label: 'Challenge history and milestones' },
    { href: '/settings', label: 'Settings and profile' },
    { href: '/settings/privacy', label: 'Privacy and visibility' },
    { href: '/settings/notifications', label: 'Reflection reminders' },
    { href: '/settings/app', label: 'Install Steady30' },
    { href: '/settings/data', label: 'Export data and account deletion' }
  ];

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">My account</h1>
        <p className="text-[17px] text-muted">Challenger profile and preferences.</p>
      </header>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full border border-line bg-primary-muted text-[16px] font-bold text-muted"
          >
            {(profile?.handle ?? '??').slice(0, 2).toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[19px] font-bold">
              {profile?.display_name || `@${profile?.handle}`}
            </span>
            <span className="text-[14px] text-muted">@{profile?.handle}</span>
            <span className="text-[13px] text-subtle">
              Timezone: {profile?.preferred_timezone ?? 'UTC'}
            </span>
          </div>
        </div>
      </Card>

      <nav aria-label="Account sections">
        <ul className="flex flex-col rounded-2xl border border-line bg-card">
          {rows.map((row) => (
            <li key={row.href} className="border-b border-line last:border-b-0">
              <Link
                href={row.href}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-card-hover"
              >
                <span className={row.emphasis ? 'font-bold' : ''}>{row.label}</span>
                <span className="flex shrink-0 items-center gap-3">
                  {row.badge ? (
                    <span className="rounded-md border border-ink px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.08em] uppercase">
                      {row.badge}
                    </span>
                  ) : null}
                  <span aria-hidden="true" className="text-subtle">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Card tone="tint">
        <CardTitle>Steady30 is not medical treatment</CardTitle>
        <Helper>
          It is an educational self-help tool. If distress is severe or persistent, the{' '}
          <Link href="/safety" className="underline underline-offset-[3px]">
            safety resources
          </Link>{' '}
          list real help.
        </Helper>
      </Card>

      <SignOutButton />
    </div>
  );
};

export default Me;
