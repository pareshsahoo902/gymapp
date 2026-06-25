import { useStore } from '@/store';
import { db } from '@/lib/db';
import { Download, Upload, Trash2, Scale, ChevronRight, ShieldAlert, Zap } from 'lucide-react';
import { useRef } from 'react';
import { seedDatabase } from '@/lib/seed';
import { motion } from 'framer-motion';

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
      a.download = `gymbae-backup-${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <motion.div
      className="space-y-8 pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <h1 className="text-4xl font-bold tracking-tight">Settings</h1>

      <div className="space-y-6">
        {/* Preferences */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-2">Preferences</h3>
          <div className="p-2 rounded-[24px] bg-card/60 border border-white/5 shadow-soft backdrop-blur-sm">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-xl"><Scale className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold">Weight Unit</h3>
                  <p className="text-xs text-muted-foreground font-medium">Select your preferred unit</p>
                </div>
              </div>
              <div className="flex bg-secondary/50 rounded-xl p-1 border border-white/5">
                <button
                  onClick={() => setUnit('kg')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${unit === 'kg' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  kg
                </button>
                <button
                  onClick={() => setUnit('lbs')}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${unit === 'lbs' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-2">Data Management</h3>
          <div className="p-2 rounded-[24px] bg-card/60 border border-white/5 shadow-soft backdrop-blur-sm flex flex-col gap-1">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3 rounded-[16px] hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-secondary transition-colors"><Download className="w-5 h-5 text-foreground" /></div>
                <span className="font-bold text-left">Backup Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3 rounded-[16px] hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-secondary transition-colors"><Upload className="w-5 h-5 text-foreground" /></div>
                <span className="font-bold text-left">Restore Backup</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
              className="w-full flex items-center justify-between p-3 rounded-[16px] hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-analytics/10 rounded-xl group-hover:bg-analytics/20 transition-colors"><Zap className="w-5 h-5 text-analytics" /></div>
                <span className="font-bold text-left text-analytics">Generate Demo Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-bold text-destructive/80 uppercase tracking-wider pl-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Danger Zone
          </h3>
          <div className="p-2 rounded-[24px] bg-destructive/5 border border-destructive/20 shadow-soft backdrop-blur-sm">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-between p-3 rounded-[16px] hover:bg-destructive/10 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-destructive/10 rounded-xl group-hover:bg-destructive/20 transition-colors"><Trash2 className="w-5 h-5 text-destructive" /></div>
                <div className="text-left">
                  <div className="font-bold text-destructive">Erase All Data</div>
                  <div className="text-xs text-destructive/70 font-medium">This action cannot be undone</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive/50" />
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center text-xs font-bold text-muted-foreground/50 pt-8 pb-12 flex flex-col items-center gap-1">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <p className="text-foreground/50 tracking-wider">GYMBAE v2.0.0</p>
          <p>Offline First • Private • Secure</p>
        </motion.div>
      </div>
    </motion.div>
  );
}