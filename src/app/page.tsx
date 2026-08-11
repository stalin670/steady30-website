import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteShell } from '@/components/site-chrome';
import { createClient } from '@/lib/supabase/server';

// The landing page decides whether to redirect a signed-in member to /today, so it
// has to run per request. Prerendered, that check silently stops happening.
export const dynamic = 'force-dynamic';

const cards = [
  {
    title: 'A daily practice',
    body: 'One short reflection helps you notice what made today easier or harder — and choose what to try tomorrow.'
  },
  {
    title: 'Support on your terms',
    body: 'Use the practice privately, invite a trusted contact, or take part in optional text-only peer support.'
  },
  {
    title: 'Always yours',
    body: 'Export your data or permanently delete your account. The free core practice stays free.'
  }
];

const steps = [
  {
    title: 'Shape your 30 days',
    body: 'Name what you are pausing, when the risky hours are, and three if-then plans for the moments that test you.'
  },
  {
    title: 'Reflect once a day',
    body: 'Mood, urge intensity, what triggered it, what you did instead. It takes a minute and it closes at your deadline.'
  },
  {
    title: 'Read the week back',
    body: 'See how mood and urges moved together, which trigger recurred, and which coping action actually earned its place.'
  }
];

const Home = async () => {
  // Mirrors ../Steady30/src/app/index.tsx: a member with a handle goes straight to
  // Today; a member without one still needs onboarding.
  const supabase = await createClient();
  let signedIn = false;

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      signedIn = true;
      const { data: profile } = await supabase
        .from('profiles')
        .select('handle')
        .eq('id', user.id)
        .maybeSingle();

      redirect(profile?.handle ? '/today' : '/onboarding');
    }
  }

  return (
    <SiteShell signedIn={signedIn}>
      {/* hero */}
      <section className="mx-auto w-full max-w-[1060px] px-5 pt-20 pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
              Private · adults 18+
            </p>
            <h1 className="mt-4 max-w-[12ch] text-[clamp(42px,7vw,74px)] font-extrabold">
              One honest day at a time.
            </h1>
            <p className="mt-6 max-w-[58ch] text-[19px] text-muted">
              Steady30 is a voluntary 30-day accountability practice for adults who want to pause
              pornography use and masturbation on their own terms — without shame, pressure, or
              pseudoscientific promises.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-in"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-bold text-on-primary hover:bg-primary-hover"
              >
                Start my 30 days
              </Link>
              <Link
                href="/features"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* A still of the real Today screen — same tokens, same tabular numerals. */}
          <div
            aria-hidden="true"
            className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted">Day 12 of 30</span>
              <span className="rounded-md border border-accent bg-accent-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-accent">
                CHECKED IN
              </span>
            </div>
            <span className="tnum text-[40px] leading-none font-extrabold tracking-[-0.04em]">12</span>
            <div className="h-[7px] overflow-hidden rounded-full bg-line">
              <span className="block h-full w-[40%] rounded-full bg-primary" />
            </div>
            <div className="tnum flex justify-between text-[13px] text-subtle">
              <span>Verified streak 12</span>
              <span>Abstinence 12</span>
            </div>
          </div>
        </div>
      </section>

      {/* promise */}
      <section className="mx-auto w-full max-w-[1060px] px-5">
        <div className="rounded-2xl bg-accent-muted p-8">
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold">Private by design.</h2>
          <p className="mt-3 max-w-[66ch] text-muted">
            Your reflections are private. Community support is optional. Steady30 has no ads and does
            not sell personal data or use behavioural analytics.
          </p>
        </div>
      </section>

      {/* three cards */}
      <section className="mx-auto grid w-full max-w-[1060px] gap-5 px-5 py-16 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-line bg-card p-6">
            <h3 className="text-[19px] font-bold">{card.title}</h3>
            <p className="mt-3 text-muted">{card.body}</p>
          </article>
        ))}
      </section>

      {/* how it works — numbered because the practice genuinely is a sequence */}
      <section className="mx-auto w-full max-w-[1060px] px-5 pb-16">
        <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold">How it works</h2>
        <ol className="mt-8 flex flex-col">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1 border-t border-line py-6"
            >
              <span className="tnum pt-1 font-mono text-[12px] text-subtle">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[19px] font-bold">{step.title}</h3>
              <p className="col-start-2 max-w-[62ch] text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* medical disclaimer */}
      <section className="mx-auto w-full max-w-[1060px] px-5">
        <div className="rounded-2xl border border-warning bg-warning-muted p-8">
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold">Not medical treatment.</h2>
          <p className="mt-3 max-w-[66ch]">
            Steady30 is an educational self-help tool, not therapy, counselling, diagnosis, or
            emergency support. If distress is severe or persistent, please contact a qualified
            professional. See the{' '}
            <Link href="/safety" className="underline underline-offset-[3px]">
              safety resources
            </Link>
            .
          </p>
        </div>
      </section>

      {/* steady now — always one click away, signed in or not */}
      <section className="mx-auto w-full max-w-[1060px] px-5 py-16">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-ink p-8">
          <div>
            <h2 className="text-[24px] font-extrabold">Under pressure right now?</h2>
            <p className="mt-2 text-muted">
              Ten minutes of space between an urge and a decision. No account needed. Nothing is
              saved.
            </p>
          </div>
          <Link
            href="/steady-now"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-bold text-on-primary hover:bg-primary-hover"
          >
            Open Steady Now
          </Link>
        </div>
      </section>
    </SiteShell>
  );
};

export default Home;
