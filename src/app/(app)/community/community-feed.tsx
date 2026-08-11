'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { Banner, Button, Card, CardTitle, Helper, RadioGroup, TextArea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  COMMUNITY_STAGES,
  COMMUNITY_STAGE_LABELS,
  type CommunityFeedPost,
  type CommunityStage,
  type ReportReason
} from '@/lib/core/database';
import { formatErrorMessage } from '@/lib/core/errors';
import { createIdempotencyKey } from '@/lib/core/idempotency';
import { validateUGCText } from '@/lib/core/moderation';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'explicit_sexual_content', label: 'Explicit sexual content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate', label: 'Hate' },
  { value: 'self_harm', label: 'Self-harm' },
  { value: 'spam', label: 'Spam' },
  { value: 'contact_solicitation', label: 'Contact solicitation' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Something else' }
];

const Avatar = ({ handle }: { handle: string }) => (
  <span
    aria-hidden="true"
    className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-primary-muted text-[12px] font-bold text-muted"
  >
    {handle.slice(0, 2).toUpperCase()}
  </span>
);

const StageChip = ({ stage }: { stage: CommunityStage }) => (
  <span className="rounded-md border border-line-strong px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
    {COMMUNITY_STAGE_LABELS[stage]}
  </span>
);

export const CommunityFeed = ({
  initialPosts,
  stage
}: {
  initialPosts: CommunityFeedPost[];
  stage: CommunityStage | 'all';
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState(initialPosts);
  const [composerOpen, setComposerOpen] = useState(false);
  const [body, setBody] = useState('');
  const [postStage, setPostStage] = useState<CommunityStage | ''>('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reporting, setReporting] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>('explicit_sexual_content');
  const idempotencyKey = useRef(createIdempotencyKey());

  const setStage = (next: CommunityStage | 'all') => {
    startTransition(() => {
      router.push(next === 'all' ? '/community' : `/community?stage=${next}`);
    });
  };

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmed = body.trim();
    if (trimmed.length < 20 || trimmed.length > 600) {
      setError('A post needs to be between 20 and 600 characters.');
      return;
    }

    // Fast local feedback; create_post is the real gate.
    const moderation = validateUGCText(trimmed);
    if (!moderation.isValid) {
      setError(moderation.error ?? 'That post cannot be published.');
      return;
    }

    setPosting(true);

    try {
      const { error: rpcError } = await createClient().rpc('create_post', {
        p_body: trimmed,
        p_idempotency_key: idempotencyKey.current,
        p_community_stage: postStage || null
      });
      if (rpcError) throw rpcError;

      setBody('');
      setComposerOpen(false);
      idempotencyKey.current = createIdempotencyKey();
      // Posts may land as `pending` under moderation — say so rather than
      // implying it is live.
      setNotice(
        'Post submitted. If it needs a moderator’s eye it will appear once reviewed.'
      );
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  const react = async (postId: string, hasReacted: boolean) => {
    // Optimistic, reverted by a refetch if the server disagrees.
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              user_has_reacted: !hasReacted,
              reaction_count: post.reaction_count + (hasReacted ? -1 : 1)
            }
          : post
      )
    );

    const { error: rpcError } = await createClient().rpc('toggle_reaction', {
      p_target_type: 'post',
      p_target_id: postId,
      p_kind: 'support'
    });

    if (rpcError) router.refresh();
  };

  const submitReport = async () => {
    if (!reporting) return;

    const { error: rpcError } = await createClient().rpc('report_target', {
      p_target_type: 'post',
      p_target_id: reporting,
      p_reason: reportReason
    });

    setReporting(null);
    setNotice(
      rpcError
        ? formatErrorMessage(rpcError)
        : 'Report submitted. A human moderator reviews every report.'
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Community support</h1>
          <p className="text-[17px] text-muted">
            Encouraging reflections and consistency milestones.
          </p>
        </div>
        <Button type="button" onClick={() => setComposerOpen(!composerOpen)}>
          {composerOpen ? 'Close' : 'New post'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 text-[14px]">
        <Link href="/leaderboard" className="underline underline-offset-[3px] hover:text-ink">
          Leaderboard
        </Link>
        <Link href="/guides" className="underline underline-offset-[3px] hover:text-ink">
          Peer guides
        </Link>
        <Link href="/cohort" className="underline underline-offset-[3px] hover:text-ink">
          My cohort
        </Link>
      </div>

      {notice ? <Banner variant="success">{notice}</Banner> : null}

      {composerOpen ? (
        <Card>
          <CardTitle>Share with the community</CardTitle>
          <Helper>
            Text only. No links, contact details, or explicit description — those are removed and
            can cost you access.
          </Helper>
          <form onSubmit={publish} className="flex flex-col gap-4">
            {error ? <Banner variant="danger">{error}</Banner> : null}
            <TextArea
              id="post-body"
              label="Your post"
              placeholder="Share an encouraging, non-graphic takeaway…"
              maxLength={600}
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              hint={<span className="tnum">{body.length}/600 · 20 characters minimum</span>}
            />
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold">Tag your stage (optional)</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPostStage('')}
                  aria-pressed={postStage === ''}
                  className={`rounded-full border px-4 py-2 text-[14px] ${
                    postStage === ''
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-line bg-card hover:border-line-strong'
                  }`}
                >
                  Untagged
                </button>
                {COMMUNITY_STAGES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPostStage(option)}
                    aria-pressed={postStage === option}
                    className={`rounded-full border px-4 py-2 text-[14px] ${
                      postStage === option
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-line bg-card hover:border-line-strong'
                    }`}
                  >
                    {COMMUNITY_STAGE_LABELS[option]}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" loading={posting} full>
              Publish post
            </Button>
          </form>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by stage">
        {(['all', ...COMMUNITY_STAGES] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={stage === option}
            onClick={() => setStage(option)}
            className={`rounded-full border px-4 py-2 text-[14px] ${
              stage === option
                ? 'border-primary bg-primary text-on-primary'
                : 'border-line bg-card hover:border-line-strong'
            }`}
          >
            {option === 'all' ? 'All' : COMMUNITY_STAGE_LABELS[option]}
          </button>
        ))}
      </div>

      {isPending ? <Helper>Loading…</Helper> : null}

      {posts.length === 0 ? (
        <Card>
          <CardTitle>Nothing here yet</CardTitle>
          <Helper>
            {stage === 'all'
              ? 'Be the first to share something. Keep it text-only and non-graphic.'
              : `No posts tagged ${COMMUNITY_STAGE_LABELS[stage]} yet.`}
          </Helper>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar handle={post.author_handle} />
                  <Link
                    href={`/u/${post.author_handle}`}
                    className="font-semibold hover:underline hover:underline-offset-[3px]"
                  >
                    @{post.author_handle}
                  </Link>
                  {post.community_stage ? <StageChip stage={post.community_stage} /> : null}
                  {post.moderation_status !== 'published' ? (
                    <span className="rounded-md border border-warning bg-warning-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-warning uppercase">
                      In review
                    </span>
                  ) : null}
                </div>

                <p className="whitespace-pre-wrap">{post.body}</p>

                <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted">
                  <button
                    type="button"
                    onClick={() => react(post.id, post.user_has_reacted)}
                    aria-pressed={post.user_has_reacted}
                    className={`tnum rounded-full border px-3 py-1 ${
                      post.user_has_reacted
                        ? 'border-accent bg-accent-muted text-accent'
                        : 'border-line hover:border-line-strong'
                    }`}
                  >
                    Support {post.reaction_count}
                  </button>
                  <Link
                    href={`/community/${post.id}`}
                    className="tnum underline underline-offset-[3px] hover:text-ink"
                  >
                    {post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setReporting(post.id)}
                    className="ml-auto underline underline-offset-[3px] hover:text-ink"
                  >
                    Report
                  </button>
                </div>

                {reporting === post.id ? (
                  <div className="flex flex-col gap-4 border-t border-line pt-4">
                    <CardTitle>Report this post</CardTitle>
                    <RadioGroup<ReportReason>
                      name="Report reason"
                      value={reportReason}
                      onSelect={setReportReason}
                      options={REPORT_REASONS}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" onClick={submitReport}>
                        Submit report
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setReporting(null)}>
                        Cancel
                      </Button>
                    </div>
                    <Helper>
                      Reporting is not an emergency service. If someone may be in immediate danger,
                      use the{' '}
                      <Link href="/safety" className="underline underline-offset-[3px]">
                        safety resources
                      </Link>
                      .
                    </Helper>
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
