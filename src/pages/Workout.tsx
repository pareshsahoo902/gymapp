import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { db } from '@/lib/db';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Plus, Timer, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { ExerciseLog, SetLog } from '@/lib/db';
import { checkAndSavePRs } from '@/lib/utils/pr-tracker';

function ExerciseCard({ exercise, unit }: { exercise: ExerciseLog, unit: string }) {
  const { updateExercise, startRestTimer } = useStore();

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    updateExercise(exercise.id, (ex) => ({
      ...ex,
      sets: [...ex.sets, {
        id: crypto.randomUUID(),
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
        duration: lastSet?.duration || 0,
        distance: lastSet?.distance || 0,
        isCompleted: false
      }]
    }));
  };

  const removeSet = (setId: string) => {
    updateExercise(exercise.id, (ex) => ({
      ...ex,
      sets: ex.sets.filter(s => s.id !== setId)
    }));
  };

  const updateSet = (setId: string, field: keyof SetLog, value: number | boolean) => {
    updateExercise(exercise.id, (ex) => {
      const newSets = ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s);

      // If a set was just checked as completed, trigger the rest timer
      if (field === 'isCompleted' && value === true) {
        const restDuration = ex.type === 'strength' ? 180 : 90;
        startRestTimer(restDuration);
      }

      return { ...ex, sets: newSets };
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-card border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-primary">{exercise.name}</h3>
      </div>

      <div className="space-y-3">
        {exercise.sets.map((set, index) => (
          <div
            key={set.id}
            className={clsx(
              "grid grid-cols-[auto_1fr_1fr_auto_auto] gap-2 items-center p-2 rounded-lg transition-colors",
              set.isCompleted ? "bg-primary/10" : "bg-secondary/50"
            )}
          >
            <div className="text-sm font-medium w-6 text-center text-muted-foreground">{index + 1}</div>

            {exercise.type === 'conditioning' ? (
              <>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={set.duration || ''}
                    onChange={(e) => updateSet(set.id, 'duration', Number(e.target.value))}
                    className="w-full bg-transparent text-center font-semibold text-lg focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground">s</span>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={set.distance || ''}
                    onChange={(e) => updateSet(set.id, 'distance', Number(e.target.value))}
                    className="w-full bg-transparent text-center font-semibold text-lg focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground">km</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-1 relative">
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(set.id, 'weight', Number(e.target.value))}
                    className="w-full bg-background rounded-md text-center py-1 font-semibold text-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0"
                  />
                  {exercise.type !== 'bodyweight' && (
                    <span className="text-xs text-muted-foreground absolute right-2 pointer-events-none">{unit}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(set.id, 'reps', Number(e.target.value))}
                    className="w-full bg-background rounded-md text-center py-1 font-semibold text-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground absolute right-2 pointer-events-none hidden">reps</span>
                </div>
              </>
            )}

            <button onClick={() => updateSet(set.id, 'isCompleted', !set.isCompleted)} className="px-2">
              <CheckCircle2 className={clsx("w-6 h-6", set.isCompleted ? "text-primary" : "text-muted-foreground/30")} />
            </button>

            <button onClick={() => removeSet(set.id)} className="px-2">
              <Trash2 className="w-4 h-4 text-destructive/50 hover:text-destructive" />
            </button>
          </div>
        ))}

        <button
          onClick={addSet}
          className="w-full py-2 mt-2 border border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Set
        </button>
      </div>
    </div>
  );
}

export default function Workout() {
  const { activeWorkout, workoutStartTime, finishWorkout, cancelWorkout, unit, clearRestTimer } = useStore();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!workoutStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Timer className="w-16 h-16 text-muted" />
        <h2 className="text-xl font-bold">No Active Workout</h2>
        <p className="text-muted-foreground">Go to the Plan tab to start a session.</p>
        <button onClick={() => navigate('/plan')} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium mt-4">
          View Plan
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return `${m}:${s}`;
  };

  const handleFinish = async () => {
    const hasCompletedSets = activeWorkout.exercises.some(ex => ex.sets.some(s => s.isCompleted));

    if (!hasCompletedSets) {
      const confirm = window.confirm('No sets completed. Cancel workout?');
      if (confirm) {
        cancelWorkout();
        clearRestTimer();
        navigate('/');
      }
      return;
    }

    const duration = Math.floor((Date.now() - (workoutStartTime || Date.now())) / 1000);
    const finalWorkout = {
      ...activeWorkout,
      duration
    };

    await db.workouts.add(finalWorkout);
    await checkAndSavePRs(finalWorkout);

    finishWorkout();
    clearRestTimer();
    navigate('/progress');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 flex items-center justify-between border-b border-border/50">
        <div>
          <h1 className="font-bold text-lg">{activeWorkout.day}</h1>
          <div className="text-primary font-mono font-medium flex items-center">
            <Timer className="w-4 h-4 mr-1" /> {formatTime(elapsed)}
          </div>
        </div>
        <button
          onClick={handleFinish}
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg font-bold text-sm"
        >
          Finish
        </button>
      </div>

      <div className="space-y-6">
        {activeWorkout.exercises.map(exercise => (
          <ExerciseCard key={exercise.id} exercise={exercise} unit={unit} />
        ))}
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={() => {
            if(window.confirm('Cancel this workout? No data will be saved.')) {
              cancelWorkout();
              clearRestTimer();
              navigate('/plan');
            }
          }}
          className="text-destructive font-medium px-4 py-2"
        >
          Cancel Workout
        </button>
      </div>
    </div>
  );
}