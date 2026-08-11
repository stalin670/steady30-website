'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, Input, RadioGroup } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  COHORT_ADMIN_REASON_LABELS,
  type AdminCohortSummary,
  type CohortAdminReasonCode,
  type CohortStatus
} from '@/lib/core/database';
import { formatLongDate } from '@/lib/core/date';
import { formatErrorMessage } from '@/lib/core/errors';

const STATUS_STYLES: Record<string, string> = {
  open: 'border-accent bg-accent-muted text-accent',
  active: 'border-ink text-ink',
  completed: 'border-line-strong text-muted',
  cancelled: 'border-danger bg-danger-muted text-danger'
};

// Transitions the RPC accepts, and the reason each normally carries.
const TRANSITIONS: Record<CohortStatus, { to: CohortStatus; label: string }[]> = {
  open: [
    { to: 'active', label: 'Activate' },
    { to: 'cancelled', label: 'Cancel' }
  ],
  active: [
    { to: 'completed', label: 'Complete' },
    { to: 'cancelled', label: 'Cancel' }
  ],
  completed: [],
  cancelled: []
};

const reasonOptions = (
  Object.entries(COHORT_ADMIN_REASON_LABELS) as [CohortAdminReasonCode, string][]
).map(([value, label]) => ({ value, label }));

export const CohortsConsole = ({ cohorts }: { cohorts: AdminCohortSummary[] }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [capacity, setCapacity] = useState('8');
  const [pending, setPending] = useState<{ id: string; to: CohortStatus } | null>(null);
  const [reason, setReason] = useState<CohortAdminReasonCode>('schedule');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const trimmed = title.trim();
    if (trimmed.length < 3 || trimmed.length > 80) {
      setError('Cohort title must be between 3 and 80 characters.');
      return;
    }

    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now() + 3_600_000) {
      setError('Start time must be at least one hour in the future.');
      return;
    }

    const size = Number(capacity);
    if (!Number.isInteger(size) || size < 2 || size > 8) {
      setError('Capacity must be between 2 and 8 members.');
      return;
    }

    setBusy(true);
    const { error: rpcError } = await createClient().rpc('admin_create_cohort', {
      p_title: trimmed,
      p_starts_at: start.toISOString(),
      p_capacity: size
    });
    setBusy(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setTitle('');
    setStartsAt('');
    setNotice('Cohort created.');
    router.refresh();
  };

  const applyStatus = async () => {
    if (!pending) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await createClient().rpc('admin_set_cohort_status', {
      p_cohort_id: pending.id,
      p_status: pending.to,
      p_reason_code: reason
    });

    setBusy(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setPending(null);
    setNotice(`Cohort marked ${pending.to}.`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {notice ? <Banner variant="success">{notice}</Banner> : null}

      <Card>
        <CardTitle>Create a cohort</CardTitle>
        <Helper>
          Capacity is capped at 8 so a group stays small enough to feel like one. Start time must be
          at least an hour out.
        </Helper>
        <form onSubmit={create} className="flex flex-col gap-4">
          <Input
            id="cohort-title"
            label="Title"
            placeholder="September cohort"
            maxLength={80}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            id="cohort-start"
            label="Starts at"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
          <Input
            id="cohort-capacity"
            label="Capacity"
            type="number"
            min={2}
            max={8}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            hint="Between 2 and 8."
          />
          <Button type="submit" loading={busy} full>
            Create cohort
          </Button>
        </form>
      </Card>

      {cohorts.length === 0 ? (
        <Card>
          <CardTitle>No cohorts yet</CardTitle>
          <Helper>Created cohorts appear here with their enrolment and lifecycle state.</Helper>
        </Card>
      ) : (
        cohorts.map((cohort) => (
          <Card key={cohort.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{cohort.title}</CardTitle>
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase ${
                  STATUS_STYLES[cohort.status] ?? STATUS_STYLES.completed
                }`}
              >
                {cohort.status}
              </span>
            </div>

            <Helper>
              {formatLongDate(cohort.starts_at.slice(0, 10))} –{' '}
              {formatLongDate(cohort.ends_at.slice(0, 10))} ·{' '}
              <span className="tnum">
                {cohort.member_count}/{cohort.capacity}
              </span>{' '}
              members
            </Helper>

            {cohort.latest_action ? (
              <Helper>
                Last action: {cohort.latest_action}
                {cohort.latest_action_reason
                  ? ` — ${COHORT_ADMIN_REASON_LABELS[cohort.latest_action_reason]}`
                  : ''}
              </Helper>
            ) : null}

            {pending?.id === cohort.id ? (
              <div className="flex flex-col gap-4 border-t border-line pt-4">
                <CardTitle>Reason for marking {pending.to}</CardTitle>
                <RadioGroup<CohortAdminReasonCode>
                  name="Reason code"
                  value={reason}
                  onSelect={setReason}
                  options={reasonOptions}
                />
                <div className="flex flex-wrap gap-3">
                  <Button type="button" loading={busy} onClick={applyStatus}>
                    Confirm
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setPending(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {TRANSITIONS[cohort.status].map((transition) => (
                  <Button
                    key={transition.to}
                    type="button"
                    variant={transition.to === 'cancelled' ? 'danger' : 'outline'}
                    onClick={() => {
                      setPending({ id: cohort.id, to: transition.to });
                      setReason(
                        transition.to === 'completed' ? 'routine_completion' : 'schedule'
                      );
                    }}
                  >
                    {transition.label}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
};
