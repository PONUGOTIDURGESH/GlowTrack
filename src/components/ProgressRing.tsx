import { motion } from 'framer-motion';

interface Props {
  progress: number; // 0-100
  size?: number;
  stroke?: number;
  gradientId?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function ProgressRing({ progress, size = 120, stroke = 10, gradientId = 'ringRose', children, className }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, progress)) / 100) * circ;

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8aa3" />
            <stop offset="100%" stopColor="#ff5e80" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(31,36,51,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
