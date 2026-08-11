import type { Metadata } from 'next';
import Link from 'next/link';
import { Countdown } from '@/components/today/countdown';
import { Banner, Card, CardTitle, Helper } from '@/components/ui';
import type { TodayState } from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Today',
  robots: { index: false, follow: false }
};

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10">{children}</div>
);

const Header = ({ title, subtitle, badge }: { title: string; subtitle: string; badge?: React.ReactNode }) => (
  <header className="flex flex-wrap items-start justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">{title}</h1>
      <p className="text-[17px] text-muted">{subtitle}</p>
    </div>
    {badge}
  </header>
);

const Badge = ({ children, tone }: { children: React.ReactNode; tone: 'warning' | 'accent' }) => (
  <span
    className={`rounded-md border px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase ${
      tone === 'accent'
        ? 'border-accent bg-accent-muted text-accent'
        : 'border-warning bg-warning-muted text-warning'
    }`}
  >
    {children}
  </span>
);

const linkButton =
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-center font-bold';
const primaryLink = `${linkButton} bg-primary text-on-primary hover:bg-primary-hover`;
const outlineLink = `${linkButton} border border-line-strong hover:bg-card-hover`;

const Today = async () => {
  const { supabase } = await requireMember();
  const { data, error } = await supabase.rpc('get_today_state');
  const state = data as TodayState | null;

  // A failed fetch must never render as "Day 1" to someone on day 19.
  if (error || !state) {
    return (
      <Screen>
        <Header title="Today" subtitle="We could not load your day." />
        <Banner variant="danger">{formatErrorMessage(error)}</Banner>
        <Card>
          <Helper>
            Your check-ins and streak are safe on the server. Reload in a moment — nothing has been
            lost, and nothing was recorded as missed.
          </Helper>
        </Card>
      </Screen>
    );
  }

  // ── no attempt ──────────────────────────────────────────────────────────
  if (state.status === 'no_attempt' || !state.attempt) {
    return (
      <Screen>
        <Header title="Today" subtitle="Ready to begin" />
        <Card>
          <CardTitle>No active challenge</CardTitle>
          <Helper>
            You do not have an active 30-day challenge right now. Ready to start an intentional
            reset?
          </Helper>
          <Link href="/onboarding/challenge" className={`${primaryLink} w-full`}>
            Start 30-day challenge
          </Link>
        </Card>
      </Screen>
    );
  }

  // ── pending: starts at next local midnight ──────────────────────────────
  if (state.status === 'pending') {
    return (
      <Screen>
        <Header title="Today" subtitle="Setup day" />
        <Banner variant="info">
          Your 30-day challenge starts tomorrow at 00:00 ({state.local_date}). Use today to prepare
          your environment.
        </Banner>
        <Card>
          <CardTitle>Setup day preparation</CardTitle>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-[15px] text-muted">
            <li>Move your phone charger out of the bedroom.</li>
            <li>Build your if-then coping plan for high-risk times.</li>
            <li>Read day 1 before you begin.</li>
          </ol>
        </Card>
      </Screen>
    );
  }

  // ── completed ───────────────────────────────────────────────────────────
  if (state.status === 'completed' || (state.day_number === 30 && state.today_checkin?.is_on_time)) {
    return (
      <Screen>
        <Header title="Challenge completed" subtitle="30 on-time reflections" />
        <Card tone="accent">
          <CardTitle>Your 30-day commitment is complete</CardTitle>
          <Helper>
            You recorded 30 on-time daily reflections and completed this attempt. You can capture a
            private closing reflection whenever you are ready.
          </Helper>
          <Link href="/completion" className={`${primaryLink} w-full`}>
            Day-30 reflection and maintenance
          </Link>
          <Link href="/attempts" className={`${outlineLink} w-full`}>
            View preserved milestones
          </Link>
        </Card>
      </Screen>
    );
  }

  // ── active ──────────────────────────────────────────────────────────────
  const dayNumber = state.day_number ?? 1;
  const checkedIn = Boolean(state.today_checkin);
  const progress = Math.min((dayNumber / 30) * 100, 100);

  return (
    <Screen>
      <Header
        title="Good morning"
        subtitle={`Day ${dayNumber} of 30`}
        badge={
          checkedIn ? (
            <Badge tone="accent">Checked in</Badge>
          ) : (
            <Badge tone="warning">Check-in open</Badge>
          )
        }
      />

      <section className="flex flex-col gap-3 border-b border-line pb-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted">Your progress</span>
          <span className="tnum text-[14px] font-bold">{dayNumber} / 30</span>
        </div>
        <p className="tnum text-[34px] leading-none font-extrabold tracking-[-0.03em]">
          Day {dayNumber}
        </p>
        <div
          className="h-[7px] overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={dayNumber}
          aria-valuemin={0}
          aria-valuemax={30}
          aria-label="Challenge progress"
        >
          <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <Card tone={checkedIn ? 'accent' : 'tint'}>
        {state.deadline_at ? <Countdown deadlineAt={state.deadline_at} /> : null}
        <Helper>
          {checkedIn
            ? 'Saved privately. You can edit until the reflection window closes.'
            : 'Notice your mood, triggers, and the response you chose today.'}
        </Helper>
        <Link
          href={`/check-in/${state.local_date ?? 'today'}`}
          className={`${checkedIn ? outlineLink : primaryLink} w-full`}
        >
          {checkedIn ? 'Edit check-in' : 'Complete check-in'}
        </Link>
      </Card>

      {/* Two separate records — the app is careful never to conflate them. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-bold">Two separate records</h2>
        <p className="text-[13px] text-muted">
          Missing a reflection resets check-in consistency. It never records a relapse or changes
          what you report about your behaviour.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-2xl bg-card p-5">
            <span className="text-[13px] text-muted">Check-in streak</span>
            <span className="tnum text-[22px] font-bold">
              {state.verified_streak_days ?? 0} days
            </span>
            <span className="text-[11px] text-subtle">On-time reflections</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-card p-5">
            <span className="text-[13px] text-muted">Abstinence record</span>
            <span className="tnum text-[22px] font-bold">
              {state.abstinence_streak_days ?? 0} days
            </span>
            <span className="text-[11px] text-subtle">Self-reported behaviour</span>
          </div>
        </div>
      </section>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Your weekly pattern</CardTitle>
          <span className="rounded-md border border-ink px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.08em]">
            PLUS
          </span>
        </div>
        <Helper>
          Review the last seven private check-ins. Your reflection text is never loaded into the
          summary.
        </Helper>
        <Link href="/weekly-review" className={`${outlineLink} w-full`}>
          Open weekly review
        </Link>
      </Card>

      <section className="flex flex-col gap-3 border-b border-line pb-6">
        <h2 className="text-[15px] font-bold">Need support right now?</h2>
        <p className="text-[14px] text-muted">
          Ten minutes of space between an urge and a decision. Nothing is saved.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/steady-now" className={outlineLink}>
            Steady Now
          </Link>
          <Link href="/tools/urge-surfing" className={outlineLink}>
            Urge surfing
          </Link>
          <Link href="/tools/paced-breathing" className={outlineLink}>
            Box breathing
          </Link>
        </div>
      </section>

      {state.lesson ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Today’s lesson</CardTitle>
            <span className="text-[12px] text-muted">
              {state.lesson.estimated_minutes} min read
            </span>
          </div>
          <p className="font-semibold">{state.lesson.title}</p>
          <Helper>{state.lesson.summary}</Helper>
          <Link href={`/learn/${state.lesson.slug}`} className={`${outlineLink} self-start`}>
            Read lesson
          </Link>
        </Card>
      ) : null}

      <div className="flex justify-center pt-2 pb-4">
        <Link
          href="/relapse"
          className="text-center text-[13px] font-semibold text-danger underline underline-offset-[3px]"
        >
          Record an honest relapse (resets attempt non-judgmentally)
        </Link>
      </div>
    </Screen>
  );
};

export default Today;
