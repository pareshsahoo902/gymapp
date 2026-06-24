import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { calculateVolume } from '@/lib/utils/calculations';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function ExerciseHistory() {
  const workouts = useLiveQuery(() => db.workouts.orderBy('date').reverse().toArray()) || [];
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Group all sessions by exercise name
  const historyByExercise: Record<string, { date: string; volume: number; sets: any[] }[]> = {};

  workouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      if (!historyByExercise[ex.name]) {
        historyByExercise[ex.name] = [];
      }
      historyByExercise[ex.name].push({
        date: workout.date,
        volume: calculateVolume(ex),
        sets: ex.sets
      });
    });
  });

  const exercises = Object.keys(historyByExercise).sort();

  if (exercises.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm py-10">
        <p>No exercise history yet.</p>
        <p className="mt-2 opacity-75">Complete workouts to see your past sessions here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-xl font-bold mb-4">Exercise History</h2>
      {exercises.map(exerciseName => {
        const isExpanded = expandedExercise === exerciseName;
        const sessions = historyByExercise[exerciseName];

        return (
          <div key={exerciseName} className="rounded-2xl bg-card border shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedExercise(isExpanded ? null : exerciseName)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
            >
              <div>
                <h3 className="font-bold text-lg">{exerciseName}</h3>
                <p className="text-sm text-muted-foreground">{sessions.length} sessions logged</p>
              </div>
              {isExpanded ? <ChevronUp className="text-muted-foreground" /> : <ChevronDown className="text-muted-foreground" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                {sessions.map((session, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">{format(new Date(session.date), 'MMM dd, yyyy')}</span>
                      <span className="text-xs font-mono text-muted-foreground">Vol: {session.volume}</span>
                    </div>
                    <div className="space-y-1">
                      {session.sets.map((set, j) => (
                        <div key={j} className="text-xs flex justify-between">
                          <span className="text-muted-foreground">Set {j + 1}</span>
                          <span className="font-medium">
                            {set.isCompleted ? (
                              set.weight ? `${set.weight} × ${set.reps}` :
                              set.duration ? `${set.duration}s` : `${set.reps} reps`
                            ) : (
                              <span className="opacity-50 line-through">Skipped</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}