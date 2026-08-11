'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Banner, Button, Card, CardTitle, Checkbox, TextArea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';
import { createIdempotencyKey } from '@/lib/core/idempotency';

export const RelapseForm = () => {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef(createIdempotencyKey());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!confirmed) {
      setError('Tick the confirmation box to record this reset.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc('record_relapse', {
        occurred_at: new Date().toISOString(),
        categories: [],
        private_note: note.trim() || null,
        p_idempotency_key: idempotencyKey.current
      });
      if (rpcError) throw rpcError;

      router.replace('/attempts');
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
        <CardTitle>Optional private note</CardTitle>
        <TextArea
          id="relapse-note"
          label="What was happening beforehand, and what can you take into the next attempt?"
          placeholder="Private note, for your eyes only…"
          maxLength={2000}
          rows={6}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint={<span className="tnum">{note.length}/2000 · never shared, never public</span>}
        />
      </Card>

      <Card tone="danger">
        <Checkbox
          id="confirm-reset"
          checked={confirmed}
          onToggle={() => setConfirmed(!confirmed)}
          label="I confirm recording an honest relapse for this attempt"
          sublabel="This closes your active attempt and resets the active counters."
        />
        <Button type="submit" variant="danger" loading={saving} disabled={!confirmed} full>
          Confirm honest reset
        </Button>
      </Card>
    </form>
  );
};
