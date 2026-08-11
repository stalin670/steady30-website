'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type {
  TrustedConnectionRow,
  TrustedSupportRequestRow
} from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';

export const TrustedContactsView = ({
  connections,
  incomingRequests,
  myUserId
}: {
  connections: TrustedConnectionRow[];
  incomingRequests: TrustedSupportRequestRow[];
  myUserId: string;
}) => {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (action: () => PromiseLike<{ error: unknown }>, success: string) => {
    setSaving(true);
    setError(null);
    setNotice(null);

    const { error: rpcError } = await action();
    setSaving(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return false;
    }

    setNotice(success);
    router.refresh();
    return true;
  };

  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = handle.trim().toLowerCase();

    if (!normalized) {
      setError('Enter the handle of the person you want to invite.');
      return;
    }

    const ok = await run(
      () => createClient().rpc('invite_trusted_contact', { p_handle: normalized }),
      'Invitation sent. It appears in Steady30 when they next open it.'
    );

    // Keep what they typed when the handle was wrong — that is exactly when they
    // need to correct it, not retype it.
    if (ok) setHandle('');
  };

  const pendingForMe = connections.filter(
    (connection) => connection.status === 'pending' && connection.recipient_id === myUserId
  );
  const pendingFromMe = connections.filter(
    (connection) => connection.status === 'pending' && connection.requester_id === myUserId
  );
  const accepted = connections.filter((connection) => connection.status === 'accepted');

  const otherHandle = (connection: TrustedConnectionRow) =>
    connection.requester_id === myUserId ? connection.recipient_handle : connection.requester_handle;

  return (
    <div className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {notice ? <Banner variant="success">{notice}</Banner> : null}

      <Card tone="tint">
        <CardTitle>What a trusted contact can see</CardTitle>
        <Helper>
          Only an explicit support request you choose to send. Never your private reflections,
          triggers, urge ratings, missed check-ins, relapse records, or browsing activity.
        </Helper>
        <Helper>
          In-app only. No email, SMS, or push notification is sent on your behalf.
        </Helper>
      </Card>

      {incomingRequests.length > 0 ? (
        <Card tone="danger">
          <CardTitle>Someone asked for support</CardTitle>
          {incomingRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 first-of-type:border-t-0 first-of-type:pt-0"
            >
              <span>
                <strong>@{request.sender_handle}</strong> needs support
              </span>
              <Button
                type="button"
                loading={saving}
                onClick={() =>
                  run(
                    () =>
                      createClient().rpc('acknowledge_trusted_support_request', {
                        p_request_id: request.id
                      }),
                    'Acknowledged. They can see that you saw it.'
                  )
                }
              >
                Acknowledge
              </Button>
            </div>
          ))}
        </Card>
      ) : null}

      <Card>
        <CardTitle>Invite by handle</CardTitle>
        <Helper>
          You need their Steady30 handle. There is no directory search — that is deliberate.
        </Helper>
        <form onSubmit={invite} className="flex flex-col gap-4">
          <Input
            id="contact-handle"
            label="Member handle"
            placeholder="challenger_alex"
            value={handle}
            onChange={(event) =>
              setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
            }
            autoCapitalize="none"
            autoCorrect="off"
          />
          <Button type="submit" loading={saving} full>
            Send invitation
          </Button>
        </form>
      </Card>

      {pendingForMe.length > 0 ? (
        <Card>
          <CardTitle>Invitations for you</CardTitle>
          {pendingForMe.map((connection) => (
            <div
              key={connection.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 first-of-type:border-t-0 first-of-type:pt-0"
            >
              <span>@{connection.requester_handle}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  loading={saving}
                  onClick={() =>
                    run(
                      () =>
                        createClient().rpc('respond_to_trusted_contact', {
                          p_connection_id: connection.id,
                          p_action: 'accept'
                        }),
                      'Accepted.'
                    )
                  }
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  loading={saving}
                  onClick={() =>
                    run(
                      () =>
                        createClient().rpc('respond_to_trusted_contact', {
                          p_connection_id: connection.id,
                          p_action: 'decline'
                        }),
                      'Declined.'
                    )
                  }
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </Card>
      ) : null}

      <Card>
        <CardTitle>Your trusted contacts</CardTitle>
        {accepted.length === 0 && pendingFromMe.length === 0 ? (
          <Helper>
            No contacts yet. One person who knows what you are doing is worth more than a feed.
          </Helper>
        ) : null}

        {accepted.map((connection) => (
          <div
            key={connection.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 first-of-type:border-t-0 first-of-type:pt-0"
          >
            <span className="font-semibold">@{otherHandle(connection)}</span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                loading={saving}
                onClick={() =>
                  run(
                    () =>
                      createClient().rpc('send_trusted_support_request', {
                        p_connection_id: connection.id
                      }),
                    'Support request sent. They will see it in Steady30.'
                  )
                }
              >
                Ask for support
              </Button>
              <Button
                type="button"
                variant="outline"
                loading={saving}
                onClick={() =>
                  run(
                    () =>
                      createClient().rpc('revoke_trusted_contact', {
                        p_connection_id: connection.id
                      }),
                    'Connection revoked.'
                  )
                }
              >
                Revoke
              </Button>
            </div>
          </div>
        ))}

        {pendingFromMe.map((connection) => (
          <div
            key={connection.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"
          >
            <span className="text-muted">@{connection.recipient_handle}</span>
            <span className="rounded-md border border-line-strong px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
              Invited
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
};
