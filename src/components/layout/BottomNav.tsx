import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Play, LineChart, Settings } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/plan', icon: Calendar, label: 'Plan' },
    { to: '/workout', icon: Play, label: 'Workout' },
    { to: '/progress', icon: LineChart, label: 'Progress' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}