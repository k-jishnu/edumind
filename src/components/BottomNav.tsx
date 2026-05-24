import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  ShieldAlert,
  FileUp
} from 'lucide-react';
import { useAuth } from '../lib/store';

const BottomNav = () => {
  const { profile } = useAuth();
  
  const navItems = profile?.role === 'admin' 
    ? [{ to: '/admin', icon: ShieldAlert, label: 'Admin' }]
    : [
        { to: '/dashboard', icon: Home, label: 'Home' },
        { to: '/study', icon: FileUp, label: 'Study' },
        { to: '/generate', icon: PlusCircle, label: 'Learn' },
        { to: '/saved', icon: BookOpen, label: 'Library' },
        { to: '/planner', icon: Calendar, label: 'Plan' },
        { to: '/chat', icon: MessageSquare, label: 'Chat' },
      ];

  return (
    <div className="bg-surface/60 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-[32px] shadow-2xl flex justify-around items-center">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all duration-300
            ${isActive ? 'text-primary-crimson scale-110' : 'text-text-secondary hover:text-white'}
          `}
        >
          <item.icon size={24} />
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
