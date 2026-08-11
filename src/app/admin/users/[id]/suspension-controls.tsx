'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, TextArea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';

export const SuspensionControls = ({
  userId,
  handle,
  isSuspended
}: {
  userId: string;
  handle: string;
  isSuspended: boolean;
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const act = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    const { error: rpcError } = isSuspended
      ? await supabase.rpc('unsuspend_user', {
          p_user_id: userId,
          p_reason: note.trim() || 'Reinstated from the web console'
        })
      : await supabase.rpc('suspend_user', {
          p_user_id: userId,
          p_reason: 'manual_moderation_suspension',
          p_internal_note: note.trim() || 'Suspended from the web console'
        });

    setBusy(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setOpen(false);
    setNote('');
    setNotice(isSuspended ? `@${handle} reinstated.` : `@${handle} suspended.`);
    router.refresh();
  };

  return (
    <Card tone={isSuspended ? 'card' : 'danger'}>
      <CardTitle>{isSuspended ? 'Reinstate this member' : 'Suspend this member'}</CardTitle>
      <Helper>
        {isSuspended
          ? 'Restores their access to community features. Their content stays as it is.'
          : 'Suspending blocks community participation and hides their authored content. Their private practice — check-ins, streak, reflections — is untouched.'}
      </Helper>

      {error ? <Banner variant="danger">{error}</Banner> : null}
      {notice ? <Banner variant="success">{notice}</Banner> : null}

      {open ? (
        <div className="flex flex-col gap-4">
          <TextArea
            id="suspension-note"
            label="Internal note"
            placeholder="What led to this decision…"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            hint="Recorded in moderation_actions. Never shown to the member."
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={isSuspended ? 'primary' : 'danger'}
              loading={busy}
              onClick={act}
            >
              {isSuspended ? `Reinstate @${handle}` : `Suspend @${handle}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant={isSuspended ? 'outline' : 'danger'}
          onClick={() => setOpen(true)}
        >
          {isSuspended ? 'Reinstate member' : 'Suspend member'}
        </Button>
      )}
    </Card>
  );
};
