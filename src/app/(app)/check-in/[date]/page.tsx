import type { Metadata } from 'next';
import Link from 'next/link';
import { Banner, Card, Helper } from '@/components/ui';
import type { TodayState } from '@/lib/core/database';
import { formatLongDate } from '@/lib/core/date';
import { requireMember } from '@/lib/session';
import { CheckInForm } from './check-in-form';

export const metadata: Metadata = {
  title: 'Daily reflection',
  robots: { index: false, follow: false }
};

/**
 * The route param is a local date and nothing else. AGENTS.md: reflection text,
 * mood, urges, and triggers never travel in a URL.
 */
const CheckIn = async ({ params }: { params: Promise<{ date: string }> }) => {
  const { date } = await params;
  const { supabase } = await requireMember();

  const { data } = await supabase.rpc('get_today_state');
  const state = data as TodayState | null;

  const targetDate = date === 'today' ? (state?.local_date ?? date) : date;
  // Only today's check-in is editable, so only today's is preloaded.
  const existing =
    state?.today_checkin && state.today_checkin.local_date === targetDate
      ? state.today_checkin
      : null;

  const windowClosed = state?.status === 'no_attempt' || !state?.attempt;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/today"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Back to Today
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Daily reflection</h1>
        <p className="text-[17px] text-muted">Check-in for {formatLongDate(targetDate)}</p>
      </header>

      {windowClosed ? (
        <Card>
          <Banner variant="info">
            You do not have an active challenge, so there is no reflection to record today.
          </Banner>
          <Helper>
            Starting a new 30-day challenge opens your first reflection at the next local midnight.
          </Helper>
        </Card>
      ) : (
        <CheckInForm localDate={targetDate} existing={existing} />
      )}
    </div>
  );
};

export default CheckIn;
