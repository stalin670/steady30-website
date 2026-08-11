'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Banner, Button, Card, CardTitle, Helper, TextArea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';
import { createIdempotencyKey } from '@/lib/core/idempotency';
import { validateUGCText } from '@/lib/core/moderation';

export const CommentForm = ({ postId }: { postId: string }) => {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const idempotencyKey = useRef(createIdempotencyKey());

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmed = body.trim();
    if (trimmed.length < 2 || trimmed.length > 600) {
      setError('A reply needs to be between 2 and 600 characters.');
      return;
    }

    const moderation = validateUGCText(trimmed);
    if (!moderation.isValid) {
      setError(moderation.error ?? 'That reply cannot be published.');
      return;
    }

    setSaving(true);

    try {
      const { error: rpcError } = await createClient().rpc('create_comment', {
        p_post_id: postId,
        p_body: trimmed,
        p_idempotency_key: idempotencyKey.current
      });
      if (rpcError) throw rpcError;

      setBody('');
      idempotencyKey.current = createIdempotencyKey();
      setNotice('Reply submitted. If it needs a moderator’s eye it will appear once reviewed.');
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardTitle>Add a reply</CardTitle>
      <Helper>Text only. Encouragement, not advice — nobody here is a clinician.</Helper>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error ? <Banner variant="danger">{error}</Banner> : null}
        {notice ? <Banner variant="success">{notice}</Banner> : null}
        <TextArea
          id="comment-body"
          label="Your reply"
          placeholder="Say something useful and kind…"
          maxLength={600}
          rows={4}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          hint={<span className="tnum">{body.length}/600</span>}
        />
        <Button type="submit" loading={saving} full>
          Post reply
        </Button>
      </form>
    </Card>
  );
};
