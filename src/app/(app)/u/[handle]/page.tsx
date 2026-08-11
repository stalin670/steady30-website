import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { PublicProfile } from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { BlockButton } from './block-button';

export const metadata: Metadata = {
  title: 'Member profile',
  robots: { index: false, follow: false }
};

const UserProfile = async ({ params }: { params: Promise<{ handle: string }> }) => {
  const { handle } = await params;
  const { supabase, profile: viewer } = await requireMember();

  // public_profiles is a view; RLS decides what a viewer may see, so a private
  // profile simply returns nothing rather than 403-ing.
  const { data } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle<PublicProfile>();

  if (!data) {
    return (
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Profile unavailable</h1>
        <Card>
          <CardTitle>Nothing to show here</CardTitle>
          <Helper>
            This member does not exist, keeps their profile private, or is not visible to you.
          </Helper>
          <Link
            href="/community"
            className="inline-flex min-h-12 items-center justify-center self-start rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
          >
            Back to community
          </Link>
        </Card>
      </div>
    );
  }

  const isSelf = viewer?.handle === data.handle;

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <Link
        href="/community"
        className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
      >
        ← Community
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full border border-line bg-primary-muted text-[16px] font-bold text-muted"
          >
            {data.handle.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-[24px] font-extrabold">
              {data.display_name || `@${data.handle}`}
            </h1>
            <span className="text-[14px] text-muted">@{data.handle}</span>
          </div>
        </div>
        {data.bio ? <p className="whitespace-pre-wrap text-muted">{data.bio}</p> : null}
      </Card>

      <Card>
        <CardTitle>Public record</CardTitle>
        <dl className="flex flex-col gap-3 text-[15px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Completed challenges</dt>
            <dd className="tnum font-bold">{data.completed_challenges_count}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Check-in streak</dt>
            <dd className="tnum font-bold">{data.current_verified_streak} days</dd>
          </div>
        </dl>
        <Helper>
          Reflections, triggers, urge ratings, and relapse records are never shown on a profile —
          not to anyone, ever.
        </Helper>
      </Card>

      {!isSelf ? (
        <Card>
          <CardTitle>Keep yourself safe</CardTitle>
          <Helper>
            Report a specific post from the feed. Block if you would rather not see this member at
            all.
          </Helper>
          <BlockButton targetId={data.id} handle={data.handle} />
        </Card>
      ) : null}
    </div>
  );
};

export default UserProfile;
