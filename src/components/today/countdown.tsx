'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRemainingTime } from '@/lib/core/date';

/**
 * The reflection deadline. `deadlineAt` is computed by the server in
 * `get_today_state` — this only counts down to it. When it passes, the page is
 * refetched rather than guessing at the new state locally.
 */
export const Countdown = ({ deadlineAt }: { deadlineAt: string }) => {
  const router = useRouter();
  const [remaining, setRemaining] = useState(() => getRemainingTime(deadlineAt));

  useEffect(() => {
    setRemaining(getRemainingTime(deadlineAt));

    const timer = setInterval(() => {
      const next = getRemainingTime(deadlineAt);
      setRemaining(next);
      if (next.isOverdue) {
        clearInterval(timer);
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineAt, router]);

  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[13px] text-muted">Today’s reflection closes in</p>
      <p
        role="timer"
        aria-live="off"
        className={`tnum text-[34px] leading-none font-extrabold tracking-[-0.03em] ${
          remaining.isOverdue ? 'text-danger' : ''
        }`}
      >
        {remaining.isOverdue
          ? 'Window closed'
          : `${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(remaining.seconds)}`}
      </p>
    </div>
  );
};
