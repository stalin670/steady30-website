'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Ported from ../Steady30/src/screens/steady-now-screen.tsx.
const TRIGGERS = [
  'Stress',
  'Boredom',
  'Loneliness',
  'Late night',
  'Triggering content',
  'Something else'
] as const;

const DELAY_SECONDS = 600;

const formatTimer = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

type Step = 'assess' | 'delay' | 'reassess' | 'complete';

const Card = ({
  children,
  tone = 'card'
}: {
  children: React.ReactNode;
  tone?: 'card' | 'tint';
}) => (
  <div
    className={`flex flex-col gap-4 rounded-2xl p-6 ${
      tone === 'tint' ? 'bg-primary-muted' : 'border border-line bg-card'
    }`}
  >
    {children}
  </div>
);

const Rating = ({
  value,
  onChange,
  label
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="font-bold">{label}</legend>
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 11 }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChange(index)}
          aria-pressed={value === index}
          className={`tnum min-w-11 flex-1 rounded-md border py-2 text-sm ${
            value === index
              ? 'border-primary bg-primary font-bold text-on-primary'
              : 'border-line bg-card text-muted hover:border-line-strong hover:text-ink'
          }`}
        >
          {index}
        </button>
      ))}
    </div>
    <div className="flex justify-between text-[13px] text-subtle">
      <span>0 · no urge</span>
      <span>10 · intense spike</span>
    </div>
  </fieldset>
);

const buttonBase =
  'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-center font-bold';
const primaryButton = `${buttonBase} bg-primary text-on-primary hover:bg-primary-hover`;
const ghostButton = `${buttonBase} border border-line-strong hover:bg-card-hover`;

export const SteadyNow = () => {
  const [step, setStep] = useState<Step>('assess');
  const [urgeBefore, setUrgeBefore] = useState(5);
  const [urgeAfter, setUrgeAfter] = useState(5);
  const [trigger, setTrigger] = useState<string>('Stress');
  const [deadline, setDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(DELAY_SECONDS);

  // Driven from a wall-clock deadline rather than an accumulating interval, so a
  // backgrounded or throttled tab cannot stretch ten minutes into fifteen.
  useEffect(() => {
    if (deadline === null) return;

    const tick = () => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setDeadline(null);
        setStep('reassess');
      }
    };

    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [deadline]);

  const startDelay = () => {
    setDeadline(Date.now() + DELAY_SECONDS * 1000);
    setSecondsLeft(DELAY_SECONDS);
    setStep('delay');
  };

  const reset = () => {
    setStep('assess');
    setUrgeBefore(5);
    setUrgeAfter(5);
    setTrigger('Stress');
    setDeadline(null);
    setSecondsLeft(DELAY_SECONDS);
  };

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(34px,6vw,46px)] font-extrabold">Steady Now</h1>
        <p className="text-[19px] text-muted">Create ten minutes between urge and action.</p>
      </header>

      <p className="rounded-xl bg-accent-muted px-5 py-4 text-[15px]">
        Private by design: your urge rating and selected trigger stay on this screen. Nothing is
        saved, sent, or attached to an account.
      </p>

      {step === 'assess' ? (
        <Card>
          <h2 className="text-[21px] font-bold">Name what is happening</h2>
          <p className="text-muted">
            An urge is information, not an instruction. Rate it without judging yourself.
          </p>
          <Rating label="How strong is the urge right now?" value={urgeBefore} onChange={setUrgeBefore} />
          <fieldset className="flex flex-col gap-3">
            <legend className="font-bold">What is driving it?</legend>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTrigger(item)}
                  aria-pressed={trigger === item}
                  className={`rounded-md border px-4 py-2 text-sm ${
                    trigger === item
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-line bg-card hover:border-line-strong'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" onClick={startDelay} className={primaryButton}>
            Make ten minutes of space
          </button>
        </Card>
      ) : null}

      {step === 'delay' ? (
        <Card tone="tint">
          <p className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
            Ten minutes of space
          </p>
          <p
            className="tnum text-center text-[64px] leading-none font-extrabold tracking-[-0.04em]"
            role="timer"
            aria-live="off"
          >
            {formatTimer(secondsLeft)}
          </p>
          <p className="text-center text-muted">
            You do not have to do anything with this time. Staying is the whole exercise.
          </p>
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-muted">
              Try breathing in for four, holding for four, out for four, holding for four. Keep going
              until the timer runs out.
            </p>
            <button type="button" onClick={() => setStep('reassess')} className={primaryButton}>
              I’m ready to reassess
            </button>
          </div>
        </Card>
      ) : null}

      {step === 'reassess' ? (
        <Card>
          <h2 className="text-[21px] font-bold">Where is it now?</h2>
          <p className="text-muted">
            Rate the same urge again. Whatever the number, you put ten minutes between the urge and a
            decision — that is the skill.
          </p>
          <Rating label="How strong is the urge now?" value={urgeAfter} onChange={setUrgeAfter} />
          <button type="button" onClick={() => setStep('complete')} className={primaryButton}>
            Finish
          </button>
        </Card>
      ) : null}

      {step === 'complete' ? (
        <Card>
          <h2 className="text-[21px] font-bold">What you did with ten minutes counts.</h2>
          <div className="flex gap-8 border-y border-line py-5">
            <div>
              <p className="text-[13px] text-subtle">Before</p>
              <p className="tnum text-[34px] font-extrabold">{urgeBefore}</p>
            </div>
            <div>
              <p className="text-[13px] text-subtle">After</p>
              <p className="tnum text-[34px] font-extrabold">{urgeAfter}</p>
            </div>
            <div>
              <p className="text-[13px] text-subtle">Driver</p>
              <p className="text-[19px] font-bold">{trigger}</p>
            </div>
          </div>
          <p className="text-muted">
            None of this was recorded. If you want to keep track of patterns like this over time,
            that is what the daily reflection is for.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={reset} className={ghostButton}>
              Start again
            </button>
            <Link href="/" className={primaryButton}>
              Back to Steady30
            </Link>
          </div>
        </Card>
      ) : null}

      <p className="text-[13px] text-subtle">
        Steady30 is not monitored for emergencies. If you may be in immediate danger, use the{' '}
        <Link href="/safety" className="underline underline-offset-[3px]">
          safety resources
        </Link>{' '}
        or contact local emergency services.
      </p>
    </div>
  );
};
