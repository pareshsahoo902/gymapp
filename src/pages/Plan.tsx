import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, X, Clock, Dumbbell, Star, Flame } from 'lucide-react';
import { WORKOUT_PLAN } from '@/lib/workout-plan';
import { useStore } from '@/store';
import { getPrefilledWorkout } from '@/lib/utils/workout';
import { motion, AnimatePresence } from 'framer-motion';

export default function Plan() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { startWorkout, activeWorkout } = useStore();

  const handleStartWorkout = async (dayPlan: typeof WORKOUT_PLAN[0]) => {
    if (activeWorkout) {
      const confirm = window.confirm('You have an active workout. Discard it and start a new one?');
      if (!confirm) return;
    }

    setIsLoading(true);
    const prefilledPlan = await getPrefilledWorkout(dayPlan);

    startWorkout({
      day: prefilledPlan.name,
      exercises: prefilledPlan.exercises
    });
    navigate('/workout');
  };

  const selectedPlan = WORKOUT_PLAN.find(p => p.id === selectedDay);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } as any }
  };

  const getEstimatedDuration = (exercises: any[]) => {
    return exercises.length * 10;
  };

  const getDifficulty = (index: number) => {
    return Array(5).fill(0).map((_, i) => i < (index % 3) + 3);
  };

  return (
    <motion.div
      className="space-y-6 pb-6 relative"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <h1 className="text-4xl font-bold tracking-tight">Your Plan</h1>

      <div className="grid gap-4">
        {WORKOUT_PLAN.map((day, index) => {
          const estimatedDuration = getEstimatedDuration(day.exercises);
          const isNextWorkout = index === 0;

          return (
            <motion.div
              variants={itemVariants}
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-[24px] border shadow-soft cursor-pointer relative overflow-hidden transition-colors ${
                isNextWorkout
                  ? 'bg-card/80 border-primary/30'
                  : 'bg-card/40 border-white/5 hover:bg-card/60'
              }`}
            >
              {isNextWorkout && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  {isNextWorkout && <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">Next Up</span>}
                  <h3 className="font-bold text-2xl mb-1">{day.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{day.description}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNextWorkout ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-foreground'}`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              <div className="flex gap-3 mt-4 text-xs font-bold text-muted-foreground relative z-10">
                <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border border-white/5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{estimatedDuration} min</span>
                </div>
                <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border border-white/5">
                  <Dumbbell className="w-3.5 h-3.5 text-analytics" />
                  <span>{day.exercises.length} Exercises</span>
                </div>
                <div className="flex items-center gap-0.5 bg-background/50 px-2 py-1 rounded-md border border-white/5">
                   {getDifficulty(index).map((filled, i) => (
                      <Star key={i} className={`w-3 h-3 ${filled ? 'fill-achievement text-achievement' : 'text-muted-foreground/30'}`} />
                   ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Enhanced Bottom Sheet for Workout Details */}
      <AnimatePresence>
        {selectedDay && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col justify-end bg-background/80 backdrop-blur-md"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-t border-white/10 w-full max-w-md mx-auto rounded-t-[32px] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1.5 bg-secondary rounded-full mx-auto mb-6" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2 tracking-tight">{selectedPlan.name}</h2>
                  <p className="text-muted-foreground font-medium">{selectedPlan.description}</p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="bg-secondary/50 hover:bg-secondary p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-secondary/30 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <Clock className="w-5 h-5 text-primary mb-1" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Duration</span>
                  <span className="font-bold">{getEstimatedDuration(selectedPlan.exercises)}m</span>
                </div>
                <div className="flex-1 bg-secondary/30 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <Flame className="w-5 h-5 text-orange-500 mb-1" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Calories</span>
                  <span className="font-bold">~400</span>
                </div>
                <div className="flex-1 bg-secondary/30 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <Dumbbell className="w-5 h-5 text-analytics mb-1" />
                  <span className="text-xs font-bold text-muted-foreground uppercase">Exercises</span>
                  <span className="font-bold">{selectedPlan.exercises.length}</span>
                </div>
              </div>

              <div className="overflow-y-auto pr-2 mb-8 space-y-3 flex-1 scrollbar-hide">
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-card py-2">Movement List</div>
                {selectedPlan.exercises.map((ex, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-white/5">
                    <span className="font-bold">{ex.name}</span>
                    <div className="text-xs font-bold bg-secondary/50 px-2 py-1 rounded-md text-muted-foreground">
                      {ex.sets.length} {ex.sets.length === 1 ? 'Set' : 'Sets'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleStartWorkout(selectedPlan)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-4 rounded-[20px] font-bold text-xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Play className="fill-current w-6 h-6" />
                  <span>{isLoading ? 'Preparing...' : 'Start Workout'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}