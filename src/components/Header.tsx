import React from 'react';
import { useAuth } from '../lib/store';
import { Flame, Sparkles, Trophy } from 'lucide-react';

const Header = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <header className="flex justify-between items-center mb-10 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] brand-gradient flex items-center justify-center shadow-lg shadow-primary-crimson/20">
          <span className="text-xl font-bold">E</span>
        </div>
        <span className="text-2xl font-bold tracking-tight">EduMind</span>
      </div>

      <div className="flex items-center gap-6">
        {profile.role !== 'admin' && (
          <div className="flex items-center gap-4 bg-surface border border-white/10 px-5 py-2 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <Flame className="text-highlight-gold" size={18} />
              <span className="text-sm font-semibold">{profile.streak} Day Streak</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <Trophy className="text-primary-crimson" size={18} />
              <span className="text-sm font-semibold">{profile.xp} XP</span>
            </div>
          </div>
        )}

        <div className="w-10 h-10 rounded-full border-2 border-primary-crimson p-0.5">
          <div className="w-full h-full rounded-full bg-accent-plum flex items-center justify-center overflow-hidden">
            <img
              src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`}
              alt={profile.displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
