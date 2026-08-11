'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';

export const MarkComplete = ({
  contentId,
  completed
}: {
  contentId: string;
  completed: boolean;
}) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (completed) {
    return (
      <Banner variant="success">You have marked this lesson as read.</Banner>
    );
  }

  const markRead = async () => {
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please sign in to save your progress.');
      setSaving(false);
      return;
    }

    const { error: upsertError } = await supabase.from('content_progress').upsert({
      user_id: user.id,
      content_id: contentId,
      completed_at: new Date().toISOString()
    });

    if (upsertError) {
      setError(formatErrorMessage(upsertError));
      setSaving(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      <Button type="button" onClick={markRead} loading={saving} full>
        Mark lesson as read
      </Button>
    </div>
  );
};
