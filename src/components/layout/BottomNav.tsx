import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Play, LineChart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const location = useLocation();
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/plan', icon: Calendar, label: 'Plan' },
    { to: '/workout', icon: Play, label: 'Workout', isCenter: true },
    { to: '/progress', icon: LineChart, label: 'Progress' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pb-safe pointer-events-none">
      <nav className="glass-panel mx-auto max-w-md rounded-full pointer-events-auto">
        <div className="flex justify-between items-center h-16 px-2 relative">
          {navItems.map(({ to, icon: Icon, label, isCenter }) => {
            const isActive = location.pathname === to;

            if (isCenter) {
              return (
                <div key={to} className="relative -top-5 px-2">
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-glow'
                          : 'bg-primary/90 text-primary-foreground'
                      }`
                    }
                  >
                    <Icon className="w-6 h-6 ml-0.5 fill-current" />
                  </NavLink>
                </div>
              );
            }

            return (
              <NavLink
                key={to}
                to={to}
                className="relative flex flex-col items-center justify-center w-16 h-full text-xs font-medium"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-white/5 rounded-full m-1"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                  <span className="text-[10px]">{label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}