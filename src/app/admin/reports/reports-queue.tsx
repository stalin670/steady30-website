'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, TextArea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type { ReportRow } from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';

// The three actions the app's console offers, with the reason codes it records.
// Keeping the codes identical matters: the moderation runbook and any audit read
// them across both consoles.
const ACTIONS = [
  {
    action: 'hide',
    reasonCode: 'community_report_hidden',
    label: 'Hide content',
    variant: 'outline' as const,
    describe: 'Hidden from the feed, author can still see it.'
  },
  {
    action: 'remove',
    reasonCode: 'policy_violation_removed',
    label: 'Remove content',
    variant: 'danger' as const,
    describe: 'Removed for everyone. Use for clear guideline violations.'
  },
  {
    action: 'dismiss_report',
    reasonCode: 'report_unfounded',
    label: 'Dismiss report',
    variant: 'outline' as const,
    describe: 'Content stays. The report is closed as unfounded.'
  }
];

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'border-danger bg-danger-muted text-danger',
  high: 'border-warning bg-warning-muted text-warning',
  normal: 'border-line-strong text-muted',
  low: 'border-line-strong text-subtle'
};

const dueLabel = (dueAt: string | null) => {
  if (!dueAt) return 'No deadline set';

  const diffMs = new Date(dueAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Overdue';

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `Due in ${hours}h`;
  return `Due in ${Math.floor(hours / 24)}d`;
};

export const ReportsQueue = ({ reports }: { reports: ReportRow[] }) => {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const moderate = async (report: ReportRow, action: string, reasonCode: string) => {
    setBusy(report.id);
    setError(null);
    setNotice(null);

    const note = notes[report.id]?.trim();

    const { error: rpcError } = await createClient().rpc('moderate_target', {
      p_target_type: report.target_type,
      p_target_id: report.target_id,
      p_action: action,
      p_reason_code: reasonCode,
      p_internal_note: note || `Actioned from the web console: ${action}`
    });

    setBusy(null);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setNotice(`Report actioned: ${action.replace('_', ' ')}.`);
    router.refresh();
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardTitle>The queue is empty</CardTitle>
        <Helper>No open reports. Closed reports stay in the moderation history.</Helper>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {notice ? <Banner variant="success">{notice}</Banner> : null}

      {reports.map((report) => (
        <Card key={report.id} tone={report.priority === 'urgent' ? 'danger' : 'card'}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase ${
                  PRIORITY_STYLES[report.priority] ?? PRIORITY_STYLES.normal
                }`}
              >
                {report.priority}
              </span>
              <span className="rounded-md border border-line-strong px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
                {report.reason.replace(/_/g, ' ')}
              </span>
              <span className="rounded-md border border-line-strong px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
                {report.target_type}
              </span>
            </div>
            <span className="text-[13px] text-muted">{dueLabel(report.response_due_at)}</span>
          </div>

          {report.detail ? (
            <p className="whitespace-pre-wrap text-[15px]">{report.detail}</p>
          ) : (
            <Helper>The reporter did not add detail.</Helper>
          )}

          <p className="font-mono text-[12px] break-all text-subtle">
            target {report.target_id}
          </p>

          {report.reason === 'self_harm' ? (
            <Banner variant="warning">
              Follow the self-harm escalation path in the moderation runbook. Do not reply to the
              member in-product.
            </Banner>
          ) : null}

          <TextArea
            id={`note-${report.id}`}
            label="Internal note"
            placeholder="What you saw and why you decided this…"
            rows={2}
            value={notes[report.id] ?? ''}
            onChange={(event) =>
              setNotes((current) => ({ ...current, [report.id]: event.target.value }))
            }
            hint="Recorded in moderation_actions. Never shown to members."
          />

          <div className="flex flex-wrap gap-3">
            {ACTIONS.map((option) => (
              <Button
                key={option.action}
                type="button"
                variant={option.variant}
                loading={busy === report.id}
                onClick={() => moderate(report, option.action, option.reasonCode)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <Helper>
            {ACTIONS.map((option) => option.describe).join(' ')}
          </Helper>

          {report.target_type === 'profile' ? (
            <a
              href={`/admin/users/${report.target_id}`}
              className="self-start text-[14px] underline underline-offset-[3px]"
            >
              Open member record
            </a>
          ) : null}
        </Card>
      ))}
    </div>
  );
};
