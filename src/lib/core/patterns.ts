import { DailyCheckInRow } from './database';

export type PatternCheckIn = Pick<
  DailyCheckInRow,
  'local_date' | 'mood' | 'urge_intensity' | 'trigger_categories' | 'coping_actions'
>;

export type MoodPattern =
  'higher_on_low_mood' | 'lower_on_low_mood' | 'no_clear_pattern' | 'insufficient_data';

export interface WeeklyPatterns {
  daysLogged: number;
  averageMood: number | null;
  averageUrge: number | null;
  highUrgeDays: number;
  topTrigger: string | null;
  topCopingAction: string | null;
  highestUrgeDate: string | null;
  moodPattern: MoodPattern;
}

const mostFrequent = (items: string[]) => {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));
  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || null
  );
};

const roundedAverage = (values: number[]) =>
  values.length
    ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
    : null;

export const analyzeWeeklyPatterns = (checkIns: PatternCheckIn[]): WeeklyPatterns => {
  if (!checkIns.length) {
    return {
      daysLogged: 0,
      averageMood: null,
      averageUrge: null,
      highUrgeDays: 0,
      topTrigger: null,
      topCopingAction: null,
      highestUrgeDate: null,
      moodPattern: 'insufficient_data'
    };
  }

  const strongest = [...checkIns].sort(
    (a, b) => b.urge_intensity - a.urge_intensity || b.local_date.localeCompare(a.local_date)
  )[0];
  const lowMood = checkIns.filter((checkIn) => checkIn.mood <= 2);
  const otherMood = checkIns.filter((checkIn) => checkIn.mood > 2);
  let moodPattern: MoodPattern = 'insufficient_data';

  if (checkIns.length >= 3 && lowMood.length && otherMood.length) {
    const lowMoodUrge = roundedAverage(lowMood.map((checkIn) => checkIn.urge_intensity)) || 0;
    const otherMoodUrge = roundedAverage(otherMood.map((checkIn) => checkIn.urge_intensity)) || 0;
    moodPattern =
      lowMoodUrge >= otherMoodUrge + 1
        ? 'higher_on_low_mood'
        : lowMoodUrge <= otherMoodUrge - 1
          ? 'lower_on_low_mood'
          : 'no_clear_pattern';
  } else if (checkIns.length >= 3) {
    moodPattern = 'no_clear_pattern';
  }

  return {
    daysLogged: checkIns.length,
    averageMood: roundedAverage(checkIns.map((checkIn) => checkIn.mood)),
    averageUrge: roundedAverage(checkIns.map((checkIn) => checkIn.urge_intensity)),
    highUrgeDays: checkIns.filter((checkIn) => checkIn.urge_intensity >= 7).length,
    topTrigger: mostFrequent(
      checkIns
        .flatMap((checkIn) => checkIn.trigger_categories)
        .filter((item) => item !== 'No trigger today')
    ),
    topCopingAction: mostFrequent(
      checkIns
        .flatMap((checkIn) => checkIn.coping_actions)
        .filter((item) => item !== 'No urge today')
    ),
    highestUrgeDate: strongest.local_date,
    moodPattern
  };
};
