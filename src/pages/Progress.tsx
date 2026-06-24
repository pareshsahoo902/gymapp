import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, isSameWeek } from 'date-fns';
import { getBest1RM } from '@/lib/utils/calculations';
import { useStore } from '@/store';
import { Trophy } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { ExerciseHistory } from '@/components/progress/ExerciseHistory';

function ExerciseProgressChart({ exerciseName }: { exerciseName: string }) {
  const workouts = useLiveQuery(() => db.workouts.toArray()) || [];

  const data = workouts
    .filter(w => w.exercises.some(ex => ex.name === exerciseName && ex.sets.some(s => s.isCompleted)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(w => {
      const ex = w.exercises.find(e => e.name === exerciseName)!;
      return {
        date: format(new Date(w.date), 'MMM dd'),
        rm: getBest1RM(ex)
      };
    })
    .filter(d => d.rm > 0);

  if (data.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-card border shadow-sm mb-4">
      <h3 className="font-semibold text-lg mb-4">{exerciseName} Est. 1RM</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey="rm" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MuscleGroupAnalytics() {
  const workouts = useLiveQuery(() => db.workouts.toArray()) || [];

  const muscleGroups: Record<string, string[]> = {
    'Chest': ['Bench Press', 'Incline Dumbbell Press'],
    'Back': ['Pullups', 'Barbell Row', 'Seated Row', 'Lat Pulldown'],
    'Legs': ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise', 'Front Squat', 'Walking Lunges', 'Leg Curl'],
    'Shoulders': ['Overhead Press', 'Lateral Raise'],
    'Arms': ['Biceps Curl', 'Tricep Pushdown']
  };

  const getMuscleGroup = (exerciseName: string) => {
    for (const [group, exercises] of Object.entries(muscleGroups)) {
      if (exercises.includes(exerciseName)) return group;
    }
    return 'Other';
  };

  const now = new Date();

  // Calculate sets for the current week
  const data = workouts
    .filter(w => isSameWeek(new Date(w.date), now, { weekStartsOn: 1 }))
    .reduce((acc, workout) => {
      workout.exercises.forEach(ex => {
        const group = getMuscleGroup(ex.name);
        if (group === 'Other') return;
        const completedSets = ex.sets.filter(s => s.isCompleted).length;

        const existing = acc.find(a => a.name === group);
        if (existing) {
          existing.sets += completedSets;
        } else {
          acc.push({ name: group, sets: completedSets });
        }
      });
      return acc;
    }, [] as { name: string, sets: number }[]);

  if (data.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-card border shadow-sm mb-6">
      <h3 className="font-semibold text-lg mb-4">Sets this Week (By Muscle Group)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            />
            <Bar dataKey="sets" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Progress() {
  const prs = useLiveQuery(() => db.prs.orderBy('date').reverse().toArray()) || [];
  const { unit } = useStore();
  const [activeTab, setActiveTab] = useState<'trends' | 'history'>('trends');

  const majorExercises = ['Bench Press', 'Squat', 'Romanian Deadlift', 'Overhead Press'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      <h1 className="text-3xl font-bold tracking-tight">Progress</h1>

      <div className="flex bg-secondary p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('trends')}
          className={clsx("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", activeTab === 'trends' ? "bg-background shadow" : "text-muted-foreground hover:text-foreground")}
        >
          Trends & Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={clsx("flex-1 py-2 text-sm font-medium rounded-lg transition-colors", activeTab === 'history' ? "bg-background shadow" : "text-muted-foreground hover:text-foreground")}
        >
          Exercise History
        </button>
      </div>

      {activeTab === 'trends' && (
        <>
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center"><Trophy className="w-5 h-5 text-yellow-500 mr-2" /> Recent PRs</h2>
            {prs.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm">
                Complete workouts to start tracking Personal Records!
              </div>
            ) : (
              <div className="grid gap-3">
                {prs.slice(0, 5).map(pr => (
                  <div key={pr.id} className="p-4 rounded-xl bg-card border shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{pr.exercise}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(pr.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {pr.value} {unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pr.type === 'estimated_1rm' ? 'Est. 1RM' : pr.type === 'max_weight' ? 'Max Weight' : 'Volume'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            <MuscleGroupAnalytics />
          </div>

          <div className="pt-2">
            <h2 className="text-xl font-bold mb-4">Strength Trends</h2>
            {majorExercises.map(ex => (
              <ExerciseProgressChart key={ex} exerciseName={ex} />
            ))}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <ExerciseHistory />
      )}

    </div>
  );
}