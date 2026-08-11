'use client';

import { useEffect, useRef, useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';

/** Wall-clock driven, like Steady Now: a throttled tab must not stretch the timer. */
const useCountdown = (seconds: number) => {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (deadline === null) return;

    const tick = () => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setDeadline(null);
    };

    tick();
    const timer = setInterval(tick, 200);
    return () => clearInterval(timer);
  }, [deadline]);

  return {
    remaining,
    running: deadline !== null,
    start: () => {
      setRemaining(seconds);
      setDeadline(Date.now() + seconds * 1000);
    },
    stop: () => {
      setDeadline(null);
      setRemaining(seconds);
    }
  };
};

const formatClock = (total: number) =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

// ── urge surfing ────────────────────────────────────────────────────────────
const URGE_PROMPTS = [
  { at: 180, text: 'Settle. Notice where in your body the urge actually lives.' },
  { at: 135, text: 'Describe it to yourself: tight, warm, restless, heavy?' },
  { at: 90, text: 'Watch it rise. It is a wave, not an instruction.' },
  { at: 45, text: 'Notice it has already changed since you started.' },
  { at: 0, text: 'It passed without you acting on it. That is the whole skill.' }
];

export const UrgeSurfing = () => {
  const { remaining, running, start, stop } = useCountdown(180);
  const prompt = URGE_PROMPTS.find((step) => remaining >= step.at) ?? URGE_PROMPTS.at(-1)!;
  const progress = ((180 - remaining) / 180) * 100;

  return (
    <Card>
      <CardTitle>Three-minute urge surfing</CardTitle>
      <Helper>Ride the craving without escalating. Nothing here is recorded.</Helper>

      <p className="tnum py-2 text-center text-[64px] leading-none font-extrabold tracking-[-0.04em]">
        {formatClock(remaining)}
      </p>

      <div className="h-[7px] overflow-hidden rounded-full bg-line">
        <span
          className="block h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p aria-live="polite" className="min-h-12 text-center text-[17px]">
        {running || remaining === 0 ? prompt.text : 'Sit somewhere you can stay for three minutes.'}
      </p>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={start}>
          {running ? 'Restart' : 'Start'}
        </Button>
        {running ? (
          <Button type="button" variant="outline" onClick={stop}>
            Stop
          </Button>
        ) : null}
      </div>
    </Card>
  );
};

// ── box breathing ───────────────────────────────────────────────────────────
const PHASES = ['Breathe in', 'Hold', 'Breathe out', 'Hold'] as const;

export const BoxBreathing = () => {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (!running) return;

    startedAt.current = Date.now();
    const timer = setInterval(() => {
      // Derived from elapsed wall-clock rather than accumulated ticks.
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setPhase(Math.floor(elapsed / 4) % 4);
      setCount(4 - (elapsed % 4));
    }, 200);

    return () => clearInterval(timer);
  }, [running]);

  return (
    <Card>
      <CardTitle>Paced box breathing</CardTitle>
      <Helper>A slow, structured 4-4-4-4 rhythm. Nothing here is recorded.</Helper>

      <div className="flex flex-col items-center gap-4 py-4">
        <div
          className={`grid size-40 place-items-center rounded-full border-2 border-ink transition-transform duration-1000 ease-in-out ${
            running && (phase === 0 || phase === 1) ? 'scale-110' : 'scale-90'
          }`}
        >
          <span className="tnum text-[40px] font-extrabold">{running ? count : 4}</span>
        </div>
        <p aria-live="polite" className="text-[19px] font-bold">
          {running ? PHASES[phase] : 'Ready when you are'}
        </p>
      </div>

      <Button type="button" onClick={() => setRunning(!running)} full>
        {running ? 'Pause' : 'Start paced breathing'}
      </Button>
    </Card>
  );
};

// ── if-then plans ───────────────────────────────────────────────────────────
type SavedPlan = { id: string; ifCue: string; thenAction: string };

export const IfThenPlans = ({ initialPlans }: { initialPlans: SavedPlan[] }) => {
  const [plans, setPlans] = useState(initialPlans);
  const [ifCue, setIfCue] = useState('');
  const [thenAction, setThenAction] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPlan = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!ifCue.trim() || !thenAction.trim()) {
      setError('Fill in both the cue and the response.');
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to save a plan.');
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('coping_plans')
      .insert({
        user_id: user.id,
        if_cue: ifCue.trim(),
        then_action: thenAction.trim(),
        source: 'urge_tool'
      })
      .select('id, if_cue, then_action')
      .single();

    setSaving(false);

    if (insertError || !data) {
      setError(formatErrorMessage(insertError));
      return;
    }

    setPlans((current) => [
      ...current,
      { id: data.id, ifCue: data.if_cue, thenAction: data.then_action }
    ]);
    setIfCue('');
    setThenAction('');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardTitle>If-then coping plans</CardTitle>
        <Helper>
          Pre-committed implementation intentions. Write them while you are calm and keep each
          response small enough to do immediately. These plans are private.
        </Helper>

        <form onSubmit={addPlan} className="flex flex-col gap-4">
          {error ? <Banner variant="danger">{error}</Banner> : null}
          <Input
            id="if-cue"
            label="IF"
            placeholder="I am alone with my phone late at night…"
            maxLength={280}
            value={ifCue}
            onChange={(event) => setIfCue(event.target.value)}
          />
          <Input
            id="then-action"
            label="THEN"
            placeholder="I will leave the room and walk for five minutes."
            maxLength={280}
            value={thenAction}
            onChange={(event) => setThenAction(event.target.value)}
          />
          <Button type="submit" loading={saving} full>
            Save plan
          </Button>
        </form>
      </Card>

      {plans.length > 0 ? (
        <Card>
          <CardTitle>Your plans</CardTitle>
          <ul className="flex flex-col gap-4">
            {plans.map((plan) => (
              <li key={plan.id} className="flex flex-col gap-1 border-t border-line pt-4 first:border-t-0 first:pt-0">
                <span className="font-mono text-[11px] tracking-[0.08em] text-subtle uppercase">
                  If
                </span>
                <span>{plan.ifCue}</span>
                <span className="mt-2 font-mono text-[11px] tracking-[0.08em] text-subtle uppercase">
                  Then
                </span>
                <span className="font-semibold">{plan.thenAction}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
};
