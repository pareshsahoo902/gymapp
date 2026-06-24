import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ExerciseLog, type Workout } from '@/lib/db';

export type UnitType = 'kg' | 'lbs';

interface SettingsState {
  unit: UnitType;
  setUnit: (unit: UnitType) => void;
}

interface ActiveWorkoutState {
  activeWorkout: Workout | null;
  workoutStartTime: number | null;
  restTimer: number | null; // Added for Feature 10
  startWorkout: (workout: Omit<Workout, 'id' | 'date' | 'duration' | 'exercises'> & { exercises: Omit<ExerciseLog, 'id'>[] }) => void;
  updateExercise: (exerciseId: string, updater: (exercise: ExerciseLog) => ExerciseLog) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  startRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
}

interface AppState extends SettingsState, ActiveWorkoutState {}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      unit: 'kg',
      setUnit: (unit) => set({ unit }),

      // Active Workout
      activeWorkout: null,
      workoutStartTime: null,
      restTimer: null,

      startWorkout: (workoutTemplate) => {
        const id = crypto.randomUUID();
        const date = new Date().toISOString();

        const exercisesWithIds: ExerciseLog[] = workoutTemplate.exercises.map(ex => ({
          ...ex,
          id: crypto.randomUUID(),
          sets: ex.sets.map(s => ({ ...s, id: crypto.randomUUID() }))
        }));

        const newWorkout: Workout = {
          id,
          date,
          day: workoutTemplate.day,
          duration: 0,
          exercises: exercisesWithIds
        };

        set({
          activeWorkout: newWorkout,
          workoutStartTime: Date.now(),
          restTimer: null
        });
      },

      updateExercise: (exerciseId, updater) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map(ex =>
              ex.id === exerciseId ? updater(ex) : ex
            )
          }
        });
      },

      finishWorkout: () => {
        set({ activeWorkout: null, workoutStartTime: null, restTimer: null });
      },

      cancelWorkout: () => {
        set({ activeWorkout: null, workoutStartTime: null, restTimer: null });
      },

      startRestTimer: (seconds) => {
        set({ restTimer: Date.now() + seconds * 1000 });
      },

      clearRestTimer: () => {
        set({ restTimer: null });
      }
    }),
    {
      name: 'gym-bud-storage',
      partialize: (state) => ({
        unit: state.unit,
        activeWorkout: state.activeWorkout,
        workoutStartTime: state.workoutStartTime,
        restTimer: state.restTimer
      }),
    }
  )
);