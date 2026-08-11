import type { Metadata } from 'next';
import Link from 'next/link';
import { Banner, Card, CardTitle, Helper } from '@/components/ui';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Reflection reminders',
  robots: { index: false, follow: false }
};

const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  'https://play.google.com/store/apps/details?id=com.steady30.app';

/**
 * No toggle here on purpose.
 *
 * The app schedules a local notification via expo-notifications. The browser
 * equivalent is Web Push — a service worker, VAPID keys, and a push_subscriptions
 * table — which is phase 7+ work in docs/web-app-spec.md §7. Shipping a switch
 * that silently does nothing would be worse than shipping no switch: someone would
 * rely on a reminder that never arrives, on the one day they needed it.
 */
const Notifications = async () => {
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
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Reflection reminders</h1>
        <p className="text-[17px] text-muted">Discreet, and off unless you ask for them.</p>
      </header>

      <Banner variant="info">
        Reminders are not available on the website yet. There is deliberately no switch here rather
        than one that quietly does nothing.
      </Banner>

      <Card>
        <CardTitle>Available in the mobile app</CardTitle>
        <Helper>
          The Steady30 app can schedule a discreet daily reminder at 20:00 in your timezone. It is a
          local notification — the reminder never leaves your device, and its text never mentions
          what the app is for.
        </Helper>
        <a
          href={PLAY_STORE_URL}
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center self-start rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
        >
          Get the app on Google Play
        </a>
      </Card>

      <Card>
        <CardTitle>Coming to the web</CardTitle>
        <Helper>
          Browser reminders need Web Push, which is a separate subscription per browser rather than
          per account. When it ships it will be opt-in, revocable here, and worded as
          neutrally as the app’s.
        </Helper>
      </Card>

      <Card tone="tint">
        <CardTitle>Your deadline does not depend on a reminder</CardTitle>
        <Helper>
          The reflection window is set by your timezone, not by whether a notification arrived.
          Today’s countdown is always on{' '}
          <Link href="/today" className="underline underline-offset-[3px]">
            Today
          </Link>
          .
        </Helper>
      </Card>
    </div>
  );
};

export default Notifications;
