import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, Sunrise, Sun, Moon, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  scheduleForDate,
  todayISO,
  greeting,
  greetingEmoji,
  isSpecialDay,
  addDays,
} from '../utils/schedule';
import { RoutineTime } from '../types';
import ProductCard from '../components/ProductCard';
import ProgressRing from '../components/ProgressRing';
import EmptyState from '../components/EmptyState';
import SpecialPopup from '../components/SpecialPopup';
import Confetti from '../components/Confetti';
import SunscreenReminderBar from '../components/SunscreenReminderBar';

const SECTION_META: Record<RoutineTime, { label: string; icon: typeof Sunrise; gradient: string }> = {
  morning: { label: 'Morning', icon: Sunrise, gradient: 'from-amber-200/60 to-rose-100/40' },
  afternoon: { label: 'Afternoon', icon: Sun, gradient: 'from-rose-100/50 to-sand-100/40' },
  night: { label: 'Night', icon: Moon, gradient: 'from-ink-200/50 to-ink-100/30' },
};

export default function Dashboard() {
  const today = todayISO();
  const products = useStore((s) => s.products);
  const completions = useStore((s) => s.completions);
  const toggleComplete = useStore((s) => s.toggleComplete);
  const userName = useStore((s) => s.userName);
  const getStreak = useStore((s) => s.getStreak);
  const getDayCompletion = useStore((s) => s.getDayCompletion);

  const [confettiFire, setConfettiFire] = useState(0);
  const [popup, setPopup] = useState<{ title: string; message: string; emoji: string; variant: 'special' | 'reminder' } | null>(null);

  const schedule = useMemo(() => scheduleForDate(products, today), [products, today]);
  const done = completions[today] ?? [];
  const allScheduled = useMemo(() => [...schedule.morning, ...schedule.afternoon, ...schedule.night], [schedule]);
  const remaining = allScheduled.filter((p) => !done.includes(p.id));
  const completion = getDayCompletion(today);
  const streak = getStreak();

  const allDone = allScheduled.length > 0 && remaining.length === 0;

  // Confetti when all done
  useEffect(() => {
    if (allDone) setConfettiFire((f) => f + 1);
  }, [allDone]);

  // Special day popup on load
  useEffect(() => {
    const special = isSpecialDay(products, today);
    const shown = sessionStorage.getItem('glow_special_' + today);
    if (shown) return;
    if (special.hair) {
      setPopup({ title: 'Today is Hair Wash Day', message: "Don't miss it — your scalp routine is scheduled this morning.", emoji: '🧴', variant: 'special' });
      sessionStorage.setItem('glow_special_' + today, '1');
    } else if (special.exfoliation) {
      setPopup({ title: 'Today is Exfoliation Day', message: 'A gentle exfoliant is in your night routine tonight.', emoji: '✨', variant: 'special' });
      sessionStorage.setItem('glow_special_' + today, '1');
    } else if (special.medicine) {
      setPopup({ title: 'Medicine Scheduled Today', message: "You have medicines or supplements in today's routine.", emoji: '💊', variant: 'special' });
      sessionStorage.setItem('glow_special_' + today, '1');
    }
  }, [products, today]);

  // Pre-reminder for tomorrow
  useEffect(() => {
    const shown = sessionStorage.getItem('glow_pre_' + today);
    if (shown) return;
    const tomorrow = addDays(today, 1);
    const tomSpecial = isSpecialDay(products, tomorrow);
    if (tomSpecial.hair) {
      setPopup({ title: 'Tomorrow is Hair Wash Day', message: "Prepare your products tonight so you're ready.", emoji: '🔔', variant: 'reminder' });
      sessionStorage.setItem('glow_pre_' + today, '1');
    }
  }, [products, today]);

  const renderSection = (time: RoutineTime) => {
    const items = schedule[time].filter((p) => !done.includes(p.id));
    if (items.length === 0) return null;
    const meta = SECTION_META[time];
    const Icon = meta.icon;
    return (
      <section key={time} className="mb-6">
        <div className={`flex items-center gap-2 mb-3 px-1`}>
          <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
            <Icon size={18} className="text-ink-700" />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink-800">{meta.label}</h2>
          <span className="text-xs text-ink-400 font-medium ml-auto">{items.length} remaining</span>
        </div>
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                step={i + 1}
                completed={false}
                index={i}
                onToggle={() => toggleComplete(p.id, today, time)}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    );
  };

  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen premium-gradient pb-32">
      <Confetti fire={confettiFire} />
      <SpecialPopup
        open={!!popup}
        onClose={() => setPopup(null)}
        title={popup?.title ?? ''}
        message={popup?.message ?? ''}
        emoji={popup?.emoji ?? ''}
        variant={popup?.variant}
      />

      {/* Header */}
      <div className="pt-safe px-5 pt-6 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-ink-400 font-medium">
              {greeting()}, {userName} {greetingEmoji()}
            </p>
            <p className="text-xs text-ink-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-ink-600"
          >
            <Bell size={20} />
          </motion.button>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-5xl p-6 flex items-center gap-5"
        >
          <ProgressRing progress={completion} size={110} stroke={11}>
            <span className="text-2xl font-bold text-ink-900">{completion}%</span>
            <span className="text-[10px] text-ink-400 font-semibold uppercase tracking-wide">Today</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-sm text-ink-500 font-medium">Today's Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <Flame size={22} className="text-rose-500 fill-rose-400/30" />
              <span className="text-3xl font-bold text-ink-900">{streak}</span>
              <span className="text-sm text-ink-400 font-medium">day streak</span>
            </div>
            <p className="text-xs text-ink-400 mt-1">
              {remaining.length} of {allScheduled.length} tasks left
            </p>
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="px-5 mt-6">
        <SunscreenReminderBar />

        {!hasProducts ? (
          <div className="text-center py-16">
            <p className="text-ink-400 mb-4">No products yet. Let's build your routine.</p>
            <a
              href="/add"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-rose text-white font-semibold shadow-glow"
            >
              <Plus size={20} /> Add your first product
            </a>
          </div>
        ) : allDone ? (
          <EmptyState />
        ) : (
          <>
            {renderSection('morning')}
            {renderSection('afternoon')}
            {renderSection('night')}
          </>
        )}
      </div>

      {/* Floating add button */}
      <motion.a
        href="/add"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="fixed right-5 bottom-24 z-[90] w-14 h-14 rounded-full bg-gradient-rose text-white flex items-center justify-center shadow-glow"
      >
        <Plus size={26} />
      </motion.a>
    </div>
  );
}
