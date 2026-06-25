import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { X, Play, Pause, Timer, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RestTimerOverlay() {
  const { restTimer, clearRestTimer } = useStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // We need to keep our own interval reference if we want pause capability
  // Note: the original store `restTimer` was just a target timestamp.
  // We'll manage the countdown locally if paused.

  useEffect(() => {
    if (!restTimer) {
      setIsExpanded(false);
      return;
    }

    const remaining = Math.ceil((restTimer - Date.now()) / 1000);
    if (remaining > 0) {
      setTimeLeft(remaining);
      setInitialTime(remaining);
      setIsPaused(false);
    }
  }, [restTimer]);

  useEffect(() => {
    if (!restTimer || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          clearRestTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restTimer, isPaused, clearRestTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const adjustTime = (amount: number) => {
    setTimeLeft(prev => Math.max(1, prev + amount));
  };

  if (!restTimer || timeLeft <= 0) return null;

  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
          <div className="absolute top-6 right-6 flex gap-4">
            <button onClick={() => setIsExpanded(false)} className="p-3 bg-secondary/50 rounded-full hover:bg-secondary">
              <Minimize2 className="w-6 h-6" />
            </button>
            <button onClick={clearRestTimer} className="p-3 bg-destructive/20 text-destructive rounded-full hover:bg-destructive/30">
              <X className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-muted-foreground mb-12">Rest Time</h2>

          <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-12">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="150"
                cy="150"
                r={radius}
                className="stroke-secondary/30"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="150"
                cy="150"
                r={radius}
                className="stroke-primary"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "linear" }}
                style={{ strokeDasharray: circumference }}
              />
            </svg>
            <div className="text-7xl font-mono font-bold tracking-tighter">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex items-center gap-6 mb-12">
            <button onClick={() => adjustTime(-30)} className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-xl font-bold hover:bg-secondary active:scale-95 transition-all">
              -30
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow active:scale-95 transition-all"
            >
              {isPaused ? <Play className="w-10 h-10 ml-2 fill-current" /> : <Pause className="w-10 h-10 fill-current" />}
            </button>
            <button onClick={() => adjustTime(30)} className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-xl font-bold hover:bg-secondary active:scale-95 transition-all">
              +30
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[60] w-fit"
        >
          <div
            className="glass-panel rounded-full px-4 py-2 flex items-center gap-4 cursor-pointer shadow-lg hover:bg-secondary/40 transition-colors relative overflow-hidden"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center gap-2 relative z-10">
              <Timer className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-[1px] h-4 bg-border/50 relative z-10" />
            <div className="flex gap-2 relative z-10">
              <button
                onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); clearRestTimer(); }}
                className="p-1.5 hover:bg-destructive/20 text-destructive rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tiny progress bar at bottom of pill */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-primary/50 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}