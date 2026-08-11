import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardTitle, Helper } from '@/components/ui';
import { COMMUNITY_STAGE_LABELS, type CommunityStage } from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { CommentForm } from './comment-form';

export const metadata: Metadata = {
  title: 'Discussion',
  robots: { index: false, follow: false }
};

type ThreadPost = {
  id: string;
  author_handle: string;
  body: string;
  moderation_status: string;
  reaction_count: number;
  community_stage: CommunityStage | null;
};

type ThreadComment = {
  id: string;
  author_handle: string;
  body: string;
  moderation_status: string;
};

const Avatar = ({ handle }: { handle: string }) => (
  <span
    aria-hidden="true"
    className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-primary-muted text-[12px] font-bold text-muted"
  >
    {handle.slice(0, 2).toUpperCase()}
  </span>
);

const PostDetail = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { supabase } = await requireMember();

  const { data } = await supabase.rpc('post_thread', { p_post_id: id });

  // post_thread returns NULL when the post is hidden, removed, or the author is
  // blocked in either direction. A 404 is the honest answer to all three.
  if (!data) notFound();

  const thread = data as { post: ThreadPost; comments: ThreadComment[] };
  const { post, comments } = thread;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/community"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Community
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Discussion</h1>
        <p className="text-[17px] text-muted">Thread with @{post.author_handle}</p>
      </header>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Avatar handle={post.author_handle} />
          <Link
            href={`/u/${post.author_handle}`}
            className="font-semibold hover:underline hover:underline-offset-[3px]"
          >
            @{post.author_handle}
          </Link>
          {post.community_stage ? (
            <span className="rounded-md border border-line-strong px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
              {COMMUNITY_STAGE_LABELS[post.community_stage]}
            </span>
          ) : null}
        </div>
        <p className="whitespace-pre-wrap">{post.body}</p>
        <span className="tnum text-[13px] text-muted">Support {post.reaction_count}</span>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
          {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
        </h2>

        {comments.length === 0 ? (
          <Card>
            <Helper>No replies yet. A short, specific encouragement goes a long way.</Helper>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li key={comment.id}>
                <Card>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar handle={comment.author_handle} />
                    <Link
                      href={`/u/${comment.author_handle}`}
                      className="font-semibold hover:underline hover:underline-offset-[3px]"
                    >
                      @{comment.author_handle}
                    </Link>
                    {comment.moderation_status !== 'published' ? (
                      <span className="rounded-md border border-warning bg-warning-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-warning uppercase">
                        In review
                      </span>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap">{comment.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CommentForm postId={post.id} />

      <Card tone="tint">
        <CardTitle>This is peer support, not treatment</CardTitle>
        <Helper>
          Nobody here is a clinician. If distress is severe or persistent, the{' '}
          <Link href="/safety" className="underline underline-offset-[3px]">
            safety resources
          </Link>{' '}
          list real help.
        </Helper>
      </Card>
    </div>
  );
};

export default PostDetail;
