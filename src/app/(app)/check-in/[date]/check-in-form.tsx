'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  Banner,
  Button,
  Card,
  CardTitle,
  Checkbox,
  ChipGroup,
  TextArea
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type { DailyCheckInRow } from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';
import { createIdempotencyKey } from '@/lib/core/idempotency';
import { validateUGCText } from '@/lib/core/moderation';
import {
  ALLOWED_COPING_ACTIONS,
  ALLOWED_TRIGGER_CATEGORIES,
  DailyCheckInSchema
} from '@/lib/core/validation';

const Rating = ({
  label,
  low,
  high,
  min,
  max,
  value,
  onChange
}: {
  label: string;
  low: string;
  high: string;
  min: number;
  max: number;
  value: number;
  onChange: (next: number) => void;
}) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="mb-2 text-[15px] font-bold">{label}</legend>
    {/* role="radio" is only meaningful inside a radiogroup — without this the
        options are announced as loose buttons. */}
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {Array.from({ length: max - min + 1 }, (_, index) => index + min).map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={`tnum min-w-11 flex-1 rounded-md border py-2 text-[14px] ${
            value === option
              ? 'border-primary bg-primary font-bold text-on-primary'
              : 'border-line bg-card text-muted hover:border-line-strong hover:text-ink'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
    <div className="flex justify-between text-[13px] text-subtle">
      <span>{low}</span>
      <span>{high}</span>
    </div>
  </fieldset>
);

export const CheckInForm = ({
  localDate,
  existing
}: {
  localDate: string;
  existing: DailyCheckInRow | null;
}) => {
  const router = useRouter();
  const [mood, setMood] = useState(existing?.mood ?? 3);
  const [urge, setUrge] = useState(existing?.urge_intensity ?? 2);
  const [triggers, setTriggers] = useState<string[]>(existing?.trigger_categories ?? []);
  const [coping, setCoping] = useState<string[]>(existing?.coping_actions ?? []);
  const [reflection, setReflection] = useState(existing?.private_reflection ?? '');
  const [shareExcerpt, setShareExcerpt] = useState(existing?.is_public_opted_in ?? false);
  const [excerpt, setExcerpt] = useState(existing?.public_excerpt ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef(createIdempotencyKey());

  const toggle = (value: string, selected: string[], update: (next: string[]) => void) =>
    update(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = DailyCheckInSchema.safeParse({
      mood,
      urgeIntensity: urge,
      triggerCategories: triggers,
      copingActions: coping,
      privateReflection: reflection,
      isPublicOptedIn: shareExcerpt,
      publicExcerpt: shareExcerpt ? excerpt : null
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Please check your answers.');
      return;
    }

    // Client-side check first for a fast, kind error; create_post/submit is the
    // real gate on the server.
    if (shareExcerpt && excerpt) {
      const moderation = validateUGCText(excerpt);
      if (!moderation.isValid) {
        setError(moderation.error ?? 'That excerpt cannot be shared publicly.');
        return;
      }
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc('submit_daily_checkin', {
        payload: {
          local_date: localDate,
          mood,
          urge_intensity: urge,
          trigger_categories: triggers,
          coping_actions: coping,
          private_reflection: reflection.trim(),
          public_excerpt: shareExcerpt ? excerpt.trim() : null,
          is_public_opted_in: shareExcerpt
        },
        p_idempotency_key: idempotencyKey.current
      });

      if (rpcError) throw rpcError;
      if (data?.success === false) throw new Error(data.error_code || 'CHECKIN_TOO_LATE');

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
        <Rating
          label="Today’s overall mood"
          min={1}
          max={5}
          value={mood}
          onChange={setMood}
          low="1 · depleted or stressed"
          high="5 · calm or energised"
        />
      </Card>

      <Card>
        <Rating
          label="Highest urge intensity"
          min={0}
          max={10}
          value={urge}
          onChange={setUrge}
          low="0 · no urge"
          high="10 · intense spike"
        />
      </Card>

      <Card>
        <CardTitle>Triggers encountered</CardTitle>
        <ChipGroup
          legend="Select everything that applied today"
          options={ALLOWED_TRIGGER_CATEGORIES}
          selected={triggers}
          onToggle={(value) => toggle(value, triggers, setTriggers)}
        />
      </Card>

      <Card>
        <CardTitle>Coping actions used</CardTitle>
        <ChipGroup
          legend="What helped you navigate urges or protect your habits?"
          options={ALLOWED_COPING_ACTIONS}
          selected={coping}
          onToggle={(value) => toggle(value, coping, setCoping)}
          tone="accent"
        />
      </Card>

      <Card>
        <CardTitle>Private daily reflection</CardTitle>
        <TextArea
          id="reflection"
          label="What happened, what helped, and what will you try tomorrow?"
          placeholder="Write your honest reflection here…"
          minLength={20}
          maxLength={4000}
          rows={7}
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          hint={
            <span className="tnum">
              {reflection.length}/4000 · minimum 20 characters · visible only to your account
            </span>
          }
          required
        />
      </Card>

      <Card>
        <CardTitle>Optional public excerpt</CardTitle>
        <Checkbox
          id="share-excerpt"
          checked={shareExcerpt}
          onToggle={() => setShareExcerpt(!shareExcerpt)}
          label="Share a non-graphic excerpt to the community feed"
          sublabel="Defaults off. Never include explicit descriptions, outside links, or contact information."
        />
        {shareExcerpt ? (
          <TextArea
            id="excerpt"
            label="Public message"
            placeholder="Share an encouraging, non-graphic takeaway…"
            minLength={20}
            maxLength={600}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            hint={<span className="tnum">{excerpt.length}/600 · 20 characters minimum</span>}
          />
        ) : null}
      </Card>

      <Button type="submit" loading={saving} full>
        {existing ? 'Update daily check-in' : 'Submit daily check-in'}
      </Button>
    </form>
  );
};
