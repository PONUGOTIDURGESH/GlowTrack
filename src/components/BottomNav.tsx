import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Camera, BarChart3, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Today' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/photos', icon: Camera, label: 'Photos' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] pb-safe px-4">
      <nav className="mx-auto max-w-md glass-strong rounded-3xl px-2 py-2 flex items-center justify-between shadow-glass-lg">
        {tabs.map((t) => {
          const active = loc.pathname === t.to;
          const Icon = t.icon;
          return (
            <button
              key={t.to}
              onClick={() => nav(t.to)}
              className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors"
            >
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 rounded-2xl bg-gradient-rose"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <motion.div animate={{ scale: active ? 1.05 : 1, y: active ? -1 : 0 }}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? 'text-white relative z-10' : 'text-ink-400 relative z-10'}
                />
              </motion.div>
              <span className={`text-[10px] font-semibold relative z-10 ${active ? 'text-white' : 'text-ink-400'}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
