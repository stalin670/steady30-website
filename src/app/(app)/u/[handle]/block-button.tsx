'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Helper } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';

export const BlockButton = ({ targetId, handle }: { targetId: string; handle: string }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const block = async () => {
    setSaving(true);
    setError(null);

    const { error: rpcError } = await createClient().rpc('block_user', { p_target_id: targetId });
    setSaving(false);

    if (rpcError) {
      setError(formatErrorMessage(rpcError));
      return;
    }

    // Blocking hides content both ways, so this profile stops resolving.
    router.replace('/community');
    router.refresh();
  };

  if (!confirming) {
    return (
      <div className="flex flex-col gap-3">
        {error ? <Banner variant="danger">{error}</Banner> : null}
        <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
          Block @{handle}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      <Helper>
        Blocking hides their posts and comments from you, and yours from them, everywhere in the
        community.
      </Helper>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="danger" loading={saving} onClick={block}>
          Block @{handle}
        </Button>
        <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
