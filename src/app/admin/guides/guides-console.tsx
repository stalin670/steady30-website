'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, RadioGroup } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  PEER_GUIDE_REVIEW_REASON_LABELS,
  type AdminPeerGuideApplicationSummary,
  type PeerGuideAdminAction,
  type PeerGuideReviewReason
} from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-warning bg-warning-muted text-warning',
  approved: 'border-accent bg-accent-muted text-accent',
  paused: 'border-line-strong text-muted',
  revoked: 'border-danger bg-danger-muted text-danger',
  withdrawn: 'border-line-strong text-subtle'
};

const ACTIONS: { action: PeerGuideAdminAction; label: string; defaultReason: PeerGuideReviewReason }[] =
  [
    { action: 'approve', label: 'Approve', defaultReason: 'eligible' },
    { action: 'pause', label: 'Pause', defaultReason: 'training_pending' },
    { action: 'revoke', label: 'Revoke', defaultReason: 'conduct' }
  ];

const reasonOptions = (
  Object.entries(PEER_GUIDE_REVIEW_REASON_LABELS) as [PeerGuideReviewReason, string][]
).map(([value, label]) => ({ value, label }));

export const GuidesConsole = ({
  applications
}: {
  applications: AdminPeerGuideApplicationSummary[];
}) => {
  const router = useRouter();
  const [pending, setPending] = useState<{ userId: string; action: PeerGuideAdminAction } | null>(
    null
  );
  const [reason, setReason] = useState<PeerGuideReviewReason>('eligible');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const review = async () => {
    if (!pending) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await createClient().rpc('admin_review_peer_guide', {
      p_user_id: pending.userId,
      p_action: pending.action,
      p_reason_code: reason
    });

    setBusy(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setPending(null);
    setNotice(`Application ${pending.action}d.`);
    router.refresh();
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardTitle>No applications</CardTitle>
        <Helper>Applications appear here as alumni submit them.</Helper>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {notice ? <Banner variant="success">{notice}</Banner> : null}

      {applications.map((application) => (
        <Card key={application.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href={`/admin/users/${application.user_id}`}
              className="font-semibold underline underline-offset-[3px]"
            >
              {application.display_name || `@${application.handle}`}
            </a>
            <span
              className={`rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase ${
                STATUS_STYLES[application.status] ?? STATUS_STYLES.withdrawn
              }`}
            >
              {application.status}
            </span>
          </div>

          <p className="whitespace-pre-wrap text-[15px]">{application.statement}</p>

          {application.review_reason ? (
            <Helper>
              Last review: {PEER_GUIDE_REVIEW_REASON_LABELS[application.review_reason]}
            </Helper>
          ) : null}

          {pending?.userId === application.user_id ? (
            <div className="flex flex-col gap-4 border-t border-line pt-4">
              <CardTitle>Reason for {pending.action}</CardTitle>
              <RadioGroup<PeerGuideReviewReason>
                name="Review reason"
                value={reason}
                onSelect={setReason}
                options={reasonOptions}
              />
              <div className="flex flex-wrap gap-3">
                <Button type="button" loading={busy} onClick={review}>
                  Confirm {pending.action}
                </Button>
                <Button type="button" variant="outline" onClick={() => setPending(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {ACTIONS.map((option) => (
                <Button
                  key={option.action}
                  type="button"
                  variant={option.action === 'revoke' ? 'danger' : 'outline'}
                  onClick={() => {
                    setPending({ userId: application.user_id, action: option.action });
                    setReason(option.defaultReason);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
