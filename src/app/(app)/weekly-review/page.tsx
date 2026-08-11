import type { Metadata } from 'next';
import Link from 'next/link';
import { Banner, Card, CardTitle, Eyebrow, Helper } from '@/components/ui';
import type { ChallengePreferencesRow } from '@/lib/core/database';
import { formatLongDate } from '@/lib/core/date';
import { analyzeWeeklyPatterns, type MoodPattern, type PatternCheckIn } from '@/lib/core/patterns';
import { getPlusStatus } from '@/lib/entitlement';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Weekly pattern review',
  robots: { index: false, follow: false }
};

const MOOD_COPY: Record<MoodPattern, string> = {
  higher_on_low_mood: 'Lower-mood days appeared alongside stronger urges this week.',
  lower_on_low_mood: 'Lower-mood days did not line up with stronger urges this week.',
  no_clear_pattern: 'There was no clear mood-and-urge pattern in this small sample.',
  insufficient_data: 'Log at least three days to compare mood and urge patterns.'
};

const Screen = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
    <header className="flex flex-col gap-2">
      <Link
        href="/today"
        className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
      >
        ← Back to Today
      </Link>
      <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Weekly pattern review</h1>
      <p className="text-[17px] text-muted">Notice patterns without judging the week.</p>
    </header>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0">
    <span className="text-[12px] text-muted">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const WeeklyReview = async () => {
  const { supabase, user } = await requireMember();
  const isPlus = await getPlusStatus(supabase);

  // ── locked ──────────────────────────────────────────────────────────────
  if (!isPlus) {
    return (
      <Screen>
        <Card tone="outline">
          <Eyebrow>Steady30 Plus</Eyebrow>
          <CardTitle>Notice your patterns privately</CardTitle>
          <Helper>
            Plus turns your last seven structured check-ins into a private weekly review.
            Reflection text is never loaded or shared.
          </Helper>
          <Link
            href="/plus"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-bold text-on-primary hover:bg-primary-hover"
          >
            See Steady30 Plus
          </Link>
        </Card>
        <Card>
          <Helper>
            Your check-ins are still being recorded and your streak is unaffected. Nothing is lost
            while Plus is off — this review is simply not generated.
          </Helper>
        </Card>
      </Screen>
    );
  }

  // ── unlocked ────────────────────────────────────────────────────────────
  // Exactly five columns. Reflection text is never selected — see AGENTS.md.
  const [{ data: checkIns }, { data: preferences }, { data: plans }] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select('local_date, mood, urge_intensity, trigger_categories, coping_actions')
      .eq('user_id', user.id)
      .order('local_date', { ascending: false })
      .limit(7),
    supabase
      .from('challenge_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle<ChallengePreferencesRow>(),
    supabase
      .from('coping_plans')
      .select('if_cue, then_action, slot')
      .eq('user_id', user.id)
      .eq('source', 'challenge_setup')
      .order('slot', { ascending: true })
  ]);

  const patterns = analyzeWeeklyPatterns((checkIns ?? []) as PatternCheckIn[]);

  if (patterns.daysLogged < 3) {
    return (
      <Screen>
        <Card>
          <CardTitle>A pattern needs a few days</CardTitle>
          <Helper>
            You have <span className="tnum">{patterns.daysLogged}</span> of the 3 check-ins needed
            for a useful first comparison. Nothing is inferred from missing days.
          </Helper>
        </Card>
      </Screen>
    );
  }

  const observedTrigger = patterns.topTrigger ?? 'No repeated trigger yet';
  const anticipated = patterns.topTrigger
    ? preferences?.trigger_categories?.includes(patterns.topTrigger)
    : undefined;

  return (
    <Screen>
      <Banner variant="info">
        Calculated in your browser from structured check-ins. Reflection text is not loaded, and
        this review is not saved or sent to analytics.
      </Banner>

      <Card>
        <Eyebrow>Last 7 logged days</Eyebrow>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="tnum text-[26px] leading-none font-extrabold">
              {patterns.daysLogged}
            </span>
            <span className="text-[11px] text-muted">days logged</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="tnum text-[26px] leading-none font-extrabold">
              {patterns.averageUrge}
            </span>
            <span className="text-[11px] text-muted">average urge / 10</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="tnum text-[26px] leading-none font-extrabold">
              {patterns.averageMood}
            </span>
            <span className="text-[11px] text-muted">average mood / 5</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>What appeared this week</CardTitle>
        <div className="flex flex-col">
          <Row label="Most repeated trigger" value={observedTrigger} />
          <Row
            label="Most repeated coping action"
            value={patterns.topCopingAction ?? 'No repeated action yet'}
          />
          <Row
            label="Highest-urge logged day"
            value={
              patterns.highestUrgeDate ? formatLongDate(patterns.highestUrgeDate) : 'Not enough data'
            }
          />
          <Row label="High-urge days (7+)" value={String(patterns.highUrgeDays)} />
        </div>

        {anticipated !== undefined ? (
          <Helper>
            {anticipated
              ? 'This also appears in your original plan.'
              : 'This was not in your original anticipated triggers — consider updating your plan.'}
          </Helper>
        ) : null}

        <Helper>Frequency only. It does not prove the action caused an outcome.</Helper>

        <p className="font-semibold">{MOOD_COPY[patterns.moodPattern]}</p>
      </Card>

      <Card>
        <CardTitle>Your prepared responses</CardTitle>
        {plans?.length ? (
          <ul className="flex flex-col gap-4">
            {plans.map((plan, index) => (
              <li
                key={`${plan.slot}-${index}`}
                className="flex flex-col gap-1 border-t border-line pt-4 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-[11px] font-extrabold tracking-[0.1em] text-muted uppercase">
                  Plan {plan.slot ?? index + 1}
                </span>
                <span>
                  If {plan.if_cue}, then {plan.then_action}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Helper>
            Create three if-then plans in challenge setup so they are ready here.
          </Helper>
        )}
        <Link
          href="/onboarding/challenge"
          className="inline-flex min-h-12 items-center justify-center self-start rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
        >
          Update my plan
        </Link>
      </Card>
    </Screen>
  );
};

export default WeeklyReview;
