import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';

export function BodyWeightChart() {
  const bodyweights = useLiveQuery(() =>
    db.bodyweights.orderBy('date').reverse().limit(14).toArray()
  ) || [];

  const data = bodyweights.reverse().map(bw => ({
    date: format(new Date(bw.date), 'MMM dd'),
    weight: bw.weight
  }));

  if (data.length === 0) {
    return (
      <div className="h-48 w-full mt-4 flex items-center justify-center text-muted-foreground text-sm">
        No body weight data yet.
      </div>
    );
  }

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
          />
          <Line type="monotone" dataKey="weight" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}