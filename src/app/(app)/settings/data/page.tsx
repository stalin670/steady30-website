import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import { requireMember } from '@/lib/session';
import { DeleteAccountCard, ExportCard } from './data-controls';

export const metadata: Metadata = {
  title: 'Your data and account',
  robots: { index: false, follow: false }
};

const DataSettings = async () => {
  await requireMember();

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/me"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← My account
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Your data and account</h1>
        <p className="text-[17px] text-muted">Take it with you, or erase it entirely.</p>
      </header>

      <ExportCard />
      <DeleteAccountCard />

      <Card tone="tint">
        <CardTitle>What we keep, and why</CardTitle>
        <Helper>
          After deletion we may retain limited records only where the law requires it, or where they
          are needed to resolve a security, fraud, or legal issue. Nothing retained includes your
          reflections.
        </Helper>
        <Helper>
          Full detail is in the{' '}
          <Link href="/privacy" className="underline underline-offset-[3px]">
            privacy policy
          </Link>
          .
        </Helper>
      </Card>
    </div>
  );
};

export default DataSettings;
