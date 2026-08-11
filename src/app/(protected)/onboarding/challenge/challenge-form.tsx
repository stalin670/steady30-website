'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  Banner,
  Button,
  Card,
  CardTitle,
  ChipGroup,
  Helper,
  Input,
  RadioGroup,
  TextArea
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';
import { createIdempotencyKey } from '@/lib/core/idempotency';
import {
  ALLOWED_TRIGGER_CATEGORIES,
  ChallengeSetupSchema,
  HIGH_RISK_WINDOWS
} from '@/lib/core/validation';

type GoalScope = 'pornography' | 'masturbation' | 'both';
type SupportStyle = 'private' | 'community' | 'balanced';
type Plan = { ifCue: string; thenAction: string };

// 'No trigger today' is a check-in answer, not something to anticipate.
const ANTICIPATED_TRIGGERS = ALLOWED_TRIGGER_CATEGORIES.filter(
  (trigger) => trigger !== 'No trigger today'
);

export type ExistingSetup = {
  goalScope: GoalScope;
  primaryReason: string;
  highRiskWindows: string[];
  triggerCategories: string[];
  supportStyle: SupportStyle;
  plans: Plan[];
  hasExistingAttempt: boolean;
};

const EMPTY_PLANS: Plan[] = [
  { ifCue: '', thenAction: '' },
  { ifCue: '', thenAction: '' },
  { ifCue: '', thenAction: '' }
];

