import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProgressPhoto, CompletionRecord, Badge, SunscreenState } from '../types';
import { occursOn, todayISO, addDays, daysBetween } from '../utils/schedule';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const LEVELS = [
  { name: 'Beginner', min: 0 },
  { name: 'Consistent', min: 300 },
  { name: 'Advanced', min: 800 },
  { name: 'Skincare Master', min: 2000 },
];

export const ALL_BADGES: Badge[] = [
  { id: 'streak7', title: '7 Day Warrior', description: 'Maintain a 7-day streak', icon: 'Flame', unlocked: false },
  { id: 'streak30', title: '30 Day Champion', description: 'Maintain a 30-day streak', icon: 'Trophy', unlocked: false },
  { id: 'streak90', title: '90 Day Legend', description: 'Maintain a 90-day streak', icon: 'Crown', unlocked: false },
  { id: 'first_photo', title: 'First Snapshot', description: 'Upload your first progress photo', icon: 'Camera', unlocked: false },
  { id: 'first_complete', title: 'First Complete Day', description: 'Complete all tasks for a day', icon: 'CheckCircle2', unlocked: false },
  { id: 'ten_products', title: 'Curator', description: 'Add 10 products to your routine', icon: 'Layers', unlocked: false },
];

interface State {
  products: Product[];
  completions: Record<string, string[]>; // date -> productIds completed
  records: CompletionRecord[];
  photos: ProgressPhoto[];
  xp: number;
  badges: Badge[];
  userName: string;
  lastActiveDate: string;
  sunscreens: Record<string, SunscreenState>; // date -> state

  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleComplete: (productId: string, date: string, time: Product['routineTime']) => void;
  addPhoto: (image: string, note: string, label?: string) => void;
  deletePhoto: (id: string) => void;
  setUserName: (name: string) => void;
  initSunscreen: (productId: string, date: string, intervalHours: number) => void;
  applySunscreen: (productId: string, date: string) => void;
  snoozeSunscreen: (productId: string, date: string, minutes: number) => void;
  skipSunscreen: (productId: string, date: string) => void;
  recomputeStreak: () => number;
  getStreak: () => number;
  getLongestStreak: () => number;
  getLevel: () => { name: string; progress: number; next: number | null };
  getDayCompletion: (date: string) => number;
  seedDemo: () => void;
}

