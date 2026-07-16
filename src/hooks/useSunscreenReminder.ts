import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { todayISO } from '../utils/schedule';

export interface SunscreenReminder {
  productId: string;
  productName: string;
  firstAppliedAt: number;
  nextDueAt: number | null; // null if all done for today, snoozed, or past cutoff
  isDue: boolean;
  isSnoozed: boolean;
  isFinished: boolean; // all reminders past 6 PM cutoff
  snoozedUntil: number | null;
  applyCount: number;
  scheduledTimes: number[]; // absolute timestamps of all planned reapplications (<= cutoff)
  history: number[]; // actual apply timestamps
  skipped: number[];
  intervalMs: number;
  cutoffMs: number; // 6 PM today as epoch ms
}

// Hard cutoff: no reminders after 6 PM local time.
const CUTOFF_HOUR = 18;

// Returns the 6 PM cutoff timestamp for the given date string.
const cutoffFor = (dateISO: string): number => {
  const d = new Date(dateISO + 'T00:00:00');
  d.setHours(CUTOFF_HOUR, 0, 0, 0);
  return d.getTime();
};

// Returns active sunscreen reminders for today. Re-evaluates every 30s.
export function useSunscreenReminder(): SunscreenReminder[] {
  const products = useStore((s) => s.products);
  const sunscreens = useStore((s) => s.sunscreens);
  const completions = useStore((s) => s.completions);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const today = todayISO();
  const state = sunscreens[today];
  const done = completions[today] ?? [];

  if (!state || !done.includes(state.productId)) return [];

  const product = products.find((p) => p.id === state.productId);
  if (!product) return [];

  const interval = state.reapplyEveryMs;
  const history = state.history;
  const lastApply = history[history.length - 1];
  const cutoffMs = cutoffFor(today);

  // Build scheduled timeline: every interval from first apply, stopping at 6 PM cutoff.
  // No reminder is generated if it would fall after 6 PM.
  const scheduledTimes: number[] = [];
  let cursor = (state.firstAppliedAt ?? lastApply) + interval;
  while (cursor <= cutoffMs) {
    scheduledTimes.push(cursor);
    cursor += interval;
  }

  // Next due = first scheduled time not yet applied/skipped and still <= cutoff.
  const appliedOrSkipped = (t: number) =>
    history.some((h) => Math.abs(h - t) < interval / 2) ||
    state.skipped.some((s) => Math.abs(s - t) < interval / 2);

  const nextDueAt = scheduledTimes.find((t) => !appliedOrSkipped(t)) ?? null;

  const isSnoozed = state.snoozedUntil !== null && now < state.snoozedUntil;
  const isDue = !isSnoozed && nextDueAt !== null && now >= nextDueAt && nextDueAt <= cutoffMs;
  // Finished when there are no more upcoming reminders (all applied/skipped or past cutoff).
  const isFinished = nextDueAt === null && now > cutoffMs;

  return [
    {
      productId: state.productId,
      productName: product.name,
      firstAppliedAt: state.firstAppliedAt ?? lastApply,
      nextDueAt: isSnoozed ? null : nextDueAt,
      isDue,
      isSnoozed,
      isFinished,
      snoozedUntil: state.snoozedUntil,
      applyCount: history.length,
      scheduledTimes,
      history,
      skipped: state.skipped,
      intervalMs: interval,
      cutoffMs,
    },
  ];
}
