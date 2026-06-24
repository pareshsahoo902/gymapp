import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="flex-1 pb-28 pt-6 px-4 max-w-md mx-auto w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <RestTimerOverlay />
      <BottomNav />
    </div>
  );
}