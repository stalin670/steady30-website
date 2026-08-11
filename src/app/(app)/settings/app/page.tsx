import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Install Steady30',
  robots: { index: false, follow: false }
};

const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.steady30.app';
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;

/** Replaces the app's widget-settings screen, which has no web equivalent. */
const InstallApp = async () => {
  await requireMember();

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/me"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← My account
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Install Steady30</h1>
        <p className="text-[17px] text-muted">Same account, same streak, on any device.</p>
      </header>

      <Card>
        <CardTitle>Add this site to your home screen</CardTitle>
        <Helper>
          On iOS, open the share menu in Safari and choose <strong>Add to Home Screen</strong>. On
          Android Chrome, open the menu and choose <strong>Install app</strong>. It opens without
          browser chrome, and the icon is not labelled with what the app is for.
        </Helper>
      </Card>

      <Card>
        <CardTitle>Or get the native app</CardTitle>
        <Helper>
          Signing in with the same email gives you the same account. Your streak, history, and
          check-ins are computed on the server, so both stay in step automatically.
        </Helper>
        <div className="flex flex-wrap gap-3">
          <a
            href={PLAY_STORE_URL}
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
          >
            Google Play
          </a>
          {APP_STORE_URL ? (
            <a
              href={APP_STORE_URL}
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
            >
              App Store
            </a>
          ) : null}
        </div>
      </Card>

      <Card tone="tint">
        <CardTitle>Home screen widget</CardTitle>
        <Helper>
          The streak widget is a native feature and has no browser equivalent, so it is only
          available in the mobile app. Nothing else differs between the two.
        </Helper>
      </Card>
    </div>
  );
};

export default InstallApp;
