import Dexie, { type Table } from 'dexie';

export type ExerciseType = 'strength' | 'bodyweight' | 'conditioning';

export interface SetLog {
  id: string;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  incline?: number;
  isCompleted: boolean;
}

export interface ExerciseLog {
  id: string;
  name: string;
  type: ExerciseType;
  sets: SetLog[];
  notes?: string;
}

export interface Workout {
  id: string;
  date: string;
  day: string;
  duration: number;
  exercises: ExerciseLog[];
}

export interface BodyWeight {
  id?: number;
  date: string;
  weight: number;
}

export interface PR {
  id?: number;
  exercise: string;
  type: 'max_weight' | 'estimated_1rm' | 'max_volume';
  value: number;
  date: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
}

export class GymBudDatabase extends Dexie {
  workouts!: Table<Workout, string>;
  bodyweights!: Table<BodyWeight, number>;
  prs!: Table<PR, number>;
  achievements!: Table<Achievement, string>;

  constructor() {
    super('GymBudDB');
    this.version(2).stores({
      workouts: 'id, date, day',
      bodyweights: '++id, date',
      prs: '++id, exercise, type, date',
      achievements: 'id'
    });
  }
}

export const db = new GymBudDatabase();