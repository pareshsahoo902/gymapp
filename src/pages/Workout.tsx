import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { db } from '@/lib/db';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Plus, Timer, Trash2, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { ExerciseLog, SetLog } from '@/lib/db';
import { checkAndSavePRs } from '@/lib/utils/pr-tracker';
import { motion, AnimatePresence } from 'framer-motion';

function StepperInput({ value, onChange, label, step = 1, min = 0 }: { value: number, onChange: (val: number) => void, label: string, step?: number, min?: number }) {
  const handleDec = () => onChange(Math.max(min, (value || 0) - step));
  const handleInc = () => onChange((value || 0) + step);

  return (
    <div className="flex items-center bg-background rounded-xl border border-white/10 overflow-hidden shadow-inner h-12 w-full max-w-[140px]">
      <button onClick={handleDec} className="w-10 h-full flex items-center justify-center bg-secondary/30 active:bg-secondary/50 transition-colors">
        <Minus className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex-1 relative flex items-center justify-center h-full">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full text-center font-bold text-xl bg-transparent focus:outline-none z-10 px-1"
          placeholder="0"
        />
        {label && <span className="absolute bottom-1 right-2 text-[10px] font-medium text-muted-foreground pointer-events-none">{label}</span>}
      </div>
      <button onClick={handleInc} className="w-10 h-full flex items-center justify-center bg-secondary/30 active:bg-secondary/50 transition-colors">
        <Plus className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function ExerciseCard({ exercise, unit, isExpanded, onToggle }: { exercise: ExerciseLog, unit: string, isExpanded: boolean, onToggle: () => void }) {
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
        // Haptic feedback could go here if using Capacitor/PWA plugins
        if (navigator.vibrate) navigator.vibrate(50);
      }

      return { ...ex, sets: newSets };
    });
  };

  return (
    <motion.div layout className="p-5 rounded-[24px] bg-card/60 border border-white/5 shadow-soft backdrop-blur-md overflow-hidden">
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={onToggle}
      >
        <div>
          <h3 className="font-bold text-xl text-foreground">{exercise.name}</h3>
          <div className="flex gap-4 mt-1 text-xs text-muted-foreground font-medium">
            <span>Target: 8-12 Reps</span>
            <span>Rest: 90s</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6"
          >
            <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 mb-2 px-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Set</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">{exercise.type === 'conditioning' ? 'Time' : unit}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">{exercise.type === 'conditioning' ? 'Dist' : 'Reps'}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">Done</div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {exercise.sets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={clsx(
                      "relative grid grid-cols-[30px_1fr_1fr_40px] gap-3 items-center p-2 rounded-[16px] transition-colors overflow-hidden group",
                      set.isCompleted ? "bg-success/15 border border-success/30" : "bg-background/50 border border-white/5"
                    )}
                  >
                    {/* Animated background fill for completed sets */}
                    {set.isCompleted && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="absolute inset-0 bg-success/10 pointer-events-none"
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                      <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                    </div>

                    <div className="relative z-10 flex justify-center w-full">
                      {exercise.type === 'conditioning' ? (
                        <StepperInput value={set.duration || 0} onChange={(v) => updateSet(set.id, 'duration', v)} label="s" step={10} />
                      ) : (
                        <StepperInput value={set.weight || 0} onChange={(v) => updateSet(set.id, 'weight', v)} label="" step={2.5} />
                      )}
                    </div>

                    <div className="relative z-10 flex justify-center w-full">
                      {exercise.type === 'conditioning' ? (
                        <StepperInput value={set.distance || 0} onChange={(v) => updateSet(set.id, 'distance', v)} label="km" step={0.1} />
                      ) : (
                        <StepperInput value={set.reps || 0} onChange={(v) => updateSet(set.id, 'reps', v)} label="" step={1} />
                      )}
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <button
                        onClick={() => updateSet(set.id, 'isCompleted', !set.isCompleted)}
                        className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95",
                          set.isCompleted ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                        )}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Desktop/Swipe delete could go here, for now keeping small icon on hover/focus */}
                    {!set.isCompleted && (
                       <button onClick={() => removeSet(set.id)} className="absolute -left-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 z-20">
                          <Trash2 className="w-4 h-4 text-destructive" />
                       </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={addSet}
                className="w-full py-3 mt-4 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Set
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Workout() {
  const { activeWorkout, workoutStartTime, finishWorkout, cancelWorkout, unit, clearRestTimer } = useStore();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    if (activeWorkout && activeWorkout.exercises.length > 0 && !expandedExerciseId) {
      setExpandedExerciseId(activeWorkout.exercises[0].id);
    }
  }, [activeWorkout]);

  useEffect(() => {
    if (!workoutStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  if (!activeWorkout) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[70vh] space-y-6 px-4 text-center"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-glow">
          <Timer className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Ready to begin?</h2>
          <p className="text-muted-foreground">Complete your first workout today.<br/>Start building your streak.</p>
        </div>
        <button
          onClick={() => navigate('/plan')}
          className="bg-primary text-primary-foreground w-full max-w-[200px] py-4 rounded-xl font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          View Plan
        </button>
      </motion.div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // Calculate some current stats
  const totalSetsCompleted = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length, 0);
  const totalVolume = activeWorkout.exercises.reduce((acc, ex) => {
    if (ex.type === 'strength') {
      return acc + ex.sets.filter(s => s.isCompleted).reduce((sAcc, set) => sAcc + ((set.weight || 0) * (set.reps || 0)), 0);
    }
    return acc;
  }, 0);

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.28))] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl pb-4 pt-2 -mx-4 px-4 flex flex-col gap-2 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl tracking-tight text-primary">{activeWorkout.day}</h1>
          <button
            onClick={() => {
              if(window.confirm('Cancel this workout? No data will be saved.')) {
                cancelWorkout();
                clearRestTimer();
                navigate('/plan');
              }
            }}
            className="text-muted-foreground hover:text-destructive text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Exercises */}
      <motion.div
        className="flex-1 space-y-4 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {activeWorkout.exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            unit={unit}
            isExpanded={expandedExerciseId === exercise.id}
            onToggle={() => setExpandedExerciseId(expandedExerciseId === exercise.id ? null : exercise.id)}
          />
        ))}
      </motion.div>

      {/* Sticky Bottom Finish Bar */}
      <div className="fixed bottom-24 left-0 right-0 z-30 px-4 max-w-md mx-auto pointer-events-none">
        <div className="glass-panel p-4 rounded-[24px] pointer-events-auto">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="font-mono font-bold">{formatTime(elapsed)}</span>
            </div>
            <div className="text-xs font-medium text-muted-foreground flex gap-3">
               <span>{totalSetsCompleted} Sets</span>
               <span>{totalVolume > 0 && `${totalVolume}${unit} Vol`}</span>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-6 h-6" /> Finish Workout
          </button>
        </div>
      </div>
    </div>
  );
}