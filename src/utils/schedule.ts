import { Frequency, Product, RoutineTime } from '../types';

export const todayISO = (d = new Date()): string => {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
};

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const daysBetween = (a: string, b: string): number => {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
};

export const addDays = (iso: string, n: number): string => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return todayISO(d);
};

// Does a product occur on a given date?
export const occursOn = (product: Product, date: string): boolean => {
  const start = product.startDate;
  if (date < start) return false;
  if (product.endDate && date > product.endDate) return false;

  const diff = daysBetween(start, date);
  if (diff < 0) return false;

  const f = product.frequency;
  switch (f.type) {
    case 'daily':
      return true;
    case 'alternate':
      return diff % 2 === 0;
    case 'weekly':
      return new Date(date + 'T00:00:00').getDay() === 0; // default Monday? We'll treat weekly as same weekday as start
    case 'custom_days':
      return (f.weekdays ?? []).includes(new Date(date + 'T00:00:00').getDay());
    case 'every_x_days':
      return diff % Math.max(1, f.intervalDays ?? 1) === 0;
    default:
      return true;
  }
};

// Build today's scheduled products grouped by time, sorted by order
export const scheduleForDate = (products: Product[], date: string): Record<RoutineTime, Product[]> => {
  const groups: Record<RoutineTime, Product[]> = { morning: [], afternoon: [], night: [] };
  products
    .filter((p) => occursOn(p, date))
    .forEach((p) => groups[p.routineTime].push(p));
  (Object.keys(groups) as RoutineTime[]).forEach((t) =>
    groups[t].sort((a, b) => a.order - b.order),
  );
  return groups;
};

export const isSpecialDay = (products: Product[], date: string): { hair: boolean; exfoliation: boolean; medicine: boolean; treatment: boolean } => {
  const todays = products.filter((p) => occursOn(p, date));
  return {
    hair: todays.some((p) => p.category === 'haircare'),
    exfoliation: todays.some((p) => p.category === 'exfoliant'),
    medicine: todays.some((p) => p.category === 'medicine' || p.category === 'supplement'),
    treatment: todays.some((p) => p.category === 'treatment'),
  };
};

export const categoryColor = (cat: string): string => {
  const map: Record<string, string> = {
    cleanser: '#5a6a82',
    serum: '#ff5e80',
    moisturizer: '#cba07c',
    sunscreen: '#ff8aa3',
    treatment: '#a52044',
    medicine: '#3a4456',
    supplement: '#bd8760',
    haircare: '#7e543c',
    exfoliant: '#cc2a51',
    other: '#7d8a9f',
  };
  return map[cat] ?? '#7d8a9f';
};

export const categoryLabel = (cat: string): string => {
  const map: Record<string, string> = {
    cleanser: 'Cleanser',
    serum: 'Serum',
    moisturizer: 'Moisturizer',
    sunscreen: 'Sunscreen',
    treatment: 'Treatment',
    medicine: 'Medicine',
    supplement: 'Supplement',
    haircare: 'Hair Care',
    exfoliant: 'Exfoliant',
    other: 'Other',
  };
  return map[cat] ?? cat;
};

export const categoryIcon = (cat: string): string => {
  const map: Record<string, string> = {
    cleanser: 'Droplets',
    serum: 'FlaskConical',
    moisturizer: 'Sparkles',
    sunscreen: 'Sun',
    treatment: 'FlaskRound',
    medicine: 'Pill',
    supplement: 'Leaf',
    haircare: 'Waves',
    exfoliant: 'Scrub',
    other: 'CircleDot',
  };
  return map[cat] ?? 'CircleDot';
};

export const frequencyLabel = (f: Frequency): string => {
  switch (f.type) {
    case 'daily': return 'Every day';
    case 'alternate': return 'Every other day';
    case 'weekly': return 'Weekly';
    case 'custom_days': return (f.weekdays ?? []).map((d) => WEEKDAYS[d]).join(', ');
    case 'every_x_days': return `Every ${f.intervalDays} days`;
    default: return '';
  }
};

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const greetingEmoji = (): string => {
  const h = new Date().getHours();
  if (h < 12) return '☀️';
  if (h < 17) return '🌤️';
  return '🌙';
};
