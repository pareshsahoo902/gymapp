import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { WeeklyWorkoutsChart } from '@/components/dashboard/WeeklyWorkoutsChart';
import { BodyWeightChart } from '@/components/dashboard/BodyWeightChart';
import { Trophy, Flame, Activity, Play, ChevronRight } from 'lucide-react';
import { format, isSameWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const workouts = useLiveQuery(() => db.workouts.toArray());
  const prs = useLiveQuery(() => db.prs.toArray());
  const latestWeight = useLiveQuery(() => db.bodyweights.orderBy('date').last());


  const prCount = prs?.length || 0;

  const calculateStreak = () => {
    if (!workouts || workouts.length === 0) return 0;

    const sortedDates = [...new Set(workouts.map(w => w.date.split('T')[0]))].sort((a, b) => b.localeCompare(a));

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    const todayStr = format(currentDate, 'yyyy-MM-dd');
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = format(currentDate, 'yyyy-MM-dd');

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
        break;
      }
    }

    return streak;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 18) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  const calculateWeeklyProgress = () => {
    if (!workouts) return { completed: 0, total: 4 }; // Assuming 4 workouts/week goal
    const today = new Date();
    const currentWeekWorkouts = workouts.filter(w => isSameWeek(new Date(w.date), today, { weekStartsOn: 1 }));
    return { completed: currentWeekWorkouts.length, total: 4 };
  };

  const weeklyProgress = calculateWeeklyProgress();
  const streak = calculateStreak();

  // Simple logic to guess today's workout based on plan length vs history
  const getTodaysWorkoutName = () => {
    return 'Next Scheduled Workout';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } as any }
  };

  return (
    <motion.div
      className="space-y-8 pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <h2 className="text-muted-foreground text-lg font-medium">{getGreeting()}</h2>
          <h1 className="text-4xl font-bold tracking-tight">Athlete</h1>
        </div>

        <div className="bg-card/40 border border-white/5 rounded-[24px] p-6 shadow-soft backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="font-semibold text-lg">Week Progress</span>
              <span className="text-sm text-muted-foreground">{weeklyProgress.completed} / {weeklyProgress.total} workouts</span>
            </div>
            <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((weeklyProgress.completed / weeklyProgress.total) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              />
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-sm font-medium">
              <Flame className="w-4 h-4" />
              {streak} Day Streak
            </div>
          </div>

          <div className="bg-background/50 rounded-2xl p-4 border border-white/5">
            <div className="text-sm text-muted-foreground mb-1">Today's Focus</div>
            <div className="font-bold text-xl mb-4">{getTodaysWorkoutName()}</div>
            <Link to="/workout" className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-glow hover:scale-[1.02] transition-transform active:scale-[0.98]">
              <Play className="w-5 h-5 fill-current" />
              Start Workout
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ y: -2 }} className="p-5 rounded-[20px] bg-card/60 border border-white/5 shadow-soft flex flex-col justify-between h-32 group">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="text-sm font-medium">PRs Broken</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold">{prCount}</span>
            <span className="text-xs text-muted-foreground mb-1">All time</span>
          </div>
        </motion.div>

        <Link to="/bodyweight">
          <motion.div whileHover={{ y: -2 }} className="p-5 rounded-[20px] bg-card/60 border border-white/5 shadow-soft flex flex-col justify-between h-32 cursor-pointer group">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium">Weight</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">
                {latestWeight ? `${latestWeight.weight}` : '--'}
              </span>
              <span className="text-xs text-muted-foreground mb-1">kg</span>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        <div className="p-6 rounded-[24px] bg-card/40 border border-white/5 shadow-soft">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Weekly Activity</h3>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="h-[200px]">
             <WeeklyWorkoutsChart />
          </div>
        </div>

        <Link to="/bodyweight" className="block">
          <div className="p-6 rounded-[24px] bg-card/40 border border-white/5 shadow-soft hover:bg-card/60 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Body Weight Trend</h3>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="h-[200px]">
              <BodyWeightChart />
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}