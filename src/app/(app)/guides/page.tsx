import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { PeerGuideSummary } from '@/lib/core/database';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Peer guides',
  robots: { index: false, follow: false }
};

const Guides = async () => {
  const { supabase } = await requireMember();
  const { data } = await supabase.rpc('list_peer_guides', { p_limit: 50 });
  const guides = (data ?? []) as PeerGuideSummary[];

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/community"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Community
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Peer guides</h1>
        <p className="text-[17px] text-muted">
          Alumni offering public community encouragement.
        </p>
      </header>

      <Card tone="tint">
        <Helper>
          Peer guides are members who completed a challenge and volunteered. They are not
          clinicians, they do not give medical advice, and they never see your private reflections.
        </Helper>
      </Card>

      {guides.length === 0 ? (
        <Card>
          <CardTitle>No active guides right now</CardTitle>
          <Helper>Guides are approved by moderators, so the list moves slowly by design.</Helper>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {guides.map((guide) => (
            <li key={guide.user_id}>
              <Card>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center rounded-full border border-line bg-primary-muted text-[12px] font-bold text-muted"
                  >
                    {guide.handle.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-semibold">{guide.display_name || `@${guide.handle}`}</span>
                  <span className="rounded-md border border-accent bg-accent-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-accent uppercase">
                    Guide
                  </span>
                </div>
                {guide.public_statement ? (
                  <p className="whitespace-pre-wrap text-muted">{guide.public_statement}</p>
                ) : null}
                <Link
                  href={`/u/${guide.handle}`}
                  className="inline-flex min-h-12 items-center justify-center self-start rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
                >
                  View public profile
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card>
        <CardTitle>Completed a challenge?</CardTitle>
        <Helper>You can apply to become a peer guide.</Helper>
        <Link
          href="/guides/me"
          className="inline-flex min-h-12 items-center justify-center self-start rounded-full bg-primary px-6 font-bold text-on-primary hover:bg-primary-hover"
        >
          Peer guide application
        </Link>
      </Card>
    </div>
  );
};

export default Guides;
