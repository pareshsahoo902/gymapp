import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { X, Timer } from 'lucide-react';

export function RestTimerOverlay() {
  const { restTimer, clearRestTimer } = useStore();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!restTimer) return;

    const interval = setInterval(() => {
      const remaining = Math.ceil((restTimer - Date.now()) / 1000);

      if (remaining <= 0) {
        // Play sound/vibrate when finished
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        clearRestTimer();
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer, clearRestTimer]);

  if (!restTimer) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
      <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <Timer className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-lg font-mono">{formatTime(timeLeft)}</span>
          <span className="text-sm opacity-80">Resting</span>
        </div>
        <button onClick={clearRestTimer} className="p-1 hover:bg-background/20 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}