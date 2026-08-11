import type { Metadata } from 'next';
import Link from 'next/link';
import { Banner, Card, CardTitle } from '@/components/ui';
import { requireMember } from '@/lib/session';
import { RelapseForm } from './relapse-form';

export const metadata: Metadata = {
  title: 'Record an honest reset',
  robots: { index: false, follow: false }
};

const Relapse = async () => {
  await requireMember();

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/today"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Back to Today
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Record an honest reset</h1>
        <p className="text-[17px] text-muted">Self-compassion and preserved history.</p>
      </header>

      <Banner variant="info">
        A lapse is a single event, not an identity. Recording it honestly closes this attempt and
        lets you restart fresh tomorrow.
      </Banner>

      <Card>
        <CardTitle>What happens when you reset</CardTitle>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[14px] text-muted">
          <li>Your current attempt is recorded with its completed days intact.</li>
          <li>Prior milestones are never erased from your history.</li>
          <li>You can start a new 30-day challenge beginning at midnight.</li>
        </ul>
      </Card>

      <RelapseForm />
    </div>
  );
};

export default Relapse;
