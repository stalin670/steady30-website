'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, TextArea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  PEER_GUIDE_REVIEW_REASON_LABELS,
  type MyPeerGuideStatusResponse
} from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';
import { validateUGCText } from '@/lib/core/moderation';

export const PeerGuideForm = ({ status }: { status: MyPeerGuideStatusResponse }) => {
  const router = useRouter();
  const [statement, setStatement] = useState(
    status.guide?.public_statement ?? status.application?.statement ?? ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isActiveGuide = status.guide?.active ?? false;
  const application = status.application;

  const run = async (
    action: () => PromiseLike<{ error: unknown }>,
    successMessage: string
  ) => {
    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await action();
    setSaving(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    setNotice(successMessage);
    router.refresh();
  };

  const submitStatement = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = statement.trim();
    const max = isActiveGuide ? 160 : 500;

    if (trimmed.length < 20 || trimmed.length > max) {
      setError(`Your statement needs to be between 20 and ${max} characters.`);
      return;
    }

    const moderation = validateUGCText(trimmed);
    if (!moderation.isValid) {
      setError(moderation.error ?? 'That statement cannot be published.');
      return;
    }

    const supabase = createClient();

    if (isActiveGuide) {
      void run(
        () => supabase.rpc('update_peer_guide_statement', { p_public_statement: trimmed }),
        'Your public statement is updated.'
      );
      return;
    }

    void run(
      () => supabase.rpc('apply_peer_guide', { p_statement: trimmed }),
      'Application submitted. A moderator reviews every application.'
    );
  };

  if (!status.is_eligible && !application && !status.guide) {
    return (
      <Card>
        <CardTitle>Peer guiding opens after a completed challenge</CardTitle>
        <Helper>
          Guides are alumni. Finish a 30-day challenge and this becomes available — there is nothing
          to do until then.
        </Helper>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {notice ? <Banner variant="success">{notice}</Banner> : null}

      {application && application.status === 'pending' ? (
        <Card tone="tint">
          <CardTitle>Your application is with a moderator</CardTitle>
          <Helper>
            Nothing is published while it is pending. You can withdraw it at any time.
          </Helper>
          <Button
            type="button"
            variant="outline"
            loading={saving}
            onClick={() =>
              run(
                () => createClient().rpc('withdraw_peer_guide_application'),
                'Application withdrawn.'
              )
            }
          >
            Withdraw application
          </Button>
        </Card>
      ) : null}

      {application?.review_reason && application.status !== 'approved' ? (
        <Card>
          <CardTitle>Review note</CardTitle>
          <Helper>{PEER_GUIDE_REVIEW_REASON_LABELS[application.review_reason]}</Helper>
        </Card>
      ) : null}

      <Card>
        <CardTitle>{isActiveGuide ? 'Your public statement' : 'Apply to be a peer guide'}</CardTitle>
        <Helper>
          {isActiveGuide
            ? 'Shown on your profile and in the guides directory. Keep it short and welcoming.'
            : 'Tell a moderator why you want to encourage people who are where you were. This text is not published until you are approved.'}
        </Helper>
        <form onSubmit={submitStatement} className="flex flex-col gap-4">
          <TextArea
            id="statement"
            label={isActiveGuide ? 'Public statement' : 'Application statement'}
            placeholder="What you would want to hear on day three…"
            maxLength={isActiveGuide ? 160 : 500}
            rows={5}
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            hint={
              <span className="tnum">
                {statement.length}/{isActiveGuide ? 160 : 500} · 20 characters minimum
              </span>
            }
          />
          <Button type="submit" loading={saving} full>
            {isActiveGuide ? 'Save public statement' : 'Submit application'}
          </Button>
        </form>
      </Card>

      {isActiveGuide ? (
        <Card tone="danger">
          <CardTitle>Step down</CardTitle>
          <Helper>
            You can resign at any time. Your posts stay; the guide badge and directory listing go.
          </Helper>
          <Button
            type="button"
            variant="danger"
            loading={saving}
            onClick={() =>
              run(
                () => createClient().rpc('withdraw_peer_guide_application'),
                'You are no longer listed as a peer guide.'
              )
            }
          >
            Resign as peer guide
          </Button>
        </Card>
      ) : null}
    </div>
  );
};
