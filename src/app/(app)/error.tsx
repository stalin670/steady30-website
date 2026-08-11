'use client';

import Link from 'next/link';
import { Button, Card, CardTitle, Helper } from '@/components/ui';

/**
 * The error copy deliberately says what is *not* lost. Someone hitting an error on
 * day 19 needs to know their streak is intact more than they need a stack trace —
 * and the raw error is never shown, because it can carry query details.
 */
const AppError = ({ reset }: { error: Error; reset: () => void }) => (
  <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-16">
    <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Something went wrong</h1>
    <Card>
      <CardTitle>Your record is safe</CardTitle>
      <Helper>
        This page failed to load. Your check-ins, streak, and history live on the server and are
        unaffected — nothing has been lost, and nothing has been recorded as missed.
      </Helper>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/today"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
        >
          Back to Today
        </Link>
      </div>
    </Card>
    <p className="text-[13px] text-subtle">
      If this keeps happening, email support@steady30.online. Please do not include reflections or
      other private details.
    </p>
  </div>
);

export default AppError;