export const ChallengeForm = ({ existing }: { existing: ExistingSetup | null }) => {
  const router = useRouter();
  const [goalScope, setGoalScope] = useState<GoalScope>(existing?.goalScope ?? 'both');
  const [primaryReason, setPrimaryReason] = useState(existing?.primaryReason ?? '');
  const [highRiskWindows, setHighRiskWindows] = useState<string[]>(
    existing?.highRiskWindows ?? []
  );
  const [triggerCategories, setTriggerCategories] = useState<string[]>(
    existing?.triggerCategories ?? []
  );
  const [supportStyle, setSupportStyle] = useState<SupportStyle>(
    existing?.supportStyle ?? 'balanced'
  );
  const [plans, setPlans] = useState<Plan[]>(existing?.plans ?? EMPTY_PLANS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef(createIdempotencyKey());

  const hasExistingAttempt = existing?.hasExistingAttempt ?? false;

  const toggle = (value: string, selected: string[], update: (next: string[]) => void) =>
    update(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    );

  const updatePlan = (index: number, field: keyof Plan, value: string) =>
    setPlans((current) =>
      current.map((plan, planIndex) =>
        planIndex === index ? { ...plan, [field]: value } : plan
      )
    );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const result = ChallengeSetupSchema.safeParse({
      goalScope,
      primaryReason,
      highRiskWindows,
      triggerCategories,
      supportStyle,
      plans
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Please complete your challenge setup.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const { error: setupError } = await supabase.rpc('save_challenge_setup', {
        p_goal_scope: result.data.goalScope,
        p_primary_reason: result.data.primaryReason,
        p_high_risk_windows: result.data.highRiskWindows,
        p_trigger_categories: result.data.triggerCategories,
        p_support_style: result.data.supportStyle,
        p_plans: result.data.plans.map((plan) => ({
          if_cue: plan.ifCue,
          then_action: plan.thenAction
        }))
      });
      if (setupError) throw setupError;

      // Editing a plan mid-challenge must not start a second attempt.
      if (hasExistingAttempt) {
        router.replace('/today');
        router.refresh();
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('preferred_timezone')
        .single();
      if (profileError) throw profileError;

      const { error: startError } = await supabase.rpc('start_attempt', {
        p_timezone: profile.preferred_timezone || 'UTC',
        p_rule_version: '1.0',
        p_idempotency_key: idempotencyKey.current
      });
      if (startError) throw startError;

      router.replace('/today');
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}

      <Card>
        <CardTitle>Where do you want more support?</CardTitle>
        <Helper>
          This personalises your plan. The 30-day challenge still avoids both intentional
          pornography and masturbation.
        </Helper>
        <RadioGroup<GoalScope>
          name="Goal scope"
          value={goalScope}
          onSelect={setGoalScope}
          options={[
            { value: 'both', label: 'Both', sublabel: 'Support across both behaviours' },
            { value: 'pornography', label: 'Pornography', sublabel: 'Make this your primary focus' },
            { value: 'masturbation', label: 'Masturbation', sublabel: 'Make this your primary focus' }
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Your reason</CardTitle>
        <TextArea
          id="primary-reason"
          label="Why do these 30 days matter to you?"
          placeholder="I want to make room for…"
          maxLength={500}
          value={primaryReason}
          onChange={(event) => setPrimaryReason(event.target.value)}
          hint={
            <span className="tnum">
              {primaryReason.length}/500 · at least 20 characters · private and visible only to you
            </span>
          }
          required
        />
      </Card>

      <Card>
        <CardTitle>Know the difficult moments</CardTitle>
        <ChipGroup
          legend="When are you most vulnerable?"
          options={HIGH_RISK_WINDOWS}
          selected={highRiskWindows}
          onToggle={(value) => toggle(value, highRiskWindows, setHighRiskWindows)}
        />
        <ChipGroup
          legend="What usually sets the pattern in motion?"
          options={ANTICIPATED_TRIGGERS}
          selected={triggerCategories}
          onToggle={(value) => toggle(value, triggerCategories, setTriggerCategories)}
        />
        <Helper>
          These selections stay private. They are never placed in community posts or analytics.
        </Helper>
      </Card>

      <Card>
        <CardTitle>Choose your support style</CardTitle>
        <RadioGroup<SupportStyle>
          name="Support style"
          value={supportStyle}
          onSelect={setSupportStyle}
          options={[
            {
              value: 'balanced',
              label: 'Balanced',
              sublabel: 'Private reflection plus optional community support'
            },
            {
              value: 'private',
              label: 'Mostly private',
              sublabel: 'Keep your practice focused inward'
            },
            {
              value: 'community',
              label: 'Community encouraged',
              sublabel: 'Lean on safe, text-only peer support'
            }
          ]}
        />
      </Card>

      <Card>
        <CardTitle>Make three if-then plans</CardTitle>
        <Helper>
          Keep each response small enough to do immediately. All three are required, and all three
          are private.
        </Helper>
        {plans.map((plan, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 border-t border-line pt-5 first-of-type:border-t-0 first-of-type:pt-0"
          >
            <p className="font-mono text-[11px] font-extrabold tracking-[0.1em] text-muted uppercase">
              Plan {index + 1}
            </p>
            <Input
              id={`if-${index}`}
              label="IF"
              placeholder="I am alone with my phone late at night…"
              maxLength={280}
              value={plan.ifCue}
              onChange={(event) => updatePlan(index, 'ifCue', event.target.value)}
            />
            <Input
              id={`then-${index}`}
              label="THEN"
              placeholder="I will leave the room and walk for five minutes."
              maxLength={280}
              value={plan.thenAction}
              onChange={(event) => updatePlan(index, 'thenAction', event.target.value)}
            />
          </div>
        ))}
      </Card>

      <Card tone="tint">
        <CardTitle>The commitment</CardTitle>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[14px] text-muted">
          <li>
            Avoid intentional pornography viewing and intentional masturbation for 30 days.
          </li>
          <li>
            Partnered activity, involuntary emissions, and thoughts or urges without acting are not
            resets.
          </li>
          <li>Your first full day begins at the next midnight in your selected timezone.</li>
        </ul>
        <Button type="submit" loading={saving} full>
          {hasExistingAttempt ? 'Save plan changes' : 'Save plan and start challenge'}
        </Button>
      </Card>
    </form>
  );
};
