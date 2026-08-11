'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Banner,
  Button,
  Card,
  CardTitle,
  ChipGroup,
  Helper,
  RadioGroup,
  TextArea
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  COMPLETION_NEXT_STEP_LABELS,
  HELPFUL_PRACTICE_LABELS,
  MAINTENANCE_CADENCE_LABELS,
  MAINTENANCE_STATE_LABELS,
  type CompletionNextStep,
  type CompletionState,
  type MaintenanceCadence,
  type MaintenanceState
} from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';

const practiceOptions = Object.entries(HELPFUL_PRACTICE_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const CompletionForm = ({ state }: { state: CompletionState }) => {
  const router = useRouter();
  const [practices, setPractices] = useState<string[]>(state.reflection?.helpful_practices ?? []);
  const [note, setNote] = useState(state.reflection?.private_note ?? '');
  const [nextStep, setNextStep] = useState<CompletionNextStep>(
    state.reflection?.next_step ?? 'maintenance'
  );
  const [cadence, setCadence] = useState<MaintenanceCadence>(
    state.reflection?.maintenance_cadence ?? 'weekly'
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { error: rpcError } = await createClient().rpc('save_completion_reflection', {
        p_helpful_practices: practices,
        p_private_note: note.trim() || null,
        p_next_step: nextStep,
        p_maintenance_cadence: nextStep === 'maintenance' ? cadence : null
      });
      if (rpcError) throw rpcError;

      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {saved ? <Banner variant="success">Your closing reflection is saved.</Banner> : null}

      <Card>
        <CardTitle>What actually helped?</CardTitle>
        <ChipGroup
          legend="Select everything that made a real difference"
          options={practiceOptions}
          selected={practices}
          onToggle={(value) =>
            setPractices((current) =>
              current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
            )
          }
          tone="accent"
        />
      </Card>

      <Card>
        <CardTitle>Private closing note</CardTitle>
        <TextArea
          id="completion-note"
          label="Anything you want to remember from these 30 days"
          placeholder="What changed, what was harder than expected, what you would keep…"
          maxLength={500}
          rows={6}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint={
            <span className="tnum">
              {note.length}/500 · optional, but 20 characters minimum if you write one
            </span>
          }
        />
      </Card>

      <Card>
        <CardTitle>What’s next?</CardTitle>
        <RadioGroup<CompletionNextStep>
          name="Next step"
          value={nextStep}
          onSelect={setNextStep}
          options={(
            Object.entries(COMPLETION_NEXT_STEP_LABELS) as [CompletionNextStep, string][]
          ).map(([value, label]) => ({ value, label }))}
        />
        {nextStep === 'maintenance' ? (
          <div className="border-t border-line pt-4">
            <RadioGroup<MaintenanceCadence>
              name="Maintenance cadence"
              value={cadence}
              onSelect={setCadence}
              options={(
                Object.entries(MAINTENANCE_CADENCE_LABELS) as [MaintenanceCadence, string][]
              ).map(([value, label]) => ({ value, label }))}
            />
          </div>
        ) : null}
        <Button type="submit" loading={saving} full>
          Save reflection
        </Button>
      </Card>
    </form>
  );
};

export const MaintenanceCheckIn = ({ state }: { state: CompletionState }) => {
  const router = useRouter();
  const enabled = state.maintenance_preference?.enabled ?? false;
  const today = state.today_maintenance_checkin;

  const [value, setValue] = useState<MaintenanceState>(today?.state ?? 'grounded');
  const [note, setNote] = useState(today?.private_note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => PromiseLike<{ error: unknown }>) => {
    setSaving(true);
    setError(null);
    const { error: rpcError } = await action();
    setSaving(false);
    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }
    router.refresh();
  };

  if (!enabled) {
    return (
      <Card>
        <CardTitle>Maintenance mode is off</CardTitle>
        <Helper>
          A low-pressure check-in, weekly or monthly, with no streak attached. You can turn it on
          whenever you want it and off again just as easily.
        </Helper>
        {error ? <Banner variant="danger">{error}</Banner> : null}
        <Button
          type="button"
          loading={saving}
          onClick={() =>
            run(() =>
              createClient().rpc('set_maintenance_enabled', {
                p_enabled: true,
                p_cadence: 'weekly'
              })
            )
          }
        >
          Turn on weekly maintenance
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Maintenance check-in</CardTitle>
        <span className="rounded-md border border-line-strong px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
          {state.maintenance_preference?.cadence ?? 'weekly'}
        </span>
      </div>

      {error ? <Banner variant="danger">{error}</Banner> : null}
      {today ? <Banner variant="success">Today’s maintenance check-in is recorded.</Banner> : null}

      <RadioGroup<MaintenanceState>
        name="How are things"
        value={value}
        onSelect={setValue}
        options={(Object.entries(MAINTENANCE_STATE_LABELS) as [MaintenanceState, string][]).map(
          ([optionValue, label]) => ({ value: optionValue, label })
        )}
      />

      <TextArea
        id="maintenance-note"
        label="Private note (optional)"
        placeholder="Anything worth remembering…"
        maxLength={500}
        rows={4}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        hint={<span className="tnum">{note.length}/500 · 20 characters minimum if you write one</span>}
      />

      <Button
        type="button"
        loading={saving}
        onClick={() =>
          run(() =>
            createClient().rpc('submit_maintenance_checkin', {
              p_state: value,
              p_private_note: note.trim() || null
            })
          )
        }
        full
      >
        {today ? 'Update check-in' : 'Save check-in'}
      </Button>

      {state.recent_maintenance_checkins?.length ? (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <span className="font-mono text-[11px] tracking-[0.08em] text-subtle uppercase">
            Recent
          </span>
          <ul className="flex flex-col gap-2 text-[14px] text-muted">
            {state.recent_maintenance_checkins.slice(0, 5).map((checkIn) => (
              <li key={checkIn.id} className="flex justify-between gap-3">
                <span className="tnum">{checkIn.local_date}</span>
                <span>{MAINTENANCE_STATE_LABELS[checkIn.state]}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() =>
          run(() =>
            createClient().rpc('set_maintenance_enabled', {
              p_enabled: false,
              p_cadence: state.maintenance_preference?.cadence ?? 'weekly'
            })
          )
        }
        className="self-start text-[13px] text-muted underline underline-offset-[3px] hover:text-ink"
      >
        Turn maintenance off
      </button>
    </Card>
  );
};
