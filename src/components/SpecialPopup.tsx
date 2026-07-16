import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emoji: string;
  variant?: 'special' | 'reminder';
}

export default function SpecialPopup({ open, onClose, title, message, emoji, variant = 'special' }: Props) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`relative glass-strong rounded-5xl p-8 max-w-sm w-full text-center overflow-hidden ${
              variant === 'special' ? 'shadow-glow' : ''
            }`}
          >
            {variant === 'special' && (
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-rose opacity-20 blur-2xl" />
            )}
            <button onClick={onClose} className="absolute top-4 right-4 text-ink-400 hover:text-ink-700 transition-colors">
              <X size={20} />
            </button>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="text-6xl mb-3"
            >
              {emoji}
            </motion.div>
            <div className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> {variant === 'special' ? 'Important Today' : 'Heads Up'}
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink-900 mb-2">{title}</h2>
            <p className="text-ink-500 text-sm leading-relaxed">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
