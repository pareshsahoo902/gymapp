import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, X } from 'lucide-react';
import { WORKOUT_PLAN } from '@/lib/workout-plan';
import { useStore } from '@/store';
import { getPrefilledWorkout } from '@/lib/utils/workout';

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6 relative">
      <h1 className="text-3xl font-bold tracking-tight">Workout Plan</h1>

      <div className="grid gap-4">
        {WORKOUT_PLAN.map((day) => (
          <div
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className="p-5 rounded-2xl bg-card border shadow-sm flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
          >
            <div>
              <h3 className="font-bold text-lg">{day.name}</h3>
              <p className="text-muted-foreground text-sm">{day.description}</p>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* Modal / Bottom Sheet for Workout Details */}
      {selectedDay && selectedPlan && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-xl relative animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground bg-secondary/50 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-2 pr-10">{selectedPlan.name}</h2>
            <p className="text-muted-foreground mb-6">{selectedPlan.description}</p>

            <div className="space-y-4 mb-8">
              {selectedPlan.exercises.map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0">
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {ex.sets.length} {ex.sets.length === 1 ? 'Set' : 'Sets'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleStartWorkout(selectedPlan)}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Play className="fill-current w-5 h-5" />
              <span>{isLoading ? 'Loading...' : 'Start Workout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}