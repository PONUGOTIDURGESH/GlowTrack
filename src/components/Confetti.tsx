import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Lightweight confetti burst, no deps.
interface Props {
  fire: number; // increment to trigger
}

const COLORS = ['#ff8aa3', '#ff5e80', '#cba07c', '#ffd0d8', '#bd8760', '#5a6a82'];

export default function Confetti({ fire }: Props) {
  const [pieces, setPieces] = useState<number[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (fire === 0) return;
    const ids = Array.from({ length: 36 }, (_, i) => i);
    setPieces(ids);
    setShow(true);
    const t = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(t);
  }, [fire]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
          {pieces.map((i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.3;
            const dur = 1.8 + Math.random() * 0.8;
            const color = COLORS[i % COLORS.length];
            const size = 6 + Math.random() * 8;
            const rot = Math.random() * 360;
            return (
              <motion.div
                key={i}
                initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
                animate={{ y: '110vh', x: (Math.random() - 0.5) * 200, rotate: rot + 360, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur, delay, ease: 'easeIn' }}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: size,
                  height: size * 0.6,
                  background: color,
                  borderRadius: 2,
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
