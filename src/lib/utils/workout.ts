import { db } from '@/lib/db';
import { WORKOUT_PLAN } from '@/lib/workout-plan';

export async function getPrefilledWorkout(dayPlan: typeof WORKOUT_PLAN[0]) {
  // Find the most recent workout of the same day type
  const lastWorkoutArray = await db.workouts
    .where('day')
    .equals(dayPlan.name)
    .reverse()
    .sortBy('date');

  const lastWorkout = lastWorkoutArray[0];

  if (!lastWorkout) {
    return dayPlan; // No previous workout, return template as is
  }

  // Pre-fill the sets based on the last workout
  const prefilledExercises = dayPlan.exercises.map(templateEx => {
    const lastEx = lastWorkout.exercises.find(e => e.name === templateEx.name);

    if (!lastEx || lastEx.sets.length === 0) {
      return templateEx;
    }

    // Use sets from the last workout, but mark them as not completed
    const prefilledSets = lastEx.sets.map(lastSet => ({
      ...lastSet,
      id: crypto.randomUUID(), // Needs new IDs
      isCompleted: false
    }));

    return {
      ...templateEx,
      sets: prefilledSets
    };
  });

  return {
    ...dayPlan,
    exercises: prefilledExercises
  };
}