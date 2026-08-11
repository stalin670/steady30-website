'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';
import { downloadExportJson, fetchUserDataForExport } from '@/lib/export';

const CONFIRM_PHRASE = 'DELETE';

export const ExportCard = () => {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const exportData = async () => {
    setWorking(true);
    setError(null);
    setDone(false);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('AUTH_REQUIRED');

      const data = await fetchUserDataForExport(supabase, user.id);
      downloadExportJson(data);
      setDone(true);
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  return (
    <Card>
      <CardTitle>Export your data</CardTitle>
      <Helper>
        A complete, machine-readable JSON copy of your records: profile, attempts, daily
        reflections, relapse notes, coping plans, community posts and comments, trusted
        connections, and completion history.
      </Helper>
      <Helper>
        The file is built in your browser and saved straight to this device. It is not uploaded
        anywhere, and no copy is kept.
      </Helper>

      {error ? <Banner variant="danger">{error}</Banner> : null}
      {done ? <Banner variant="success">Your export has been downloaded.</Banner> : null}

      <Button type="button" variant="outline" loading={working} onClick={exportData}>
        Download data export
      </Button>
    </Card>
  );
};

export const DeleteAccountCard = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = phrase.trim().toUpperCase() === CONFIRM_PHRASE;

  const deleteAccount = async () => {
    if (!canDelete) return;

    setWorking(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('AUTH_REQUIRED');

      const { error: rpcError } = await supabase.rpc('execute_account_deletion', {
        p_user_id: user.id
      });
      if (rpcError) throw rpcError;

      await supabase.auth.signOut();
      router.replace('/');
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
      setWorking(false);
    }
  };

  return (
    <Card tone="danger">
      <CardTitle>Delete your account</CardTitle>
      <Helper>
        This permanently erases your profile, every attempt, every daily reflection, your relapse
        notes, coping plans, community posts and comments, and your trusted connections. It is
        immediate and cannot be undone.
      </Helper>
      <Helper>
        If you want a copy of any of it, download the export above first — afterwards there is
        nothing left to export.
      </Helper>

      {error ? <Banner variant="danger">{error}</Banner> : null}

      {!open ? (
        <Button type="button" variant="danger" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      ) : (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          {/* Type-to-confirm rather than a checkbox. A tick is one stray tap away
              from erasing months of someone's work with no undo. */}
          <Input
            id="confirm-delete"
            label={`Type ${CONFIRM_PHRASE} to confirm`}
            placeholder={CONFIRM_PHRASE}
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="danger"
              loading={working}
              disabled={!canDelete}
              onClick={deleteAccount}
            >
              Permanently delete account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setPhrase('');
                setError(null);
              }}
            >
              Keep my account
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
