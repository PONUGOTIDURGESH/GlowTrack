export type RoutineTime = 'morning' | 'afternoon' | 'night';

export type FrequencyType =
  | 'daily'
  | 'alternate'
  | 'weekly'
  | 'custom_days' // specific weekdays
  | 'every_x_days';

export interface Frequency {
  type: FrequencyType;
  // for 'custom_days': 0=Sun ... 6=Sat
  weekdays?: number[];
  // for 'every_x_days'
  intervalDays?: number;
}

export type ProductCategory =
  | 'cleanser'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'treatment'
  | 'medicine'
  | 'supplement'
  | 'haircare'
  | 'exfoliant'
  | 'other';

export interface Product {
  id: string;
  name: string;
  image: string; // url or data url
  instructions: string;
  category: ProductCategory;
  routineTime: RoutineTime;
  frequency: Frequency;
  durationMin: number; // estimated minutes
  startDate: string; // ISO date
  endDate?: string; // optional
  order: number; // step order within a section
  // sunscreen reapplication
  isSunscreen?: boolean;
  reapplyEveryHours?: number;
  createdAt: number;
}

// A completion record for a product on a date
export interface CompletionRecord {
  productId: string;
  date: string; // YYYY-MM-DD
  time: RoutineTime;
  completedAt: number; // timestamp
  // sunscreen reapplication logs
  reapplications?: number[]; // timestamps of subsequent applies
}

export interface ProgressPhoto {
  id: string;
  image: string;
  date: string; // YYYY-MM-DD
  note: string;
  label?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide name
  unlocked: boolean;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  completed: string[]; // productIds completed
}

// Sunscreen reapplication reminder state, keyed by date
export interface SunscreenState {
  date: string; // YYYY-MM-DD
  productId: string;
  firstAppliedAt: number | null; // timestamp of initial application
  reapplyEveryMs: number; // interval in ms
  history: number[]; // all apply timestamps (first + reapplications)
  snoozedUntil: number | null; // if set, reminders suppressed until this time
  skipped: number[]; // timestamps of skipped reapplications
}
