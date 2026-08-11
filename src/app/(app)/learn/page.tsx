import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import type { ContentItemRow } from '@/lib/core/database';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Learn and practice',
  robots: { index: false, follow: false }
};

const TOOLS = [
  {
    slug: 'urge-surfing',
    name: 'Urge surfing',
    blurb: 'A three-minute guided pause that rides the craving out instead of fighting it.'
  },
  {
    slug: 'paced-breathing',
    name: 'Box breathing',
    blurb: 'A slow 4-4-4-4 rhythm you can follow with your eyes closed.'
  },
  {
    slug: 'if-then-plan',
    name: 'If-then plans',
    blurb: 'Pre-committed responses, written calm and waiting for you when you are not.'
  }
];

const Learn = async () => {
  const { supabase, user } = await requireMember();

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase
      .from('content_items')
      .select('*')
      .eq('kind', 'lesson')
      .order('day_number', { ascending: true }),
    supabase.from('content_progress').select('content_id').eq('user_id', user.id)
  ]);

  const completed = new Set((progress ?? []).map((row) => row.content_id));
  const items = (lessons ?? []) as ContentItemRow[];

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Learn and practice</h1>
        <p className="text-[17px] text-muted">Reviewed lessons and practical coping tools.</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
          Interactive coping tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5 hover:bg-card-hover"
            >
              <span className="font-bold">{tool.name}</span>
              <span className="text-[13px] text-muted">{tool.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
          30-day lesson track
        </h2>

        {items.length === 0 ? (
          <Card>
            <CardTitle>No lessons published yet</CardTitle>
            <Helper>
              Lessons appear here once an independent reviewer has checked their sources, intended
              outcome, limitations, and safety language.
            </Helper>
          </Card>
        ) : (
          <ol className="flex flex-col rounded-2xl border border-line bg-card">
            {items.map((lesson) => (
              <li key={lesson.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-card-hover"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-mono text-[11px] tracking-[0.08em] text-subtle uppercase">
                      Day {lesson.day_number ?? '—'}
                    </span>
                    <span className="font-semibold">{lesson.title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-[12px] text-muted">
                    {completed.has(lesson.id) ? (
                      <span className="rounded-md border border-accent bg-accent-muted px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-accent uppercase">
                        Done
                      </span>
                    ) : null}
                    <span className="tnum">{lesson.estimated_minutes} min</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
};

export default Learn;
