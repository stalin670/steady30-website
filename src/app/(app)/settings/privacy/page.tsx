import type { Metadata } from 'next';
import Link from 'next/link';
import { requireMember } from '@/lib/session';
import { PrivacyForm } from './privacy-form';

export const metadata: Metadata = {
  title: 'Privacy and visibility',
  robots: { index: false, follow: false }
};

const PrivacySettings = async () => {
  const { supabase, user } = await requireMember();

  const { data } = await supabase
    .from('profiles')
    .select('leaderboard_opt_in, profile_visibility')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/me"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← My account
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Privacy and visibility</h1>
        <p className="text-[17px] text-muted">Who can see your handle, and nothing more.</p>
      </header>

      <PrivacyForm
        initialOptIn={data?.leaderboard_opt_in ?? false}
        initialVisibility={data?.profile_visibility ?? 'members'}
      />
    </div>
  );
};

export default PrivacySettings;
