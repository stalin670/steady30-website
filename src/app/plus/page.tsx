import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '@/components/site-chrome';
import { Banner, Card, CardTitle, Eyebrow, Helper } from '@/components/ui';
import { getPlusStatus } from '@/lib/entitlement';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Steady30 Plus',
  description:
    'Steady30 Plus adds deeper private tools. The 30-day challenge, check-ins, community, and safety resources stay free.'
};

// Public: this is a pricing page, and bouncing a curious visitor to sign-in to
// read what a subscription includes would be hostile. It reads entitlement only
// when someone happens to be signed in.
export const dynamic = 'force-dynamic';

// Copy carried over verbatim from ../Steady30/src/screens/paywall-screen.tsx.
// Changing what Plus claims to include is a product decision, not a copy edit.
const BENEFITS = [
  'Advanced private weekly pattern reviews',
  'Access to every future Steady30 Plus tool',
  'No ads and no sale of your personal data'
];

const FREE_FOREVER = [
  'The 30-day challenge and daily check-ins',
  'Steady Now and the coping tools',
  'Community, cohorts, and peer guides',
  'Trusted contacts and safety resources',
  'Data export and account deletion'
];

const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.steady30.app';
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;

const Plus = async () => {
  const supabase = await createClient();

  let signedIn = false;
  let isPlus = false;

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
    if (user) isPlus = await getPlusStatus(supabase);
  }

  return (
    <SiteShell signedIn={signedIn}>
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-[clamp(30px,5vw,44px)] font-extrabold">Steady30 Plus</h1>
          <p className="text-[18px] text-muted">More private support, never pressure.</p>
        </header>

        <Card tone="outline">
          <Eyebrow>Optional membership</Eyebrow>
          <CardTitle>Keep the core challenge free.</CardTitle>
          <Helper>
            Plus adds deeper private tools. Daily check-ins, the 30-day challenge, community
            support, trusted contacts, and safety resources always remain free.
          </Helper>
        </Card>

        <Card>
          <CardTitle>What Plus adds</CardTitle>
          <ul className="flex flex-col gap-3">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span aria-hidden="true" className="font-bold">
                  ✓
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Free, and staying free</CardTitle>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-muted">
            {FREE_FOREVER.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <Eyebrow>Next for Plus</Eyebrow>
          <Helper>
            Custom reminder schedules, premium widget styles, and expanded private planning tools
            are next on the roadmap. They are not available yet, and Plus is not sold on the promise
            of them.
          </Helper>
        </Card>

        {isPlus ? (
          <Banner variant="success">
            Steady30 Plus is active on this account. Manage or cancel it in the store account you
            bought it with.
          </Banner>
        ) : (
          <Card tone="tint">
            <CardTitle>Plus is purchased in the mobile app</CardTitle>
            <Helper>
              Subscriptions are handled by Google Play and the App Store, so there is nothing to buy
              on this website. Once you subscribe in the app, Plus unlocks here automatically.
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
        )}

        {signedIn ? (
          <Link
            href="/today"
            className="inline-flex min-h-12 items-center justify-center self-start rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
          >
            Back to Today
          </Link>
        ) : null}

        <p className="text-[13px] text-subtle">
          Subscription pricing, trial terms, and renewal details are shown by Google Play or the App
          Store before you confirm a purchase. Steady30 does not sell personal reflections or
          behavioural data.
        </p>
      </div>
    </SiteShell>
  );
};

export default Plus;
