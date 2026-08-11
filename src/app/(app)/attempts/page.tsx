import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { AttemptRow } from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { AttemptsList } from './attempts-list';

export const metadata: Metadata = {
  title: 'Challenge history',
  robots: { index: false, follow: false }
};

const Attempts = async () => {
  const { supabase, user } = await requireMember();

  const [{ data: attempts }, { data: relapses }] = await Promise.all([
    supabase
      .from('attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('relapse_events')
      .select('id, attempt_id')
      .eq('user_id', user.id)
      .is('reversed_at', null)
  ]);

  const rows = (attempts ?? []) as AttemptRow[];
  const relapsesByAttempt = Object.fromEntries(
    (relapses ?? []).map((relapse) => [relapse.attempt_id, relapse.id])
  );
  const hasOpenAttempt = rows.some(
    (attempt) => attempt.status === 'active' || attempt.status === 'pending'
  );

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/today"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Back to Today
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Challenge history</h1>
        <p className="text-[17px] text-muted">Your preserved journey and milestones.</p>
      </header>

      {!hasOpenAttempt ? (
        <Card tone="outline">
          <CardTitle>Ready for a new attempt?</CardTitle>
          <Helper>Start a new 30-day challenge beginning at midnight.</Helper>
          <Link
            href="/onboarding/challenge"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-bold text-on-primary hover:bg-primary-hover"
          >
            Start new challenge
          </Link>
        </Card>
      ) : null}

      <AttemptsList attempts={rows} relapsesByAttempt={relapsesByAttempt} />
    </div>
  );
};

export default Attempts;
