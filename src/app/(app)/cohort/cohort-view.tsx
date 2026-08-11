'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, RadioGroup } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  COHORT_INTENTION_LABELS,
  type CohortIntention,
  type CohortWeeklyReview,
  type MyCohortState,
  type OpenCohortSummary
} from '@/lib/core/database';
import { formatLongDate } from '@/lib/core/date';
import { formatErrorMessage } from '@/lib/core/errors';

const intentionOptions = (
  Object.entries(COHORT_INTENTION_LABELS) as [CohortIntention, string][]
).map(([value, label]) => ({ value, label }));

export const MyCohort = ({
  cohort,
  weeklyReview
}: {
  cohort: MyCohortState;
  weeklyReview: CohortWeeklyReview | null;
}) => {
  const router = useRouter();
  const [intention, setIntention] = useState<CohortIntention>(
    cohort.my_current_pulse ?? 'steady'
  );
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (action: () => PromiseLike<{ error: unknown }>, success: string) => {
    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await action();
    setSaving(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setNotice(success);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {notice ? <Banner variant="success">{notice}</Banner> : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{cohort.cohort.title}</CardTitle>
          <span className="rounded-md border border-line-strong px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
            Week {cohort.current_week_number}
          </span>
        </div>
        <Helper>
          {formatLongDate(cohort.cohort.starts_at.slice(0, 10))} –{' '}
          {formatLongDate(cohort.cohort.ends_at.slice(0, 10))} ·{' '}
          <span className="tnum">{cohort.total_member_count}</span> members
        </Helper>
      </Card>

      <Card>
        <CardTitle>This week’s pulse</CardTitle>
        <Helper>
          One word about where you are. Nobody sees your answer individually — only the count of
          how many people shared.
        </Helper>
        <RadioGroup<CohortIntention>
          name="Weekly intention"
          value={intention}
          onSelect={setIntention}
          options={intentionOptions}
        />
        <Button
          type="button"
          loading={saving}
          onClick={() =>
            run(
              () =>
                createClient().rpc('submit_cohort_weekly_pulse', {
                  p_cohort_id: cohort.cohort.id,
                  p_intention: intention
                }),
              'Your weekly pulse is recorded.'
            )
          }
          full
        >
          {cohort.my_current_pulse ? 'Update my pulse' : 'Share my pulse'}
        </Button>
        <Helper>
          <span className="tnum">{cohort.weekly_pulse_count}</span> of{' '}
          <span className="tnum">{cohort.total_member_count}</span> members shared this week.
        </Helper>
      </Card>

      {weeklyReview ? (
        <Card tone="tint">
          <CardTitle>Weekly prompt</CardTitle>
          <p>{weeklyReview.prompt}</p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Roster</CardTitle>
        <Helper>
          Handles only. No streaks, no progress, no check-in status — that would leak sensitive
          behaviour to a group.
        </Helper>
        <ul className="flex flex-wrap gap-2">
          {cohort.roster.map((member) => (
            <li
              key={member.user_id}
              className={`rounded-full border px-4 py-2 text-[14px] ${
                member.is_self ? 'border-primary bg-primary text-on-primary' : 'border-line'
              }`}
            >
              {member.is_self ? 'you' : `@${member.handle}`}
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="danger">
        <CardTitle>Leave this cohort</CardTitle>
        <Helper>
          You can only leave before it starts. Once it is running, the group is counting on a
          stable roster.
        </Helper>
        {leaving ? (
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="danger"
              loading={saving}
              onClick={() =>
                run(
                  () =>
                    createClient().rpc('leave_cohort', { p_cohort_id: cohort.cohort.id }),
                  'You have left the cohort.'
                )
              }
            >
              Confirm and leave
            </Button>
            <Button type="button" variant="outline" onClick={() => setLeaving(false)}>
              Stay in cohort
            </Button>
          </div>
        ) : (
          <Button type="button" variant="danger" onClick={() => setLeaving(true)}>
            Leave cohort
          </Button>
        )}
      </Card>
    </div>
  );
};

export const OpenCohorts = ({ cohorts }: { cohorts: OpenCohortSummary[] }) => {
  const router = useRouter();
  const [joining, setJoining] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async (cohortId: string) => {
    setSaving(true);
    setError(null);

    const { error: rpcError } = await createClient().rpc('join_cohort', {
      p_cohort_id: cohortId
    });
    setSaving(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setJoining(null);
    router.refresh();
  };

  if (cohorts.length === 0) {
    return (
      <Card>
        <CardTitle>No cohorts open right now</CardTitle>
        <Helper>
          Cohorts are opened by moderators on a schedule, so there is a wait between them. Your own
          30 days do not depend on one.
        </Helper>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <Banner variant="danger">{error}</Banner> : null}

      {cohorts.map((cohort) => (
        <Card key={cohort.id}>
          <CardTitle>{cohort.title}</CardTitle>
          <Helper>
            {formatLongDate(cohort.starts_at.slice(0, 10))} –{' '}
            {formatLongDate(cohort.ends_at.slice(0, 10))}
          </Helper>
          <p className="tnum text-[14px] text-muted">
            {cohort.member_count} / {cohort.capacity} members ·{' '}
            {cohort.spots_remaining} {cohort.spots_remaining === 1 ? 'spot' : 'spots'} remaining
          </p>

          {joining === cohort.id ? (
            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <Helper>
                You keep your own start date and your own privacy. Joining shares your handle with
                the roster and nothing else.
              </Helper>
              <div className="flex flex-wrap gap-3">
                <Button type="button" loading={saving} onClick={() => join(cohort.id)}>
                  Confirm and join
                </Button>
                <Button type="button" variant="outline" onClick={() => setJoining(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" onClick={() => setJoining(cohort.id)}>
              Join cohort
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
};
