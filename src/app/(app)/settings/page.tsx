import type { Metadata } from 'next';
import Link from 'next/link';
import { requireMember } from '@/lib/session';
import { SettingsForm, ThemeCard, TimezoneCard } from './settings-form';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false }
};

const Settings = async () => {
  const { supabase, user, profile } = await requireMember();

  const { data } = await supabase
    .from('profiles')
    .select('display_name, bio, preferred_timezone, leaderboard_opt_in, profile_visibility')
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
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Settings</h1>
        <p className="text-[17px] text-muted">Profile, timezone, and appearance.</p>
      </header>

      <SettingsForm
        initial={{
          displayName: data?.display_name ?? '',
          bio: data?.bio ?? '',
          timezone: data?.preferred_timezone ?? profile?.preferred_timezone ?? 'UTC',
          leaderboardOptIn: data?.leaderboard_opt_in ?? false,
          profileVisibility: data?.profile_visibility ?? 'members'
        }}
      />

      <TimezoneCard current={data?.preferred_timezone ?? profile?.preferred_timezone ?? 'UTC'} />
      <ThemeCard />
    </div>
  );
};

export default Settings;
