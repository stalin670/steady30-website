import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { CompletionState } from '@/lib/core/database';
import { formatLongDate } from '@/lib/core/date';
import { requireMember } from '@/lib/session';
import { CompletionForm, MaintenanceCheckIn } from './completion-form';

export const metadata: Metadata = {
  title: 'Completion and maintenance',
  robots: { index: false, follow: false }
};

const Completion = async () => {
  const { supabase } = await requireMember();
  const { data } = await supabase.rpc('get_completion_state');
  const state = data as CompletionState | null;

  if (!state?.completed_attempt) {
    return (
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Completion and maintenance</h1>
        <Card>
          <CardTitle>This unlocks after a completed challenge</CardTitle>
          <Helper>
            The closing reflection and maintenance mode become available once you have finished a
            30-day challenge. Nothing is missing — you are just not there yet.
          </Helper>
          <Link
            href="/today"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
          >
            Back to Today
          </Link>
        </Card>
      </div>
    );
  }

  const attempt = state.completed_attempt;

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/today"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Back to Today
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Completion and maintenance</h1>
        <p className="text-[17px] text-muted">Private milestone and voluntary routine.</p>
      </header>

      <Card tone="accent">
        <CardTitle>
          <span className="tnum">{attempt.completed_days}</span> on-time reflections
        </CardTitle>
        <Helper>
          Started {formatLongDate(attempt.start_local_date)}
          {attempt.ended_at ? ` · finished ${formatLongDate(attempt.ended_at.slice(0, 10))}` : ''}
        </Helper>
      </Card>

      <CompletionForm state={state} />
      <MaintenanceCheckIn state={state} />
    </div>
  );
};

export default Completion;
