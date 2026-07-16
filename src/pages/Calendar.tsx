import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Check, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { occursOn, todayISO, WEEKDAYS, categoryLabel, categoryColor, categoryIcon } from '../utils/schedule';
import * as Lucide from 'lucide-react';

const LEGEND = [
  { color: '#5a6a82', label: 'Normal' },
  { color: '#7e543c', label: 'Hair Wash' },
  { color: '#cc2a51', label: 'Exfoliation' },
  { color: '#a52044', label: 'Special Treatment' },
];

export default function Calendar() {
  const products = useStore((s) => s.products);
  const completions = useStore((s) => s.completions);
  const getDayCompletion = useStore((s) => s.getDayCompletion);

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const today = todayISO();

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const tz = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      cells.push(tz.toISOString().slice(0, 10));
    }
    return cells;
  }, [cursor]);

  const dayType = (date: string): { color: string; label: string } => {
    const todays = products.filter((p) => occursOn(p, date));
    if (todays.some((p) => p.category === 'treatment')) return { color: '#a52044', label: 'Special Treatment' };
    if (todays.some((p) => p.category === 'exfoliant')) return { color: '#cc2a51', label: 'Exfoliation' };
    if (todays.some((p) => p.category === 'haircare')) return { color: '#7e543c', label: 'Hair Wash' };
    if (todays.length > 0) return { color: '#5a6a82', label: 'Normal' };
    return { color: 'transparent', label: '' };
  };

  const selectedProducts = selected ? products.filter((p) => occursOn(p, selected)) : [];
  const selectedDone = selected ? completions[selected] ?? [] : [];

  return (
    <div className="min-h-screen premium-gradient pb-32">
      <div className="pt-safe px-5 pt-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Calendar</h1>
        <p className="text-sm text-ink-400">Your routine at a glance</p>
      </div>

      {/* Month nav */}
      <div className="px-5 mt-4 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-ink-700"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display text-lg font-semibold text-ink-800">
          {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-ink-700"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid */}
      <div className="px-5 mt-4">
        <div className="glass-strong rounded-4xl p-3">
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-ink-400 uppercase">{d[0]}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) return <div key={i} />;
              const dt = new Date(date + 'T00:00:00');
              const isToday = date === today;
              const type = dayType(date);
              const done = (completions[date] ?? []).length;
              const sched = products.filter((p) => occursOn(p, date)).length;
              return (
                <button
                  key={date}
                  onClick={() => setSelected(date)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                    isToday ? 'ring-2 ring-rose-400' : ''
                  } ${selected === date ? 'bg-gradient-rose text-white' : 'hover:bg-white/50'}`}
                  style={selected !== date && type.color !== 'transparent' ? { background: `${type.color}1a` } : {}}
                >
                  <span className={`text-sm font-semibold ${selected === date ? 'text-white' : 'text-ink-700'}`}>
                    {dt.getDate()}
                  </span>
                  {sched > 0 && (
                    <span className={`text-[9px] font-medium ${selected === date ? 'text-white/80' : 'text-ink-400'}`}>
                      {done}/{sched}
                    </span>
                  )}
                  {type.color !== 'transparent' && (
                    <div
                      className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                      style={{ background: selected === date ? '#fff' : type.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 mt-4 flex flex-wrap gap-3">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-ink-500 font-medium">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full glass-strong rounded-t-5xl p-6 pb-safe max-h-[75vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink-900">
                    {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-ink-400">{getDayCompletion(selected)}% complete</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full glass flex items-center justify-center text-ink-600">
                  <X size={18} />
                </button>
              </div>

              {selectedProducts.length === 0 ? (
                <p className="text-center text-ink-400 py-8 text-sm">No routine scheduled for this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedProducts.map((p) => {
                    const isDone = selectedDone.includes(p.id);
                    const Icon = (Lucide as any)[categoryIcon(p.category)] ?? Lucide.CircleDot;
                    const color = categoryColor(p.category);
                    return (
                      <div key={p.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}1a` }}>
                          <Icon size={18} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-ink-800 truncate">{p.name}</p>
                          <p className="text-xs text-ink-400">{categoryLabel(p.category)} · {p.routineTime}</p>
                        </div>
                        {isDone ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-rose flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        ) : (
                          <Clock size={16} className="text-ink-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
