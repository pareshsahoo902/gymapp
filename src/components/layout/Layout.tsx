import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 pb-20 pt-4 px-4 max-w-md mx-auto w-full">
        <Outlet />
      </main>
      <RestTimerOverlay />
      <BottomNav />
    </div>
  );
}