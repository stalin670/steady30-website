import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-chrome';
import { FormScreen, ScreenHeader } from '@/components/ui';
import { requireMember } from '@/lib/session';
import { ChallengeForm, type ExistingSetup } from './challenge-form';

export const metadata: Metadata = {
  title: 'Shape your 30 days',
  robots: { index: false, follow: false }
};

const EMPTY_PLANS = [
  { ifCue: '', thenAction: '' },
  { ifCue: '', thenAction: '' },
  { ifCue: '', thenAction: '' }
];

const ChallengeSetup = async () => {
  const { supabase } = await requireMember();

  // Preload an existing plan so this page doubles as "edit my plan", exactly as
  // ../Steady30/src/screens/challenge-setup-screen.tsx does.
  const [preferences, savedPlans, today] = await Promise.all([
    supabase.from('challenge_preferences').select('*').maybeSingle(),
    supabase
      .from('coping_plans')
      .select('if_cue, then_action, slot')
      .eq('source', 'challenge_setup')
      .order('slot', { ascending: true }),
    supabase.rpc('get_today_state')
  ]);

  const preference = preferences.data;
  const existing: ExistingSetup | null = preference
    ? {
        goalScope: preference.goal_scope,
        primaryReason: preference.primary_reason,
        highRiskWindows: preference.high_risk_windows ?? [],
        triggerCategories: preference.trigger_categories ?? [],
        supportStyle: preference.support_style,
        plans: EMPTY_PLANS.map((empty, index) => {
          const saved = savedPlans.data?.find((plan) => plan.slot === index + 1);
          return saved ? { ifCue: saved.if_cue, thenAction: saved.then_action } : empty;
        }),
        hasExistingAttempt: today.data ? today.data.status !== 'no_attempt' : false
      }
    : null;

  return (
    <SiteShell>
      <FormScreen>
        <ScreenHeader
          step="Step 2 of 2"
          title="Shape your 30 days"
          subtitle="A private plan for the moments that test you."
        />
        <ChallengeForm existing={existing} />
      </FormScreen>
    </SiteShell>
  );
};

export default ChallengeSetup;
