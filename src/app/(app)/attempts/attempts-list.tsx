'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, TextArea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type { AttemptRow } from '@/lib/core/database';
import { formatLongDate } from '@/lib/core/date';
import { formatErrorMessage } from '@/lib/core/errors';

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  completed: {
    label: '30 days completed',
    className: 'border-accent bg-accent-muted text-accent'
  },
  active: { label: 'Active attempt', className: 'border-ink text-ink' },
  pending: { label: 'Starting tomorrow', className: 'border-line-strong text-muted' },
  missed_checkin: {
    label: 'Missed deadline',
    className: 'border-warning bg-warning-muted text-warning'
  },
  relapse: { label: 'Honest reset', className: 'border-danger bg-danger-muted text-danger' },
  withdrawn: { label: 'Withdrawn', className: 'border-line-strong text-muted' }
};

export const AttemptsList = ({
  attempts,
  relapsesByAttempt
}: {
  attempts: AttemptRow[];
  relapsesByAttempt: Record<string, string>;
}) => {
  const router = useRouter();
  const [correcting, setCorrecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ variant: 'success' | 'danger'; text: string } | null>(
    null
  );

  const submitCorrection = async () => {
    if (!correcting || reason.trim().length < 10) {
      setMessage({ variant: 'danger', text: 'Explain the correction in at least 10 characters.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await createClient().rpc('correct_relapse', {
      p_relapse_id: correcting,
      p_reason: reason.trim()
    });

    setSaving(false);

    if (error) {
      setMessage({ variant: 'danger', text: formatErrorMessage(error) });
      return;
    }

    setCorrecting(null);
    setReason('');
    setMessage({
      variant: 'success',
      text: 'Correction recorded. The original event remains in your private audit history.'
    });
    // The server recomputes attempt status, so refetch rather than patching locally.
    router.refresh();
  };

  if (attempts.length === 0) {
    return (
      <Card>
        <Helper>No attempt history yet. Your first challenge will appear here.</Helper>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message ? <Banner variant={message.variant}>{message.text}</Banner> : null}

      {attempts.map((attempt) => {
        const badge = STATUS_BADGES[attempt.status] ?? {
          label: attempt.status,
          className: 'border-line-strong text-muted'
        };
        const relapseId = relapsesByAttempt[attempt.id];

        return (
          <Card key={attempt.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">Started {formatLongDate(attempt.start_local_date)}</p>
              <span
                className={`rounded-md border px-3 py-1 font-mono text-[11px] tracking-[0.08em] uppercase ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>

            <div className="flex flex-wrap justify-between gap-3 text-[13px] text-muted">
              <span>
                Completed days:{' '}
                <span className="tnum font-bold text-ink">{attempt.completed_days} / 30</span>
              </span>
              <span>Timezone: {attempt.timezone}</span>
            </div>

            {attempt.status === 'missed_checkin' ? (
              <Helper>
                This attempt ended because a reflection missed its deadline. It is not recorded as a
                relapse and does not rewrite your self-reported behaviour history.
              </Helper>
            ) : null}

            {attempt.status === 'relapse' && relapseId ? (
              correcting === relapseId ? (
                <div className="flex flex-col gap-4 border-t border-line pt-4">
                  <CardTitle>Correct relapse entry</CardTitle>
                  <Helper>
                    Use this only if the entry was accidental or factually wrong. Members can
                    correct it within 24 hours; later corrections require moderator review. The
                    original entry and this reason stay in your private audit history.
                  </Helper>
                  <TextArea
                    id={`reason-${relapseId}`}
                    label="Reason for correction"
                    placeholder="Explain what was entered incorrectly…"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    hint="At least 10 characters."
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={submitCorrection}
                      loading={saving}
                      disabled={reason.trim().length < 10}
                    >
                      Record correction
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCorrecting(null);
                        setReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCorrecting(relapseId);
                    setMessage(null);
                  }}
                >
                  Correct an accidental relapse entry
                </Button>
              )
            ) : null}
          </Card>
        );
      })}
    </div>
  );
};
