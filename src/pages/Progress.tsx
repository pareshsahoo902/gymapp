import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, isSameWeek } from 'date-fns';
import { getBest1RM } from '@/lib/utils/calculations';
import { useStore } from '@/store';
import { Trophy, TrendingUp, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { ExerciseHistory } from '@/components/progress/ExerciseHistory';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 rounded-[24px] bg-card/60 border border-white/5 shadow-soft mb-4 backdrop-blur-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">{exerciseName} Est. 1RM</h3>
        <TrendingUp className="w-5 h-5 text-analytics" />
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id={`gradient-${exerciseName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--analytics))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--analytics))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
            />
            <Line
              type="monotone"
              dataKey="rm"
              stroke="hsl(var(--analytics))"
              strokeWidth={4}
              dot={{ r: 0 }}
              activeDot={{ r: 6, fill: 'hsl(var(--analytics))', stroke: 'hsl(var(--background))', strokeWidth: 3 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
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
    }, [] as { name: string, sets: number }[])
    .sort((a, b) => b.sets - a.sets);

  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 rounded-[24px] bg-card/60 border border-white/5 shadow-soft mb-6 backdrop-blur-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Weekly Volume</h3>
        <Activity className="w-5 h-5 text-primary" />
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 50, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            />
            <Bar dataKey="sets" radius={[0, 8, 8, 0]} barSize={24} animationDuration={1500}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function Progress() {
  const prs = useLiveQuery(() => db.prs.orderBy('date').reverse().toArray()) || [];
  const workouts = useLiveQuery(() => db.workouts.toArray()) || [];
  const { unit } = useStore();
  const [activeTab, setActiveTab] = useState<'trends' | 'history'>('trends');

  const majorExercises = ['Bench Press', 'Squat', 'Romanian Deadlift', 'Overhead Press'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // Top Cards Data
    // Simplified for UI
  const totalVolume = workouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => exAcc + ex.sets.filter(s=>s.isCompleted).reduce((sAcc, s) => sAcc + ((s.weight||0) * (s.reps||0)),0), 0), 0);
  const consistency = 85; // Mock percentage

  return (
    <motion.div
      className="space-y-6 pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <h1 className="text-4xl font-bold tracking-tight">Progress</h1>

      <div className="flex bg-secondary/50 p-1 rounded-xl backdrop-blur-md">
        <button
          onClick={() => setActiveTab('trends')}
          className={clsx("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", activeTab === 'trends' ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={clsx("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all", activeTab === 'history' ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 pt-4"
          >
            {/* Top Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-[20px] bg-analytics/10 border border-analytics/20 shadow-soft">
                <div className="text-analytics mb-2"><Activity className="w-5 h-5" /></div>
                <div className="text-2xl font-bold text-analytics">{consistency}%</div>
                <div className="text-xs font-medium text-analytics/80">Consistency</div>
              </div>
              <div className="p-5 rounded-[20px] bg-achievement/10 border border-achievement/20 shadow-soft">
                <div className="text-achievement mb-2"><Trophy className="w-5 h-5" /></div>
                <div className="text-2xl font-bold text-achievement">{totalVolume > 1000 ? `${(totalVolume/1000).toFixed(1)}k` : totalVolume}</div>
                <div className="text-xs font-medium text-achievement/80">Est. Volume ({unit})</div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-achievement" /> Recent PRs
              </h2>
              {prs.length === 0 ? (
                <div className="p-8 rounded-[24px] border border-dashed border-white/10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">No Records Yet</h3>
                  <p className="text-muted-foreground text-sm">Keep pushing! Your PRs will appear here as you progress.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {prs.slice(0, 4).map(pr => (
                    <motion.div
                      key={pr.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-[20px] bg-gradient-to-r from-achievement/10 to-transparent border border-achievement/20 shadow-soft flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-achievement/20 flex items-center justify-center text-2xl">
                          🏆
                        </div>
                        <div>
                          <p className="font-bold text-lg">{pr.exercise}</p>
                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" /> {format(new Date(pr.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-2xl text-achievement">
                          {pr.value}<span className="text-sm font-bold opacity-70 ml-1">{unit}</span>
                        </p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-achievement/70">
                          {pr.type === 'estimated_1rm' ? 'Est. 1RM' : pr.type === 'max_weight' ? 'Max Weight' : 'Volume'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <MuscleGroupAnalytics />
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-bold mb-6">Strength Trends</h2>
              {majorExercises.map(ex => (
                <ExerciseProgressChart key={ex} exerciseName={ex} />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pt-4"
          >
            <ExerciseHistory />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}