import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { ModerationActionRow, ProfileRow } from '@/lib/core/database';
import { formatLongDate } from '@/lib/core/date';
import { requireStaff } from '@/lib/session';
import { SuspensionControls } from './suspension-controls';

export const metadata: Metadata = {
  title: 'Member record',
  robots: { index: false, follow: false }
};

const MemberRecord = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  const profile = data as ProfileRow | null;
  if (!profile) notFound();

  // Actions taken against this member, not by them.
  const { data: history } = await supabase
    .from('moderation_actions')
    .select('*')
    .eq('target_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  const actions = (history ?? []) as ModerationActionRow[];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin/reports"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Reports queue
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">
          {profile.display_name || `@${profile.handle}`}
        </h1>
        <p className="text-[17px] text-muted">@{profile.handle}</p>
      </header>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Account</CardTitle>
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase ${
              profile.is_suspended
                ? 'border-danger bg-danger-muted text-danger'
                : 'border-accent bg-accent-muted text-accent'
            }`}
          >
            {profile.is_suspended ? 'Suspended' : 'Active'}
          </span>
        </div>
        <dl className="flex flex-col gap-3 text-[15px]">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">Role</dt>
            <dd className="font-semibold">{profile.role}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">Joined</dt>
            <dd className="font-semibold">{formatLongDate(profile.created_at.slice(0, 10))}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">Profile visibility</dt>
            <dd className="font-semibold">{profile.profile_visibility}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">Leaderboard</dt>
            <dd className="font-semibold">
              {profile.leaderboard_opt_in ? 'Opted in' : 'Not listed'}
            </dd>
          </div>
        </dl>
        {profile.bio ? (
          <>
            <span className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">Bio</span>
            <p className="whitespace-pre-wrap text-[15px]">{profile.bio}</p>
          </>
        ) : null}
      </Card>

      <Card tone="tint">
        <CardTitle>What this record does not contain</CardTitle>
        <Helper>
          Check-ins, reflections, mood and urge ratings, triggers, and relapse notes are special-
          category data and are never exposed to staff. No moderation decision should require them —
          if one seems to, escalate instead.
        </Helper>
      </Card>

      <SuspensionControls
        userId={profile.id}
        handle={profile.handle}
        isSuspended={profile.is_suspended}
      />

      <Card>
        <CardTitle>Moderation history</CardTitle>
        {actions.length === 0 ? (
          <Helper>No actions recorded against this member.</Helper>
        ) : (
          <ul className="flex flex-col">
            {actions.map((action) => (
              <li
                key={action.id}
                className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{action.action.replace(/_/g, ' ')}</span>
                  <span className="tnum text-[13px] text-muted">
                    {formatLongDate(action.created_at.slice(0, 10))}
                  </span>
                </div>
                <span className="text-[13px] text-muted">
                  {action.reason_code}
                  {action.internal_note ? ` — ${action.internal_note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default MemberRecord;
