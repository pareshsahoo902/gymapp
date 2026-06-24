import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from 'date-fns';

export function WeeklyWorkoutsChart() {
  const workouts = useLiveQuery(() => db.workouts.toArray()) || [];

  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start, end });

  const data = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const workoutOnDay = workouts.find(w => w.date.startsWith(dayStr));

    return {
      name: format(day, 'EEE'),
      completed: workoutOnDay ? 1 : 0,
    };
  });

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            formatter={(value: any) => [value === 1 ? 'Yes' : 'No', 'Completed']}
          />
          <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}