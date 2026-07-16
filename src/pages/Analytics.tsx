import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import { Flame, TrendingUp, Award, XCircle, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import { occursOn, todayISO, addDays } from '../utils/schedule';

export default function Analytics() {
  const products = useStore((s) => s.products);
  const completions = useStore((s) => s.completions);
  const getStreak = useStore((s) => s.getStreak);
  const getLongestStreak = useStore((s) => s.getLongestStreak);
  const getDayCompletion = useStore((s) => s.getDayCompletion);

  const today = todayISO();
  const streak = getStreak();
  const longest = getLongestStreak();

  // Last 7 days completion
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const c = getDayCompletion(date);
      days.push({ date: date.slice(5), completion: c });
    }
    return days;
  }, [today]);

  const weeklyAvg = Math.round(weekData.reduce((s, d) => s + d.completion, 0) / 7);

  // Last 30 days completion
  const monthData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = addDays(today, -i);
      const c = getDayCompletion(date);
      days.push({ date: date.slice(5), completion: c });
    }
    return days;
  }, [today]);

  const monthlyAvg = Math.round(monthData.reduce((s, d) => s + d.completion, 0) / 30);

  // Skipped days (last 30)
  const skipped = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, -i);
      const sched = products.filter((p) => occursOn(p, date));
      if (sched.length === 0) continue;
      const done = completions[date] ?? [];
      const pct = (done.filter((id) => sched.some((p) => p.id === id)).length / sched.length) * 100;
      if (pct < 100) count++;
    }
    return count;
  }, [today, products, completions]);

  // Most consistent month
  const mostConsistent = useMemo(() => {
    const months: Record<string, { total: number; count: number }> = {};
    Object.keys(completions).forEach((date) => {
      const sched = products.filter((p) => occursOn(p, date));
      if (sched.length === 0) return;
      const done = (completions[date] ?? []).filter((id) => sched.some((p) => p.id === id));
      const key = date.slice(0, 7);
      months[key] = months[key] ?? { total: 0, count: 0 };
      months[key].total += (done.length / sched.length) * 100;
      months[key].count++;
    });
    let best = { month: '—', avg: 0 };
    Object.entries(months).forEach(([m, v]) => {
      const avg = v.count > 0 ? Math.round(v.total / v.count) : 0;
      if (avg > best.avg) best = { month: m, avg };
    });
    if (best.month !== '—') {
      const [y, m] = best.month.split('-');
      best.month = new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return best;
  }, [completions, products]);

  const radialData = [
    { name: 'Weekly', value: weeklyAvg, fill: '#ff8aa3' },
    { name: 'Monthly', value: monthlyAvg, fill: '#ff5e80' },
  ];

  const stats = [
    { icon: Layers, label: 'Total Products', value: products.length, color: '#5a6a82' },
    { icon: Flame, label: 'Current Streak', value: `${streak}d`, color: '#ff5e80' },
    { icon: Award, label: 'Longest Streak', value: `${longest}d`, color: '#cba07c' },
    { icon: XCircle, label: 'Skipped (30d)', value: skipped, color: '#cc2a51' },
  ];

  return (
    <div className="min-h-screen premium-gradient pb-32">
      <div className="pt-safe px-5 pt-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Analytics</h1>
        <p className="text-sm text-ink-400">Your consistency, visualized</p>
      </div>

      {/* Stat cards */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-3xl p-4"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${s.color}1a` }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-ink-900">{s.value}</p>
              <p className="text-xs text-ink-400 font-medium">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly area chart */}
      <div className="px-5 mt-5">
        <div className="glass-strong rounded-4xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-ink-800">This Week</h2>
            <span className="text-sm font-bold text-rose-500">{weeklyAvg}%</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
              <defs>
                <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8aa3" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ff8aa3" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,36,51,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7d8a9f' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#7d8a9f' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="completion" stroke="#ff5e80" strokeWidth={2.5} fill="url(#weekGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly area chart */}
      <div className="px-5 mt-4">
        <div className="glass-strong rounded-4xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-semibold text-ink-800">Last 30 Days</h2>
            <span className="text-sm font-bold text-rose-500">{monthlyAvg}%</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={monthData} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cba07c" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#cba07c" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,36,51,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#7d8a9f' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#7d8a9f' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="completion" stroke="#bd8760" strokeWidth={2} fill="url(#monthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radial comparison */}
      <div className="px-5 mt-4">
        <div className="glass-strong rounded-4xl p-4">
          <h2 className="font-display text-base font-semibold text-ink-800 mb-2">Completion Rate</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart data={radialData} innerRadius="35%" outerRadius="100%" startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: 'rgba(31,36,51,0.06)' }} dataKey="value" cornerRadius={20} />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 -mt-4">
            <div className="text-center">
              <div className="w-3 h-3 rounded-full bg-rose-400 mx-auto mb-1" />
              <p className="text-xs text-ink-500 font-medium">Weekly {weeklyAvg}%</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto mb-1" />
              <p className="text-xs text-ink-500 font-medium">Monthly {monthlyAvg}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Most consistent */}
      <div className="px-5 mt-4">
        <div className="glass rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-rose flex items-center justify-center text-white">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-400 font-medium">Most Consistent Month</p>
            <p className="font-semibold text-ink-800">{mostConsistent.month} · {mostConsistent.avg}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
