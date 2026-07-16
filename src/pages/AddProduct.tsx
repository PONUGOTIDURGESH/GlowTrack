import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Check, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product, ProductCategory, RoutineTime, FrequencyType } from '../types';
import { todayISO, WEEKDAYS, categoryLabel } from '../utils/schedule';

const CATEGORIES: ProductCategory[] = [
  'cleanser', 'serum', 'moisturizer', 'sunscreen', 'treatment',
  'medicine', 'supplement', 'haircare', 'exfoliant', 'other',
];

const TIMES: { value: RoutineTime; label: string; emoji: string }[] = [
  { value: 'morning', label: 'Morning', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { value: 'night', label: 'Night', emoji: '🌙' },
];

const FREQ_TYPES: { value: FrequencyType; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'alternate', label: 'Alternate days' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom_days', label: 'Specific weekdays' },
  { value: 'every_x_days', label: 'Every X days' },
];

export default function AddProduct() {
  const { id } = useParams();
  const nav = useNavigate();
  const products = useStore((s) => s.products);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);

  const existing = id ? products.find((p) => p.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [image, setImage] = useState(existing?.image ?? '');
  const [instructions, setInstructions] = useState(existing?.instructions ?? '');
  const [category, setCategory] = useState<ProductCategory>(existing?.category ?? 'cleanser');
  const [routineTime, setRoutineTime] = useState<RoutineTime>(existing?.routineTime ?? 'morning');
  const [freqType, setFreqType] = useState<FrequencyType>(existing?.frequency.type ?? 'daily');
  const [weekdays, setWeekdays] = useState<number[]>(existing?.frequency.weekdays ?? []);
  const [interval, setInterval] = useState(existing?.frequency.intervalDays ?? 3);
  const [duration, setDuration] = useState(existing?.durationMin ?? 1);
  const [startDate, setStartDate] = useState(existing?.startDate ?? todayISO());
  const [endDate, setEndDate] = useState(existing?.endDate ?? '');
  const [isSunscreen, setIsSunscreen] = useState(existing?.isSunscreen ?? false);
  const [reapplyHours, setReapplyHours] = useState(existing?.reapplyEveryHours ?? 3);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleDay = (d: number) =>
    setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d]));

  const save = () => {
    if (!name.trim()) return;
    const payload: Omit<Product, 'id' | 'createdAt'> = {
      name: name.trim(),
      image,
      instructions,
      category,
      routineTime,
      frequency: {
        type: freqType,
        weekdays: freqType === 'custom_days' ? weekdays : undefined,
        intervalDays: freqType === 'every_x_days' ? interval : undefined,
      },
      durationMin: duration,
      startDate,
      endDate: endDate || undefined,
      order: existing?.order ?? products.length + 1,
      isSunscreen: isSunscreen || category === 'sunscreen',
      reapplyEveryHours: isSunscreen ? reapplyHours : undefined,
    };
    if (existing) updateProduct(existing.id, payload);
    else addProduct(payload);
    nav('/');
  };

  const remove = () => {
    if (!existing) return;
    deleteProduct(existing.id);
    nav('/');
  };

  return (
    <div className="min-h-screen premium-gradient pb-32">
      <div className="pt-safe px-5 pt-6 flex items-center justify-between">
        <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center text-ink-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink-800">
          {existing ? 'Edit Product' : 'Add Product'}
        </h1>
        <div className="w-10" />
      </div>

      <div className="px-5 mt-6 space-y-5">
        {/* Image */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-28 h-28 rounded-3xl glass flex items-center justify-center overflow-hidden"
          >
            {image ? (
              <img src={image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-ink-400">
                <Camera size={26} />
                <span className="text-xs mt-1">Photo</span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>

        {/* Name */}
        <Field label="Product Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vitamin C Serum"
            className="input"
          />
        </Field>

        {/* Instructions */}
        <Field label="Instructions">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="How to apply..."
            rows={2}
            className="input resize-none"
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  category === c ? 'bg-gradient-rose text-white shadow-glow' : 'glass text-ink-600'
                }`}
              >
                {categoryLabel(c)}
              </button>
            ))}
          </div>
        </Field>

        {/* Routine time */}
        <Field label="Routine Time">
          <div className="grid grid-cols-3 gap-2">
            {TIMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setRoutineTime(t.value)}
                className={`py-3 rounded-2xl text-sm font-semibold transition-all ${
                  routineTime === t.value ? 'bg-gradient-rose text-white shadow-glow' : 'glass text-ink-600'
                }`}
              >
                <div className="text-lg">{t.emoji}</div>
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Frequency */}
        <Field label="Frequency">
          <div className="flex flex-wrap gap-2">
            {FREQ_TYPES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFreqType(f.value)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  freqType === f.value ? 'bg-gradient-rose text-white shadow-glow' : 'glass text-ink-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Weekday picker */}
        {freqType === 'custom_days' && (
          <Field label="On these days">
            <div className="flex gap-1.5">
              {WEEKDAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    weekdays.includes(i) ? 'bg-gradient-rose text-white' : 'glass text-ink-500'
                  }`}
                >
                  {d[0]}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Interval */}
        {freqType === 'every_x_days' && (
          <Field label="Every X days">
            <input
              type="number"
              min={1}
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="input"
            />
          </Field>
        )}

        {/* Duration */}
        <Field label="Estimated Time (minutes)">
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="input"
          />
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
          </Field>
          <Field label="End Date (optional)">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
          </Field>
        </div>

        {/* Sunscreen reapply */}
        <div className="glass rounded-3xl p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-ink-800 text-sm">Sunscreen reapplication</p>
              <p className="text-xs text-ink-400">Auto-schedule reapply reminders</p>
            </div>
            <button
              onClick={() => setIsSunscreen((v) => !v)}
              className={`w-12 h-7 rounded-full transition-colors relative ${isSunscreen ? 'bg-gradient-rose' : 'bg-ink-200'}`}
            >
              <motion.div
                layout
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow"
                style={{ left: isSunscreen ? 22 : 2 }}
              />
            </button>
          </label>
          {isSunscreen && (
            <div className="mt-3">
              <p className="text-xs text-ink-400 mb-1">Reapply every (hours)</p>
              <input
                type="number"
                min={1}
                value={reapplyHours}
                onChange={(e) => setReapplyHours(Number(e.target.value))}
                className="input"
              />
            </div>
          )}
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          className="w-full py-4 rounded-3xl bg-gradient-rose text-white font-bold text-lg shadow-glow flex items-center justify-center gap-2"
        >
          <Check size={22} /> {existing ? 'Save Changes' : 'Add to Routine'}
        </motion.button>

        {existing && (
          <button
            onClick={remove}
            className="w-full py-3.5 rounded-3xl glass text-rose-600 font-semibold flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Delete Product
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">{label}</label>
      {children}
    </div>
  );
}
