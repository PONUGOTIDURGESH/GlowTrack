import { motion } from 'framer-motion';
import { Check, Clock, Droplets } from 'lucide-react';
import { Product } from '../types';
import { categoryColor, categoryIcon } from '../utils/schedule';
import * as Lucide from 'lucide-react';

interface Props {
  product: Product;
  step: number;
  completed: boolean;
  onToggle: () => void;
  index: number;
}

export default function ProductCard({ product, step, completed, onToggle, index }: Props) {
  const Icon = (Lucide as any)[categoryIcon(product.category)] ?? Lucide.CircleDot;
  const color = categoryColor(product.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 80, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
      className="glass rounded-3xl p-4 flex items-center gap-3"
    >
      {/* Step badge */}
      <div className="flex flex-col items-center justify-center w-9 shrink-0">
        <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">Step</span>
        <span className="text-xl font-bold text-ink-800 leading-none">{step}</span>
      </div>

      {/* Image / icon */}
      <div
        className="relative w-14 h-14 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center"
        style={{ background: `${color}1a` }}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Icon size={26} style={{ color }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-ink-900 truncate">{product.name}</h3>
        {product.instructions && (
          <p className="text-xs text-ink-500 truncate">{product.instructions}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-400 font-medium">
            <Clock size={12} /> {product.durationMin} min
          </span>
          {product.isSunscreen && (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium">
              <Droplets size={12} /> Reapply {product.reapplyEveryHours}h
            </span>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={onToggle}
        className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
          completed
            ? 'bg-gradient-rose text-white shadow-glow'
            : 'bg-white/70 border-2 border-ink-200 text-transparent'
        }`}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {completed && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <Check size={22} strokeWidth={3} />
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  );
}
