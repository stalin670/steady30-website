import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Banner, Card, CardTitle, Helper } from '@/components/ui';
import type { ContentItemRow } from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { MarkComplete } from './mark-complete';

export const metadata: Metadata = {
  title: 'Lesson',
  robots: { index: false, follow: false }
};

const EVIDENCE_LABELS: Record<string, string> = {
  not_assessed: 'Not assessed',
  limited: 'Limited',
  emerging: 'Emerging',
  supported: 'Supported',
  consensus: 'Consensus'
};

/**
 * Very small markdown rendering: paragraphs, headings and list items only.
 * Deliberately not a markdown library and deliberately not `dangerouslySetInnerHTML`
 * — lesson bodies are trusted content today, but rendering them as HTML would make
 * a future content-authoring bug into stored XSS.
 */
const LessonBody = ({ markdown }: { markdown: string }) => {
  const blocks = markdown.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className="flex flex-col gap-5 text-[17px] leading-[1.65]">
      {blocks.map((block, index) => {
        const trimmed = block.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-[19px] font-bold">
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="mt-2 text-[23px] font-bold">
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (/^[-*] /m.test(trimmed)) {
          return (
            <ul key={index} className="flex list-disc flex-col gap-2 pl-5 text-muted">
              {trimmed
                .split('\n')
                .filter((line) => /^[-*] /.test(line.trim()))
                .map((line, lineIndex) => (
                  <li key={lineIndex}>{line.trim().slice(2)}</li>
                ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-muted">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

const Lesson = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const { supabase, user } = await requireMember();

  const { data } = await supabase.from('content_items').select('*').eq('slug', slug).maybeSingle();
  const lesson = data as ContentItemRow | null;
  if (!lesson) notFound();

  const { data: progress } = await supabase
    .from('content_progress')
    .select('content_id')
    .eq('user_id', user.id)
    .eq('content_id', lesson.id)
    .maybeSingle();

  return (
    <article className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-3">
        <Link
          href="/learn"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← All lessons
        </Link>
        <p className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
          Day {lesson.day_number ?? '—'} · {lesson.estimated_minutes} min read
        </p>
        <h1 className="text-[clamp(30px,5vw,42px)] font-extrabold">{lesson.title}</h1>
        <p className="text-[18px] text-muted">{lesson.summary}</p>
      </header>

      {lesson.review_status !== 'reviewed' ? (
        <Banner variant="warning">
          This lesson has not completed independent review yet. Treat it as a draft.
        </Banner>
      ) : null}

      {/* Not decoration — content_items carries every one of these columns, and the
          app's content standards depend on them being shown. */}
      <Card tone="tint">
        <CardTitle>Evidence and review</CardTitle>
        <dl className="flex flex-col gap-3 text-[14px]">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-muted">Evidence level</dt>
            <dd className="font-semibold">
              {EVIDENCE_LABELS[lesson.evidence_level] ?? lesson.evidence_level}
            </dd>
          </div>
          {lesson.reviewer_name ? (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-muted">Reviewed by</dt>
              <dd className="font-semibold">
                {lesson.reviewer_name}
                {lesson.reviewer_credentials ? `, ${lesson.reviewer_credentials}` : ''}
              </dd>
            </div>
          ) : null}
          {lesson.intended_outcome ? (
            <div className="flex flex-col gap-1">
              <dt className="text-muted">Intended outcome</dt>
              <dd>{lesson.intended_outcome}</dd>
            </div>
          ) : null}
          {lesson.limitations ? (
            <div className="flex flex-col gap-1">
              <dt className="text-muted">Limitations</dt>
              <dd>{lesson.limitations}</dd>
            </div>
          ) : null}
        </dl>
        <Helper>A citation is not presented as proof of a claim by itself.</Helper>
      </Card>

      <LessonBody markdown={lesson.body_markdown} />

      {lesson.source_urls?.length ? (
        <section className="flex flex-col gap-2 border-t border-line pt-6">
          <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
            Sources
          </h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-[14px] text-muted">
            {lesson.source_urls.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  rel="noopener noreferrer nofollow"
                  className="break-all underline underline-offset-[3px]"
                >
                  {url}
                </a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <MarkComplete contentId={lesson.id} completed={Boolean(progress)} />
    </article>
  );
};

export default Lesson;
