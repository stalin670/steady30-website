import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireMember } from '@/lib/session';
import { BoxBreathing, IfThenPlans, UrgeSurfing } from './tools';

export const metadata: Metadata = {
  title: 'Coping tool',
  robots: { index: false, follow: false }
};

const TOOLS = {
  'urge-surfing': {
    title: 'Urge surfing',
    subtitle: 'Ride the craving wave without escalating.'
  },
  'paced-breathing': {
    title: 'Paced box breathing',
    subtitle: 'A slow, structured 4-4-4-4 rhythm.'
  },
  'if-then-plan': {
    title: 'If-then coping plans',
    subtitle: 'Pre-committed implementation intentions.'
  }
} as const;

type ToolSlug = keyof typeof TOOLS;

const Tool = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  if (!(slug in TOOLS)) notFound();

  const tool = TOOLS[slug as ToolSlug];
  const { supabase } = await requireMember();

  // Only the if-then builder persists anything; the timers store nothing at all.
  const plans =
    slug === 'if-then-plan'
      ? ((
          await supabase
            .from('coping_plans')
            .select('id, if_cue, then_action')
            .order('created_at', { ascending: true })
        ).data ?? [])
      : [];

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/learn"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Learn and practice
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">{tool.title}</h1>
        <p className="text-[17px] text-muted">{tool.subtitle}</p>
      </header>

      {slug === 'urge-surfing' ? <UrgeSurfing /> : null}
      {slug === 'paced-breathing' ? <BoxBreathing /> : null}
      {slug === 'if-then-plan' ? (
        <IfThenPlans
          initialPlans={plans.map((plan) => ({
            id: plan.id,
            ifCue: plan.if_cue,
            thenAction: plan.then_action
          }))}
        />
      ) : null}
    </div>
  );
};

export default Tool;
