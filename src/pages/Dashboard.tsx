import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { WeeklyWorkoutsChart } from '@/components/dashboard/WeeklyWorkoutsChart';
import { BodyWeightChart } from '@/components/dashboard/BodyWeightChart';
import { Trophy, Flame, Dumbbell, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const workouts = useLiveQuery(() => db.workouts.toArray());
  const prs = useLiveQuery(() => db.prs.toArray());
  const latestWeight = useLiveQuery(() => db.bodyweights.orderBy('date').last());

  const workoutCount = workouts?.length || 0;
  const prCount = prs?.length || 0;

  const calculateStreak = () => {
    if (!workouts || workouts.length === 0) return 0;

    // Sort workouts from newest to oldest
    const sortedDates = [...new Set(workouts.map(w => w.date.split('T')[0]))].sort((a, b) => b.localeCompare(a));

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    const todayStr = format(currentDate, 'yyyy-MM-dd');
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = format(currentDate, 'yyyy-MM-dd');

    // If no workout today or yesterday, streak is broken
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let dateToCheck = new Date(sortedDates[0]);
    dateToCheck.setHours(0,0,0,0);

    for (let i = 0; i < sortedDates.length; i++) {
      const workoutDateStr = sortedDates[i];
      const expectedDateStr = format(dateToCheck, 'yyyy-MM-dd');

      if (workoutDateStr === expectedDateStr) {
        streak++;
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }

    return streak;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-card border shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <span className="text-2xl font-bold">{calculateStreak()} Days</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">PRs Broken</span>
          </div>
          <span className="text-2xl font-bold">{prCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Total Workouts</span>
          </div>
          <span className="text-2xl font-bold">{workoutCount}</span>
        </div>

        <div onClick={() => window.location.href = '#/bodyweight'} className="p-4 rounded-2xl bg-card border shadow-sm flex flex-col cursor-pointer hover:border-primary transition-colors">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Current Weight</span>
          </div>
          <span className="text-2xl font-bold">
            {latestWeight ? `${latestWeight.weight}` : '--'}
          </span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-card border shadow-sm">
        <h3 className="font-semibold text-lg">Weekly Activity</h3>
        <WeeklyWorkoutsChart />
      </div>

      <div onClick={() => window.location.href = '#/bodyweight'} className="p-5 rounded-2xl bg-card border shadow-sm cursor-pointer hover:border-primary transition-colors">
        <h3 className="font-semibold text-lg">Body Weight Trend</h3>
        <BodyWeightChart />
      </div>
    </div>
  );
}