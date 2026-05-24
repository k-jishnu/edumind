import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart2,
  User,
  LogOut,
  Sparkles,
  ShieldAlert,
  FileUp
} from 'lucide-react';
import { useAuth } from '../lib/store';

const Sidebar = () => {
  const { signOut, profile } = useAuth();

  const VideoIcon = ({ size }: { size?: number | string }) => <span style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>🎬</span>;

  const navItems = profile?.role === 'admin'
    ? [{ to: '/admin', icon: ShieldAlert, label: 'Admin Panel' }]
    : [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/study', icon: FileUp, label: 'Study Room' },
      { to: '/generate', icon: PlusCircle, label: 'New Lesson' },
      { to: '/video-generator', icon: VideoIcon, label: 'AI Video' },
      { to: '/saved', icon: BookOpen, label: 'My Study Library' },
      { to: '/planner', icon: Calendar, label: 'Study Plan' },
      { to: '/chat', icon: MessageSquare, label: 'AI Tutor' },
      { to: '/analytics', icon: BarChart2, label: 'Analytics' },
      { to: '/profile', icon: User, label: 'Profile' },
    ];

  return (
    <div className="h-full flex flex-col items-center py-8 px-4 bg-surface/30 rounded-[32px] border-r border-white/5">
      <div className="w-12 h-12 rounded-[12px] brand-gradient flex items-center justify-center mb-12 shadow-lg shadow-primary-crimson/20">
        <Sparkles className="text-white" size={24} />
      </div>

      <nav className="flex-1 flex flex-col gap-6 items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) => `
              p-3 rounded-2xl transition-all duration-300
              ${isActive
                ? 'bg-primary-crimson text-white shadow-[0_0_20px_rgba(247,55,79,0.3)]'
                : 'text-text-secondary hover:bg-white/5 hover:text-white'}
            `}
          >
            <item.icon size={24} />
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => signOut()}
        className="mt-auto p-3 rounded-2xl text-text-secondary hover:bg-error/10 hover:text-error transition-all duration-300"
        title="Logout"
      >
        <LogOut size={24} />
      </button>
    </div>
  );
};

export default Sidebar;
