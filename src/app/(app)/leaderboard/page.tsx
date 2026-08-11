import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { LeaderboardEntry } from '@/lib/core/database';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Leaderboard',
  robots: { index: false, follow: false }
};

const Leaderboard = async () => {
  const { supabase, profile } = await requireMember();
  const { data } = await supabase.rpc('leaderboard_current', { p_limit: 50 });
  const entries = (data ?? []) as LeaderboardEntry[];

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/community"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Community
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Leaderboard</h1>
        <p className="text-[17px] text-muted">Opt-in verified streaks.</p>
      </header>

      <Card tone="tint">
        <Helper>
          Only members who chose to appear are listed, and only their on-time check-in streak is
          shown — never abstinence, reflections, or anything else. Participation is off by default
          and can be withdrawn at any time.
        </Helper>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <CardTitle>Nobody is listed yet</CardTitle>
          <Helper>The leaderboard fills up as members opt in.</Helper>
        </Card>
      ) : (
        <ol className="flex flex-col rounded-2xl border border-line bg-card">
          {entries.map((entry) => {
            const isSelf = entry.handle === profile?.handle;
            return (
              <li
                key={entry.user_id}
                className={`flex items-center gap-4 border-b border-line px-5 py-3 last:border-b-0 ${
                  isSelf ? 'bg-primary-muted' : ''
                }`}
              >
                <span className="tnum w-8 font-mono text-[13px] text-subtle">{entry.rank}</span>
                <Link
                  href={`/u/${entry.handle}`}
                  className="min-w-0 flex-1 truncate font-semibold hover:underline hover:underline-offset-[3px]"
                >
                  {entry.display_name || `@${entry.handle}`}
                  {isSelf ? <span className="ml-2 text-[13px] text-muted">you</span> : null}
                </Link>
                <span className="tnum shrink-0 text-[14px] text-muted">
                  {entry.verified_streak_days} days
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <Card>
        <CardTitle>Not listed?</CardTitle>
        <Helper>
          Appearing here is a choice you make in privacy settings, which arrive in a later phase.
          Your streak counts either way.
        </Helper>
      </Card>
    </div>
  );
};

export default Leaderboard;
