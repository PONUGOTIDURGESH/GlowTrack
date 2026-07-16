import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, X, Trash2, MoveHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Photos() {
  const photos = useStore((s) => s.photos);
  const addPhoto = useStore((s) => s.addPhoto);
  const deletePhoto = useStore((s) => s.deletePhoto);
  const fileRef = useRef<HTMLInputElement>(null);

  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [label, setLabel] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const confirmAdd = () => {
    if (!pendingImage) return;
    addPhoto(pendingImage, note, label || undefined);
    setPendingImage(null);
    setNote('');
    setLabel('');
  };

  const sorted = [...photos].sort((a, b) => b.date.localeCompare(a.date));
  const hasCompare = sorted.length >= 2;
  const first = sorted[sorted.length - 1];
  const last = sorted[0];

  return (
    <div className="min-h-screen premium-gradient pb-32">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div className="pt-safe px-5 pt-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Progress Photos</h1>
          <p className="text-sm text-ink-400">Track your glow-up journey</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-11 h-11 rounded-full bg-gradient-rose flex items-center justify-center text-white shadow-glow"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Before / After compare */}
      {hasCompare && (
        <div className="px-5 mt-5">
          <div className="glass-strong rounded-4xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-ink-800">Before & After</h2>
              <button
                onClick={() => setCompareMode((v) => !v)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${compareMode ? 'bg-gradient-rose text-white' : 'glass text-ink-600'}`}
              >
                <MoveHorizontal size={14} className="inline mr-1" /> Slider
              </button>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              {compareMode ? (
                <div className="relative w-full h-full select-none">
                  <img src={last.image} alt="after" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                    <img src={first.image} alt="before" className="absolute inset-0 h-full object-cover" style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }} />
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <MoveHorizontal size={16} className="text-ink-700" />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                  />
                  <span className="absolute top-2 left-2 text-xs font-bold text-white bg-ink-900/50 px-2 py-1 rounded-full">Before</span>
                  <span className="absolute top-2 right-2 text-xs font-bold text-white bg-ink-900/50 px-2 py-1 rounded-full">After</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 h-full">
                  <div className="relative">
                    <img src={first.image} alt="before" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-xs font-bold text-white bg-ink-900/50 px-2 py-1 rounded-full">Before</span>
                  </div>
                  <div className="relative">
                    <img src={last.image} alt="after" className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 text-xs font-bold text-white bg-ink-900/50 px-2 py-1 rounded-full">After</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-ink-400 mt-2">
              <span>{first.date}</span>
              <span>{last.date}</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="px-5 mt-6">
        <h2 className="font-display text-base font-semibold text-ink-800 mb-3">Timeline</h2>
        {sorted.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <Camera size={32} className="mx-auto text-ink-300 mb-3" />
            <p className="text-ink-400 text-sm">No photos yet. Tap + to add your first progress photo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-3xl overflow-hidden"
              >
                <div className="relative aspect-video">
                  <img src={photo.image} alt="" className="w-full h-full object-cover" />
                  {photo.label && (
                    <span className="absolute top-2 left-2 text-xs font-bold text-white bg-gradient-rose px-2.5 py-1 rounded-full">
                      {photo.label}
                    </span>
                  )}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink-950/40 backdrop-blur flex items-center justify-center text-white"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-ink-500">{photo.date}</p>
                  {photo.note && <p className="text-sm text-ink-600 mt-0.5">{photo.note}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {pendingImage && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setPendingImage(null)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full glass-strong rounded-t-5xl p-6 pb-safe"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-ink-900">New Photo</h3>
                <button onClick={() => setPendingImage(null)} className="w-9 h-9 rounded-full glass flex items-center justify-center text-ink-600">
                  <X size={18} />
                </button>
              </div>
              <img src={pendingImage} alt="" className="w-full aspect-video object-cover rounded-2xl mb-4" />
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (e.g. Day 1, Day 30)"
                className="input mb-3"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notes about your skin today..."
                rows={2}
                className="input resize-none mb-4"
              />
              <button
                onClick={confirmAdd}
                className="w-full py-3.5 rounded-3xl bg-gradient-rose text-white font-bold shadow-glow"
              >
                Save Photo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
