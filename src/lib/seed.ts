import { db } from './db';
import { calculate1RM } from './utils/calculations';
import { WORKOUT_PLAN } from './workout-plan';

export async function seedDatabase() {
  const workoutCount = await db.workouts.count();
  if (workoutCount > 0) return; // Only seed if empty

  const now = new Date();

  // Seed past 14 days of workouts
  for (let i = 14; i >= 0; i--) {
    // Workout every other day
    if (i % 2 !== 0) continue;

    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(17, 30, 0, 0); // 5:30 PM workouts

    const planIndex = (14 - i) % 4; // Cycle through the 4 days
    const template = WORKOUT_PLAN[planIndex];

    const exercises = template.exercises.map(ex => {
      // Simulate progress over time (earlier workouts have lower weights)
      const progressFactor = 1 - (i / 14) * 0.1; // 10% weaker 14 days ago

      return {
        ...ex,
        id: crypto.randomUUID(),
        sets: ex.sets.map((set, setIndex) => {
          let weight = 0;
          let reps = set.reps || 0;

          if (ex.type === 'strength') {
            // Base weight estimates based on exercise
            const baseWeight =
              ex.name.includes('Squat') ? 100 :
              ex.name.includes('Deadlift') ? 120 :
              ex.name.includes('Bench Press') ? 80 :
              ex.name.includes('Overhead Press') ? 50 : 20;

            weight = Math.round((baseWeight * progressFactor) / 2.5) * 2.5; // Round to nearest 2.5kg

            // Maybe miss a rep on the last set
            if (setIndex === ex.sets.length - 1 && Math.random() > 0.5) {
              reps = Math.max(1, reps - 1);
            }
          }

          return {
            ...set,
            id: crypto.randomUUID(),
            weight: weight,
            reps: reps,
            isCompleted: true // All sets completed in history
          };
        })
      };
    });

    const workout = {
      id: crypto.randomUUID(),
      date: date.toISOString(),
      day: template.name,
      duration: 3600 + Math.random() * 1800, // 60-90 mins
      exercises
    };

    await db.workouts.add(workout);

    // Seed PRs based on this workout
    for (const ex of workout.exercises) {
        if (ex.type !== 'strength') continue;

        // Check Max Weight
        const weights = ex.sets.map(s => s.weight || 0);
        const currentMaxWeight = Math.max(...weights);
        if (currentMaxWeight > 0) {
            const existingPrs = await db.prs.where({ exercise: ex.name, type: 'max_weight' }).toArray();
            const highestExisting = existingPrs.length ? Math.max(...existingPrs.map(p => p.value)) : 0;

            if (currentMaxWeight > highestExisting) {
                await db.prs.add({ exercise: ex.name, type: 'max_weight', value: currentMaxWeight, date: date.toISOString() });
            }
        }

        // Check Est 1RM
        const rms = ex.sets.map(s => calculate1RM(s.weight || 0, s.reps || 0));
        const current1RM = Math.max(...rms);

        if (current1RM > 0) {
            const existing1RM = await db.prs.where({ exercise: ex.name, type: 'estimated_1rm' }).toArray();
            const highest1RM = existing1RM.length ? Math.max(...existing1RM.map(p => p.value)) : 0;

            if (current1RM > highest1RM) {
                await db.prs.add({ exercise: ex.name, type: 'estimated_1rm', value: current1RM, date: date.toISOString() });
            }
        }
    }
  }

  // Seed body weight (last 30 days)
  let currentWeight = 85.5;
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(8, 0, 0, 0);

    // Random fluctuation + slight downward trend
    currentWeight = currentWeight + (Math.random() * 0.6 - 0.35);

    await db.bodyweights.add({
      date: date.toISOString().split('T')[0],
      weight: Math.round(currentWeight * 10) / 10
    });
  }
}