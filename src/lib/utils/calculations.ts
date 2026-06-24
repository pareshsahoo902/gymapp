import { type ExerciseLog, type SetLog } from '@/lib/db';

// Epley Formula: 1RM = Weight × (1 + Reps / 30)
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps === 0 || weight === 0) return 0;
  return Math.round((weight * (1 + reps / 30)) * 10) / 10;
}

export function calculateVolume(exercise: ExerciseLog): number {
  if (exercise.type !== 'strength') return 0;
  return exercise.sets
    .filter((s: SetLog) => s.isCompleted && s.weight && s.reps)
    .reduce((total: number, set: SetLog) => total + ((set.weight || 0) * (set.reps || 0)), 0);
}

export function getBest1RM(exercise: ExerciseLog): number {
  if (exercise.type !== 'strength') return 0;
  const rms = exercise.sets
    .filter((s: SetLog) => s.isCompleted && s.weight && s.reps)
    .map((s: SetLog) => calculate1RM(s.weight || 0, s.reps || 0));
  return rms.length ? Math.max(...rms) : 0;
}

export function getMaxWeight(exercise: ExerciseLog): number {
  if (exercise.type !== 'strength') return 0;
  const weights = exercise.sets
    .filter((s: SetLog) => s.isCompleted && s.weight)
    .map((s: SetLog) => s.weight || 0);
  return weights.length ? Math.max(...weights) : 0;
}