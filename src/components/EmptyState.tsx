import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong rounded-5xl p-10 text-center mx-auto max-w-sm"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="inline-flex w-20 h-20 rounded-full bg-gradient-rose items-center justify-center mb-4 shadow-glow"
      >
        <PartyPopper size={40} className="text-white" />
      </motion.div>
      <h2 className="font-display text-2xl font-semibold text-ink-900 mb-2">Amazing!</h2>
      <p className="text-ink-500 text-sm leading-relaxed">
        Today's skincare and medicines are complete. Enjoy your day.
      </p>
    </motion.div>
  );
}
