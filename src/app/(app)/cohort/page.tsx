import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, Helper } from '@/components/ui';
import type {
  CohortWeeklyReview,
  MyCohortState,
  OpenCohortSummary
} from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { MyCohort, OpenCohorts } from './cohort-view';

export const metadata: Metadata = {
  title: '30-day cohorts',
  robots: { index: false, follow: false }
};

const Cohort = async () => {
  const { supabase } = await requireMember();

  const { data: mine } = await supabase.rpc('my_cohort');
  const cohort = mine as MyCohortState | null;

  // Only fetch the aggregate prompt for a cohort that is actually running.
  const weeklyReview =
    cohort && cohort.cohort.status === 'active'
      ? (((await supabase.rpc('cohort_weekly_review', { p_cohort_id: cohort.cohort.id }))
          .data ?? null) as CohortWeeklyReview | null)
      : null;

  const open = cohort
    ? []
    : (((await supabase.rpc('list_open_cohorts', { p_limit: 20 })).data ??
        []) as OpenCohortSummary[]);

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/community"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Community
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">
          {cohort ? 'My 30-day cohort' : '30-day cohorts'}
        </h1>
        <p className="text-[17px] text-muted">Synchronised small-group accountability.</p>
      </header>

      {cohort ? (
        <MyCohort cohort={cohort} weeklyReview={weeklyReview} />
      ) : (
        <>
          <Card tone="tint">
            <Helper>
              A small group running the same 30 days as you, with one check-in a week. Membership is
              optional, and you can only be in one at a time.
            </Helper>
          </Card>
          <OpenCohorts cohorts={open} />
        </>
      )}
    </div>
  );
};

export default Cohort;
