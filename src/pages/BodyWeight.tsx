import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { BodyWeightChart } from '@/components/dashboard/BodyWeightChart';
import { Plus, Scale, Trash2 } from 'lucide-react';

export default function BodyWeight() {
  const [weightInput, setWeightInput] = useState('');
  const bodyweights = useLiveQuery(() => db.bodyweights.orderBy('date').reverse().limit(30).toArray()) || [];

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;

    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) return;

    await db.bodyweights.add({
      date: format(new Date(), 'yyyy-MM-dd'),
      weight
    });

    setWeightInput('');
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await db.bodyweights.delete(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      <h1 className="text-3xl font-bold tracking-tight">Body Weight</h1>

      <form onSubmit={handleAddWeight} className="flex gap-2 p-5 rounded-2xl bg-card border shadow-sm">
        <div className="relative flex-1">
          <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="number"
            step="0.1"
            placeholder="Log today's weight"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button type="submit" className="bg-primary text-primary-foreground px-4 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="p-5 rounded-2xl bg-card border shadow-sm">
        <h3 className="font-semibold text-lg">Trend (Last 14 Days)</h3>
        <BodyWeightChart />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">History</h3>
        {bodyweights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No weigh-ins yet.</p>
        ) : (
          <div className="space-y-2">
            {bodyweights.map(bw => (
              <div key={bw.id} className="flex justify-between items-center p-4 rounded-xl bg-card border shadow-sm">
                <div>
                  <span className="font-bold text-lg">{bw.weight}</span>
                  <span className="text-xs text-muted-foreground ml-1">kg/lbs</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{format(new Date(bw.date), 'MMM dd, yyyy')}</span>
                  <button onClick={() => handleDelete(bw.id)} className="text-destructive/50 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}