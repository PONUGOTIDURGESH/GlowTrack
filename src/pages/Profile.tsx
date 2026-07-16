import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { Edit2, Check, Sparkles, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProgressRing from '../components/ProgressRing';

export default function Profile() {
  const userName = useStore((s) => s.userName);
  const setUserName = useStore((s) => s.setUserName);
  const xp = useStore((s) => s.xp);
  const badges = useStore((s) => s.badges);
  const getStreak = useStore((s) => s.getStreak);
  const getLongestStreak = useStore((s) => s.getLongestStreak);
  const getLevel = useStore((s) => s.getLevel);
  const seedDemo = useStore((s) => s.seedDemo);
  const products = useStore((s) => s.products);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userName);

  const level = getLevel();
  const streak = getStreak();
  const longest = getLongestStreak();

  const saveName = () => {
    setUserName(name.trim() || 'Friend');
    setEditing(false);
  };

  return (
    <div className="min-h-screen premium-gradient pb-32">
      <div className="pt-safe px-5 pt-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Profile</h1>
      </div>

      {/* User card */}
      <div className="px-5 mt-4">
        <div className="glass-strong rounded-5xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-rose flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {(userName[0] || 'G').toUpperCase()}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input py-2"
                  autoFocus
                />
                <button onClick={saveName} className="w-9 h-9 rounded-full bg-gradient-rose flex items-center justify-center text-white shrink-0">
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink-900">{userName}</h2>
                <button onClick={() => setEditing(true)} className="text-ink-400 hover:text-ink-700">
                  <Edit2 size={15} />
                </button>
              </div>
            )}
            <p className="text-xs text-ink-400 mt-0.5">{level.name} · {xp} XP</p>
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="px-5 mt-4">
        <div className="glass rounded-4xl p-5 flex items-center gap-5">
          <ProgressRing progress={level.progress} size={100} stroke={9}>
            <span className="text-lg font-bold text-ink-900">{level.progress.toFixed(0)}%</span>
          </ProgressRing>
          <div>
            <p className="text-xs text-ink-400 font-semibold uppercase tracking-wide">Current Level</p>
            <p className="font-display text-lg font-semibold text-ink-800">{level.name}</p>
            {level.next !== null && (
              <p className="text-xs text-ink-400 mt-1">{level.next - xp} XP to next level</p>
            )}
          </div>
        </div>
      </div>

      {/* Streak summary */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <div className="glass rounded-3xl p-4 text-center">
          <p className="text-3xl font-bold text-rose-500">{streak}</p>
          <p className="text-xs text-ink-400 font-medium">Current Streak</p>
        </div>
        <div className="glass rounded-3xl p-4 text-center">
          <p className="text-3xl font-bold text-sand-500">{longest}</p>
          <p className="text-xs text-ink-400 font-medium">Longest Streak</p>
        </div>
      </div>

      {/* Badges */}
      <div className="px-5 mt-5">
        <h2 className="font-display text-base font-semibold text-ink-800 mb-3">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b, i) => {
            const Icon = (Lucide as any)[b.icon] ?? Lucide.Award;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-3xl p-4 text-center ${b.unlocked ? 'glass-strong shadow-glow' : 'glass opacity-50'}`}
              >
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 ${b.unlocked ? 'bg-gradient-rose text-white' : 'bg-ink-100 text-ink-400'}`}>
                  <Icon size={22} />
                </div>
                <p className="text-[11px] font-bold text-ink-800 leading-tight">{b.title}</p>
                <p className="text-[9px] text-ink-400 mt-0.5 leading-tight">{b.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Levels ladder */}
      <div className="px-5 mt-5">
        <h2 className="font-display text-base font-semibold text-ink-800 mb-3">Levels</h2>
        <div className="space-y-2">
          {[
            { name: 'Beginner', min: 0, icon: 'Sparkles' },
            { name: 'Consistent', min: 300, icon: 'Flame' },
            { name: 'Advanced', min: 800, icon: 'Zap' },
            { name: 'Skincare Master', min: 2000, icon: 'Crown' },
          ].map((l) => {
            const Icon = (Lucide as any)[l.icon];
            const reached = xp >= l.min;
            return (
              <div key={l.name} className={`glass rounded-2xl p-3 flex items-center gap-3 ${reached ? '' : 'opacity-50'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${reached ? 'bg-gradient-rose text-white' : 'bg-ink-100 text-ink-400'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-ink-800">{l.name}</p>
                  <p className="text-xs text-ink-400">{l.min} XP</p>
                </div>
                {reached && <Check size={18} className="text-rose-500" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo data */}
      {products.length === 0 && (
        <div className="px-5 mt-5">
          <button
            onClick={seedDemo}
            className="w-full py-3.5 rounded-3xl glass text-ink-700 font-semibold flex items-center justify-center gap-2"
          >
            <Sparkles size={18} /> Load Sample Routine
          </button>
        </div>
      )}

      {/* Reset */}
      <div className="px-5 mt-3">
        <button
          onClick={() => {
            if (confirm('Reset all data? This cannot be undone.')) {
              localStorage.removeItem('glowtrack-v1');
              location.reload();
            }
          }}
          className="w-full py-3 rounded-3xl glass text-rose-600 font-medium flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw size={16} /> Reset All Data
        </button>
      </div>

      <p className="text-center text-xs text-ink-300 mt-6">GlowTrack v1.0 · Local-first PWA</p>
    </div>
  );
}
