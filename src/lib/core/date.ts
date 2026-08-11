/**
 * Subset of ../Steady30/src/lib/date.ts.
 *
 * Only the Intl-based helpers are copied. `computeDeadlineForDate` is deliberately
 * left out: deadlines are authoritative on the server and arrive via
 * `get_today_state`, so recomputing them on the web would be a second source of
 * truth for the one number a streak depends on.
 */

export const getLocalDateString = (date: Date = new Date(), timezone: string = 'UTC'): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    // Fallback if the timezone string is invalid
    return date.toISOString().split('T')[0];
  }
};

export const isValidTimezone = (timezone: string): boolean => {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

export const detectTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export const getRemainingTime = (
  deadlineAt: string | Date | null | undefined,
  now: Date = new Date()
) => {
  if (!deadlineAt) return { hours: 0, minutes: 0, seconds: 0, isOverdue: false, totalSeconds: 0 };

  const diffMs = new Date(deadlineAt).getTime() - now.getTime();
  if (diffMs <= 0) return { hours: 0, minutes: 0, seconds: 0, isOverdue: true, totalSeconds: 0 };

  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOverdue: false,
    totalSeconds
  };
};

export const formatLongDate = (localDate: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(`${localDate}T12:00:00`));
  } catch {
    return localDate;
  }
};

export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Kathmandu',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland'
];
