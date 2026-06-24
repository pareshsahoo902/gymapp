import { type ExerciseLog } from '@/lib/db';

export const WORKOUT_PLAN = [
  {
    id: 'day-1',
    name: 'Day 1 – Upper Strength',
    description: 'Heavy compound movements for upper body strength.',
    exercises: [
      { name: 'Bench Press', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 5, isCompleted: false }) },
      { name: 'Pullups', type: 'bodyweight', sets: Array(4).fill({ reps: 8, isCompleted: false }) },
      { name: 'Overhead Press', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 5, isCompleted: false }) },
      { name: 'Barbell Row', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 6, isCompleted: false }) },
      { name: 'Lateral Raise', type: 'strength', sets: Array(3).fill({ weight: 0, reps: 10, isCompleted: false }) },
    ] as Omit<ExerciseLog, 'id'>[]
  },
  {
    id: 'day-2',
    name: 'Day 2 – Lower Strength',
    description: 'Heavy compound movements for lower body strength.',
    exercises: [
      { name: 'Squat', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 5, isCompleted: false }) },
      { name: 'Romanian Deadlift', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 6, isCompleted: false }) },
      { name: 'Leg Press', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 8, isCompleted: false }) },
      { name: 'Calf Raise', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 12, isCompleted: false }) },
    ] as Omit<ExerciseLog, 'id'>[]
  },
  {
    id: 'day-3',
    name: 'Day 3 – Upper Hypertrophy',
    description: 'Volume focus for upper body muscle growth.',
    exercises: [
      { name: 'Incline Dumbbell Press', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 10, isCompleted: false }) },
      { name: 'Seated Row', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 10, isCompleted: false }) },
      { name: 'Lat Pulldown', type: 'strength', sets: Array(3).fill({ weight: 0, reps: 12, isCompleted: false }) },
      { name: 'Lateral Raise', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 12, isCompleted: false }) },
      { name: 'Biceps Curl', type: 'strength', sets: Array(3).fill({ weight: 0, reps: 12, isCompleted: false }) },
      { name: 'Tricep Pushdown', type: 'strength', sets: Array(3).fill({ weight: 0, reps: 12, isCompleted: false }) },
    ] as Omit<ExerciseLog, 'id'>[]
  },
  {
    id: 'day-4',
    name: 'Day 4 – Lower + Conditioning',
    description: 'Leg volume mixed with cardio conditioning.',
    exercises: [
      { name: 'Front Squat', type: 'strength', sets: Array(4).fill({ weight: 0, reps: 8, isCompleted: false }) },
      { name: 'Walking Lunges', type: 'strength', sets: Array(3).fill({ weight: 0, reps: 12, isCompleted: false }) },
      { name: 'Romanian Deadlift', type: 'strength', sets: Array(3).fill({ weight: 0, reps: 10, isCompleted: false }) },
      { name: 'Leg Curl', type: 'strength', sets: Array(3).fill({ weight: 0, reps: 12, isCompleted: false }) },
      { name: 'Incline Walk', type: 'conditioning', sets: [{ duration: 1200, incline: 10, isCompleted: false }] }, // 20 mins
    ] as Omit<ExerciseLog, 'id'>[]
  }
];