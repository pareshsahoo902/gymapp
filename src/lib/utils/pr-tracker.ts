import { calculate1RM, getMaxWeight } from '@/lib/utils/calculations';
import { db, Workout } from '@/lib/db';

export async function checkAndSavePRs(workout: Workout) {
  const date = new Date().toISOString();

  for (const ex of workout.exercises) {
    if (ex.type !== 'strength') continue;

    // Check Max Weight
    const currentMaxWeight = getMaxWeight(ex);
    if (currentMaxWeight > 0) {
      const existingPrs = await db.prs.where({ exercise: ex.name, type: 'max_weight' }).toArray();
      const highestExisting = existingPrs.length ? Math.max(...existingPrs.map(p => p.value)) : 0;

      if (currentMaxWeight > highestExisting) {
        await db.prs.add({
          exercise: ex.name,
          type: 'max_weight',
          value: currentMaxWeight,
          date
        });
      }
    }

    // Check Est 1RM
    const current1RM = ex.sets
      .filter(s => s.isCompleted && s.weight && s.reps)
      .map(s => calculate1RM(s.weight || 0, s.reps || 0))
      .reduce((a, b) => Math.max(a, b), 0);

    if (current1RM > 0) {
      const existing1RM = await db.prs.where({ exercise: ex.name, type: 'estimated_1rm' }).toArray();
      const highest1RM = existing1RM.length ? Math.max(...existing1RM.map(p => p.value)) : 0;

      if (current1RM > highest1RM) {
        await db.prs.add({
          exercise: ex.name,
          type: 'estimated_1rm',
          value: current1RM,
          date
        });
      }
    }
  }
}