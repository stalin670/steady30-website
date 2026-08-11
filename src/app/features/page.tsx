import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '@/components/site-chrome';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Everything in Steady30. The core practice is free; one tool is Steady30 Plus.'
};

type Feature = { name: string; body: string; plus?: boolean; free?: boolean };

const groups: { group: string; note?: string; features: Feature[] }[] = [
  {
    group: 'The daily practice',
    features: [
      {
        name: '30-day challenge, on your own terms',
        body: 'Choose what you are pausing, name why it matters, mark your high-risk hours, and write three if-then plans before day one begins.'
      },
      {
        name: 'A daily reflection with a real deadline',
        body: 'Mood, highest urge intensity, the triggers you met and the coping actions you used, plus a private written reflection. It closes at your local deadline — that is what makes the streak mean something.'
      },
      {
        name: 'Verified and abstinence streaks',
        body: 'Two separate counts: days you reflected on time, and days abstinent. Both are computed on the server, never by your device.'
      },
      {
        name: 'Honest reset',
        body: 'Record a relapse without a lecture. Your history is preserved rather than erased, and an accidental entry can be corrected.'
      },
      {
        name: 'Weekly pattern review',
        body: 'Seven days of mood and urge intensity side by side, your recurring trigger, and which coping action actually earned its place. Your reflection text is never loaded into the summary.',
        plus: true
      }
    ]
  },
  {
    group: 'In the moment',
    note: 'Steady Now works without an account and stores nothing at all.',
    features: [
      {
        name: 'Steady Now',
        body: 'Name what is happening, rate the urge, then ten minutes of space before you decide anything. Reassess afterwards.',
        free: true
      },
      {
        name: 'Three-minute urge surfing',
        body: 'A guided pause that rides the craving out instead of fighting it.'
      },
      {
        name: 'Paced box breathing',
        body: 'A slow, structured 4-4-4-4 rhythm you can follow with your eyes closed.'
      },
      {
        name: 'If-then coping plans',
        body: 'Pre-committed implementation intentions, written when you are calm and waiting for you when you are not.'
      }
    ]
  },
  {
    group: 'Support, only if you want it',
    note: 'Every social feature is opt-in and text-only. There are no direct messages.',
    features: [
      {
        name: 'Text-only community',
        body: 'Encouraging reflections and milestones, filtered by where people are: starting, building, sustaining, or alumni. Human moderators review reports.'
      },
      {
        name: 'Synchronized 30-day cohorts',
        body: 'A small group running the same 30 days as you, with one weekly pulse. The roster shows handles and nothing else — no streaks, no progress, no check-in status.'
      },
      {
        name: 'Alumni peer guides',
        body: 'Members who finished a challenge and volunteer public encouragement. Guides are volunteers, not clinicians.'
      },
      {
        name: 'Opt-in leaderboard',
        body: 'Verified streaks only, off by default, revocable at any time.'
      },
      {
        name: 'Trusted contacts',
        body: 'Accountability without surveillance. A trusted contact receives only the neutral support signal you choose to send — never your reflections, triggers, urge ratings, or relapse records.'
      }
    ]
  },
  {
    group: 'Learn',
    features: [
      {
        name: 'Reviewed lessons',
        body: 'A lesson for each day of the challenge, each labelled with its evidence level, intended outcome, limitations, reviewer credentials, and sources.'
      },
      {
        name: 'Completion and maintenance',
        body: 'A day-30 reflection on what actually helped, then an optional low-pressure weekly or monthly check-in.'
      }
    ]
  },
  {
    group: 'Privacy and control',
    features: [
      {
        name: 'No ads, no data sale, no behavioural analytics',
        body: 'Challenge starts, check-ins, reflections, mood, urges, and relapse records are never sent to advertising networks or third-party analytics, and are never used to train models.'
      },
      {
        name: 'Export everything',
        body: 'Download your full account data whenever you want it.'
      },
      {
        name: 'Delete everything',
        body: 'Permanently erase your account and its records from the app, or through the public deletion page.'
      }
    ]
  }
];

const Features = () => (
  <SiteShell>
    <div className="mx-auto w-full max-w-[860px] px-5 py-16">
      <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        Everything in Steady30
      </p>
      <h1 className="mt-4 text-[clamp(38px,6vw,58px)] font-extrabold">
        The core practice is free. One tool is Plus.
      </h1>
      <p className="mt-6 max-w-[62ch] text-[19px] text-muted">
        Daily check-ins, the 30-day challenge, community support, cohorts, trusted contacts, and
        safety resources always remain free. Steady30 Plus adds one deeper private tool, and it is
        never required to complete a challenge.
      </p>

      <div className="mt-16 flex flex-col gap-14">
        {groups.map((group) => (
          <section key={group.group} className="flex flex-col gap-2">
            <h2 className="font-mono text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              {group.group}
            </h2>
            {group.note ? <p className="max-w-[62ch] text-muted">{group.note}</p> : null}

            <div className="mt-3 flex flex-col">
              {group.features.map((feature) => (
                <article
                  key={feature.name}
                  className="flex flex-col gap-1.5 border-t border-line py-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[19px] font-bold">{feature.name}</h3>
                    {feature.plus ? (
                      <Link
                        href="/plus"
                        className="rounded-md border border-ink px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.08em] hover:bg-card-hover"
                      >
                        PLUS
                      </Link>
                    ) : null}
                    {feature.free ? (
                      <span className="rounded-md border border-accent bg-accent-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-accent">
                        NO ACCOUNT
                      </span>
                    ) : null}
                  </div>
                  <p className="max-w-[64ch] text-muted">{feature.body}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-ink p-8">
        <div>
          <h2 className="text-[24px] font-extrabold">Start whenever you are ready.</h2>
          <p className="mt-2 max-w-[52ch] text-muted">
            Your challenge begins at your next local midnight, so today can be used to prepare.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-bold text-on-primary hover:bg-primary-hover"
        >
          Start my 30 days
        </Link>
      </div>
    </div>
  </SiteShell>
);

export default Features;
