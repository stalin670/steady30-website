import type { Metadata } from 'next';
import { COMMUNITY_STAGES, type CommunityFeedPost, type CommunityStage } from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { CommunityFeed } from './community-feed';

export const metadata: Metadata = {
  title: 'Community support',
  robots: { index: false, follow: false }
};

const isStage = (value: string | undefined): value is CommunityStage =>
  Boolean(value) && (COMMUNITY_STAGES as readonly string[]).includes(value!);

const Community = async ({ searchParams }: { searchParams: Promise<{ stage?: string }> }) => {
  const { stage: raw } = await searchParams;
  const stage: CommunityStage | 'all' = isStage(raw) ? raw : 'all';

  const { supabase } = await requireMember();
  const { data } = await supabase.rpc('community_feed', {
    p_limit: 30,
    p_stage: stage === 'all' ? null : stage
  });

  return (
    <div className="mx-auto w-full max-w-[860px] px-5 py-10">
      <CommunityFeed initialPosts={(data ?? []) as CommunityFeedPost[]} stage={stage} />
    </div>
  );
};

export default Community;
