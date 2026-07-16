import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Check, SkipForward, Clock, Droplets, BellRing, ShieldCheck } from 'lucide-react';
import { useSunscreenReminder } from '../hooks/useSunscreenReminder';
import { useStore } from '../store/useStore';
import { todayISO } from '../utils/schedule';

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const fmtCountdown = (ms: number) => {
  if (ms <= 0) return 'now';
  const mins = Math.ceil(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export default function SunscreenReminderBar() {
  const reminders = useSunscreenReminder();
  const applySunscreen = useStore((s) => s.applySunscreen);
  const snoozeSunscreen = useStore((s) => s.snoozeSunscreen);
  const skipSunscreen = useStore((s) => s.skipSunscreen);
  const today = todayISO();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  if (reminders.length === 0) return null;
  const r = reminders[0];

  // After cutoff with no remaining reminders, show a finished state then hide.
  if (r.isFinished) return null;

  const nextDue = r.nextDueAt ?? 0;
  const msUntilDue = nextDue - now;
  const snoozeMsLeft = r.snoozedUntil ? r.snoozedUntil - now : 0;
  const pastCutoff = now > r.cutoffMs;

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: -12, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -12, height: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="mx-5 mb-4"
      >
        <div
          className={`rounded-4xl p-4 overflow-hidden relative ${
            r.isDue
              ? 'bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-glow'
              : r.isSnoozed
                ? 'glass text-ink-600'
                : pastCutoff
                  ? 'glass text-ink-500'
                  : 'glass-strong text-ink-800'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={r.isDue ? { rotate: [0, 15, -15, 0] } : {}}
              transition={{ repeat: r.isDue ? Infinity : 0, duration: 1.5 }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                r.isDue ? 'bg-white/25' : pastCutoff ? 'bg-ink-300' : 'bg-gradient-rose'
              }`}
            >
              {r.isDue ? (
                <BellRing size={20} className="text-white" />
              ) : pastCutoff ? (
                <ShieldCheck size={20} className="text-white" />
              ) : (
                <Sun size={20} className="text-white" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate ${r.isDue ? 'text-white' : 'text-ink-900'}`}>
                {r.isDue
                  ? 'Time to reapply sunscreen!'
                  : r.isSnoozed
                    ? 'Sunscreen snoozed'
                    : pastCutoff
                      ? 'Sunscreen day complete'
                      : 'Sunscreen protection active'}
              </p>
              <p className={`text-xs ${r.isDue ? 'text-white/80' : 'text-ink-400'}`}>
                {r.isDue
                  ? `${r.productName} · applied ${fmtTime(r.history[r.history.length - 1])}`
                  : r.isSnoozed
                    ? `Reminders resume in ${fmtCountdown(snoozeMsLeft)}`
                    : pastCutoff
                      ? `Reminders ended at ${fmtTime(r.cutoffMs)}`
                      : `Next reapply in ${fmtCountdown(msUntilDue)} · ${fmtTime(nextDue)}`}
              </p>
            </div>
            <div className={`text-right shrink-0 ${r.isDue ? 'text-white' : 'text-ink-500'}`}>
              <p className="text-lg font-bold leading-none">{r.applyCount}</p>
              <p className="text-[9px] uppercase font-semibold tracking-wide opacity-70">applied</p>
            </div>
          </div>

          {/* Scheduled timeline */}
          <div className={`flex items-center gap-1.5 mb-3 ${r.isDue ? 'text-white' : 'text-ink-500'}`}>
            <Droplets size={12} className="shrink-0 opacity-60" />
            <div className="flex flex-wrap gap-1.5">
              {r.scheduledTimes.map((t, i) => {
                const applied = r.history.some((h) => Math.abs(h - t) < r.intervalMs / 2);
                const skipped = r.skipped.some((s) => Math.abs(s - t) < r.intervalMs / 2);
                const isNext = !applied && !skipped && t >= now && t === nextDue;
                return (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      applied
                        ? r.isDue ? 'bg-white/30 border-white/40 text-white' : 'bg-rose-100 border-rose-200 text-rose-600'
                        : skipped
                          ? r.isDue ? 'bg-white/10 border-white/20 text-white/50 line-through' : 'bg-ink-100 border-ink-200 text-ink-400 line-through'
                          : isNext
                            ? r.isDue ? 'bg-white border-white text-rose-500 animate-pulse' : 'bg-white border-rose-400 text-rose-500'
                            : r.isDue ? 'border-white/30 text-white/70' : 'border-ink-200 text-ink-400'
                    }`}
                  >
                    {fmtTime(t)}
                  </span>
                );
              })}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${r.isDue ? 'border-white/30 text-white/50' : 'border-ink-200 text-ink-300'}`}>
                6 PM cutoff
              </span>
            </div>
          </div>

          {/* Actions */}
          {r.isDue && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <button
                onClick={() => applySunscreen(r.productId, today)}
                className="flex-1 py-2.5 rounded-2xl bg-white text-rose-500 font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check size={16} strokeWidth={3} /> Apply Now
              </button>
              <button
                onClick={() => snoozeSunscreen(r.productId, today, 10)}
                className="px-4 py-2.5 rounded-2xl bg-white/25 text-white font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                <Clock size={16} /> Snooze
              </button>
              <button
                onClick={() => skipSunscreen(r.productId, today)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 text-white/80 font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                <SkipForward size={16} /> Skip
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