const computeScheduled = (products: Product[], date: string) =>
  products.filter((p) => occursOn(p, date)).map((p) => p.id);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      products: [],
      completions: {},
      records: [],
      photos: [],
      xp: 0,
      badges: ALL_BADGES.map((b) => ({ ...b })),
      userName: 'Durgesh',
      lastActiveDate: todayISO(),
      sunscreens: {},

      addProduct: (p) =>
        set((s) => {
          const product: Product = { ...p, id: uid(), createdAt: Date.now() };
          const products = [...s.products, product];
          const badges = [...s.badges];
          if (products.length >= 10) {
            const idx = badges.findIndex((b) => b.id === 'ten_products');
            if (idx >= 0 && !badges[idx].unlocked) badges[idx] = { ...badges[idx], unlocked: true };
          }
          return { products, badges };
        }),

      updateProduct: (id, patch) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      toggleComplete: (productId, date, time) =>
        set((s) => {
          const day = s.completions[date] ?? [];
          const isDone = day.includes(productId);
          let completions = { ...s.completions };
          let records = [...s.records];
          let xp = s.xp;
          const badges = [...s.badges];
          let sunscreens = s.sunscreens;

          if (isDone) {
            completions[date] = day.filter((id) => id !== productId);
            records = records.filter((r) => !(r.productId === productId && r.date === date));
            xp = Math.max(0, xp - 5);
            // clear sunscreen reminder state if un-checking the base sunscreen
            const prod = s.products.find((p) => p.id === productId);
            if (prod?.isSunscreen) {
              const { [date]: _drop, ...rest } = s.sunscreens;
              sunscreens = rest;
            }
          } else {
            completions[date] = [...day, productId];
            records.push({ productId, date, time, completedAt: Date.now() });
            xp += 10;
            // initialize sunscreen smart reminder when a sunscreen product is checked
            const prod = s.products.find((p) => p.id === productId);
            if (prod?.isSunscreen && prod.reapplyEveryHours) {
              const now = Date.now();
              sunscreens = {
                ...s.sunscreens,
                [date]: {
                  date,
                  productId,
                  firstAppliedAt: now,
                  reapplyEveryMs: prod.reapplyEveryHours * 3600_000,
                  history: [now],
                  snoozedUntil: null,
                  skipped: [],
                },
              };
            }
            // check full day complete
            const scheduled = computeScheduled(s.products, date);
            if (scheduled.length > 0 && scheduled.every((id) => completions[date].includes(id))) {
              xp += 25;
              const idx = badges.findIndex((b) => b.id === 'first_complete');
              if (idx >= 0 && !badges[idx].unlocked) badges[idx] = { ...badges[idx], unlocked: true };
            }
          }
          return { completions, records, xp, badges, lastActiveDate: todayISO(), sunscreens };
        }),

      addPhoto: (image, note, label) =>
        set((s) => {
          const photo: ProgressPhoto = { id: uid(), image, note, label, date: todayISO() };
          const badges = [...s.badges];
          const idx = badges.findIndex((b) => b.id === 'first_photo');
          if (idx >= 0 && !badges[idx].unlocked) badges[idx] = { ...badges[idx], unlocked: true };
          return { photos: [...s.photos, photo], badges, xp: s.xp + 15 };
        }),

      deletePhoto: (id) => set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      setUserName: (name) => set({ userName: name }),

      initSunscreen: (productId, date, intervalHours) =>
        set((s) => {
          const existing = s.sunscreens[date];
          if (existing && existing.productId === productId && existing.firstAppliedAt) return {};
          const now = Date.now();
          const state: SunscreenState = {
            date,
            productId,
            firstAppliedAt: existing?.firstAppliedAt ?? now,
            reapplyEveryMs: intervalHours * 3600_000,
            history: existing?.history?.length ? existing.history : [now],
            snoozedUntil: existing?.snoozedUntil ?? null,
            skipped: existing?.skipped ?? [],
          };
          return { sunscreens: { ...s.sunscreens, [date]: state } };
        }),

      applySunscreen: (_productId, date) =>
        set((s) => {
          const cur = s.sunscreens[date];
          if (!cur) return {};
          const now = Date.now();
          return {
            sunscreens: {
              ...s.sunscreens,
              [date]: {
                ...cur,
                history: [...cur.history, now],
                snoozedUntil: null,
              },
            },
            xp: s.xp + 3,
          };
        }),

      snoozeSunscreen: (_productId, date, minutes) =>
        set((s) => {
          const cur = s.sunscreens[date];
          if (!cur) return {};
          return {
            sunscreens: {
              ...s.sunscreens,
              [date]: { ...cur, snoozedUntil: Date.now() + minutes * 60_000 },
            },
          };
        }),

      skipSunscreen: (_productId, date) =>
        set((s) => {
          const cur = s.sunscreens[date];
          if (!cur) return {};
          const now = Date.now();
          return {
            sunscreens: {
              ...s.sunscreens,
              [date]: {
                ...cur,
                skipped: [...cur.skipped, now],
                snoozedUntil: null,
              },
            },
          };
        }),

      recomputeStreak: () => {
        const { completions, products } = get();
        let streak = 0;
        let cursor = todayISO();
        // If today not fully done yet, streak counts from yesterday backward
        const todaysScheduled = computeScheduled(products, cursor);
        const todaysDone = completions[cursor] ?? [];
        const todayComplete = todaysScheduled.length > 0 && todaysScheduled.every((id) => todaysDone.includes(id));
        if (!todayComplete) cursor = addDays(cursor, -1);
        while (true) {
          const sched = computeScheduled(products, cursor);
          if (sched.length === 0) {
            // no tasks scheduled — don't break streak, skip day
            cursor = addDays(cursor, -1);
            if (daysBetween(cursor, todayISO()) > 365) break;
            continue;
          }
          const done = completions[cursor] ?? [];
          if (sched.every((id) => done.includes(id))) {
            streak++;
            cursor = addDays(cursor, -1);
          } else {
            break;
          }
        }
        return streak;
      },

      getStreak: () => get().recomputeStreak(),

      getLongestStreak: () => {
        const { completions, products } = get();
        let longest = 0;
        let cur = 0;
        // iterate from earliest product start to today
        const dates = Object.keys(completions).sort();
        if (dates.length === 0) return 0;
        const start = dates[0];
        const end = todayISO();
        let cursor = start;
        while (cursor <= end) {
          const sched = computeScheduled(products, cursor);
          const done = completions[cursor] ?? [];
          if (sched.length > 0 && sched.every((id) => done.includes(id))) {
            cur++;
            longest = Math.max(longest, cur);
          } else if (sched.length > 0) {
            cur = 0;
          }
          cursor = addDays(cursor, 1);
        }
        return longest;
      },

      getLevel: () => {
        const xp = get().xp;
        let level = LEVELS[0];
        for (const l of LEVELS) if (xp >= l.min) level = l;
        const idx = LEVELS.indexOf(level);
        const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1].min : null;
        const progress = next === null ? 100 : Math.min(100, ((xp - level.min) / (next - level.min)) * 100);
        return { name: level.name, progress, next };
      },

      getDayCompletion: (date) => {
        const { products, completions } = get();
        const sched = computeScheduled(products, date);
        if (sched.length === 0) return 0;
        const done = completions[date] ?? [];
        return Math.round((done.filter((id) => sched.includes(id)).length / sched.length) * 100);
      },

      seedDemo: () => {
        const today = todayISO();
        const demo: Product[] = [
          { id: uid(), name: 'Gentle Face Wash', image: '', instructions: 'Massage onto damp skin for 60 seconds, rinse lukewarm.', category: 'cleanser', routineTime: 'morning', frequency: { type: 'daily' }, durationMin: 2, startDate: today, order: 1, createdAt: Date.now() },
          { id: uid(), name: 'Vitamin C Serum', image: '', instructions: 'Apply 3-4 drops, press gently into skin.', category: 'serum', routineTime: 'morning', frequency: { type: 'daily' }, durationMin: 1, startDate: today, order: 2, createdAt: Date.now() },
          { id: uid(), name: 'Daily Moisturizer', image: '', instructions: 'Smooth a pea-sized amount evenly.', category: 'moisturizer', routineTime: 'morning', frequency: { type: 'daily' }, durationMin: 1, startDate: today, order: 3, createdAt: Date.now() },
          { id: uid(), name: 'Mineral Sunscreen SPF 50', image: '', instructions: 'Apply two finger-lengths, reapply every 3 hours.', category: 'sunscreen', routineTime: 'morning', frequency: { type: 'daily' }, durationMin: 1, startDate: today, order: 4, isSunscreen: true, reapplyEveryHours: 3, createdAt: Date.now() },
          { id: uid(), name: 'Vitamin D3', image: '', instructions: 'Take 1 tablet with breakfast.', category: 'supplement', routineTime: 'morning', frequency: { type: 'daily' }, durationMin: 1, startDate: today, order: 5, createdAt: Date.now() },
          { id: uid(), name: 'Sunscreen Reapply', image: '', instructions: 'Reapply sunscreen over makeup.', category: 'sunscreen', routineTime: 'afternoon', frequency: { type: 'daily' }, durationMin: 1, startDate: today, order: 1, isSunscreen: true, reapplyEveryHours: 3, createdAt: Date.now() },
          { id: uid(), name: 'Cream A (Mon/Wed/Fri)', image: '', instructions: 'Rotate treatment cream — thin layer.', category: 'treatment', routineTime: 'night', frequency: { type: 'custom_days', weekdays: [1, 3, 5] }, durationMin: 2, startDate: today, order: 1, createdAt: Date.now() },
          { id: uid(), name: 'Cream B (Tue/Thu/Sat)', image: '', instructions: 'Alternate treatment cream.', category: 'treatment', routineTime: 'night', frequency: { type: 'custom_days', weekdays: [2, 4, 6] }, durationMin: 2, startDate: today, order: 1, createdAt: Date.now() },
          { id: uid(), name: 'Night Cream', image: '', instructions: 'Apply generously before bed.', category: 'moisturizer', routineTime: 'night', frequency: { type: 'daily' }, durationMin: 1, startDate: today, order: 2, createdAt: Date.now() },
          { id: uid(), name: 'Hair Wash', image: '', instructions: 'Scalp shampoo + conditioner.', category: 'haircare', routineTime: 'morning', frequency: { type: 'custom_days', weekdays: [1, 3, 6] }, durationMin: 15, startDate: today, order: 0, createdAt: Date.now() },
          { id: uid(), name: 'Weekly Exfoliation', image: '', instructions: 'Gentle chemical exfoliant, leave 5 min.', category: 'exfoliant', routineTime: 'night', frequency: { type: 'every_x_days', intervalDays: 5 }, durationMin: 6, startDate: today, order: 0, createdAt: Date.now() },
        ];
        set({ products: demo, xp: 120 });
      },
    }),
    { name: 'glowtrack-v1' },
  ),
);
