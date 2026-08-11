import type { Metadata } from 'next';
import Link from 'next/link';
import type { MyPeerGuideStatusResponse } from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { PeerGuideForm } from './peer-guide-form';

export const metadata: Metadata = {
  title: 'Peer guide',
  robots: { index: false, follow: false }
};

const PeerGuide = async () => {
  const { supabase } = await requireMember();
  const { data } = await supabase.rpc('my_peer_guide_status');

  const status = (data ?? {
    is_eligible: false,
    application: null,
    guide: null
  }) as MyPeerGuideStatusResponse;

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/guides"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← All peer guides
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Alumni peer guide</h1>
        <p className="text-[17px] text-muted">Voluntary community encouragement.</p>
      </header>

      <PeerGuideForm status={status} />
    </div>
  );
};

export default PeerGuide;
