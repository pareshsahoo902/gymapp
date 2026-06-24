import { useStore } from '@/store';
import { db } from '@/lib/db';
import { Download, Upload, Trash2, Scale, Database } from 'lucide-react';
import { useRef } from 'react';
import { seedDatabase } from '@/lib/seed';

export default function Settings() {
  const { unit, setUnit } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const workouts = await db.workouts.toArray();
      const bodyweights = await db.bodyweights.toArray();
      const prs = await db.prs.toArray();

      const data = { workouts, bodyweights, prs };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym-bud-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data', e);
      alert('Failed to export data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (data.workouts) await db.workouts.bulkPut(data.workouts);
        if (data.bodyweights) await db.bodyweights.bulkPut(data.bodyweights);
        if (data.prs) await db.prs.bulkPut(data.prs);

        alert('Data imported successfully!');
        window.location.reload();
      } catch (err) {
        console.error('Failed to parse or import data', err);
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Are you absolutely sure you want to delete ALL data? This cannot be undone.');
    if (!confirmed) return;

    try {
      await db.workouts.clear();
      await db.bodyweights.clear();
      await db.prs.clear();
      alert('All data has been reset.');
      window.location.reload();
    } catch (e) {
      console.error('Failed to reset data', e);
      alert('Failed to reset data');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="space-y-4">
        {/* Units */}
        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary rounded-lg"><Scale className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">Weight Unit</h3>
                <p className="text-sm text-muted-foreground">Select your preferred unit</p>
              </div>
            </div>
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setUnit('kg')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${unit === 'kg' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              >
                kg
              </button>
              <button
                onClick={() => setUnit('lbs')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${unit === 'lbs' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-4">
          <h3 className="font-semibold">Data Management</h3>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-muted-foreground" />
              <span>Export Data (Backup)</span>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span>Import Data</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleImport}
            />
          </button>

          <button
            onClick={async () => {
              await seedDatabase();
              alert('Sample data added!');
              window.location.reload();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-secondary/50 transition-colors mt-4"
          >
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-muted-foreground" />
              <span>Generate Sample Data</span>
            </div>
          </button>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors mt-8"
          >
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Reset All Data</span>
            </div>
          </button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-8">
          <p>Gym Bud v1.0.0</p>
          <p>Offline First • Private • Secure</p>
        </div>
      </div>
    </div>
  );
}