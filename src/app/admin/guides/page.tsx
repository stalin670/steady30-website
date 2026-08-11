import type { Metadata } from 'next';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { AdminPeerGuideApplicationSummary } from '@/lib/core/database';
import { requireStaff } from '@/lib/session';
import { GuidesConsole } from './guides-console';

export const metadata: Metadata = {
  title: 'Peer guide review',
  robots: { index: false, follow: false }
};

const Guides = async () => {
  const { supabase } = await requireStaff({ adminOnly: true });
  const { data } = await supabase.rpc('admin_list_peer_guide_applications', { p_limit: 50 });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Peer guide review</h1>
        <p className="text-[17px] text-muted">Approve, pause, or revoke alumni guides.</p>
      </header>

      <Card tone="tint">
        <CardTitle>What approval means</CardTitle>
        <Helper>
          An approved guide’s statement becomes public and they get a badge beside their handle.
          They are volunteers, not clinicians — approve people who sound steady and boundaried, not
          people who sound like they want to counsel.
        </Helper>
      </Card>

      <GuidesConsole
        applications={(data ?? []) as AdminPeerGuideApplicationSummary[]}
      />
    </div>
  );
};

export default Guides;
