import React from 'react';
import { User, Mail, Award, Flame, Trophy, LogOut, Shield, Settings, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/store';

const Profile = () => {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  const stats = [
    { label: 'Total XP', val: profile.xp, icon: Trophy, color: 'text-highlight-gold' },
    { label: 'Current Streak', val: `${profile.streak} Days`, icon: Flame, color: 'text-primary-crimson' },
    { label: 'Level', val: profile.level, icon: Award, color: 'text-success' },
    { label: 'Rank', val: 'Scholar', icon: Sparkles, color: 'text-accent-plum' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-crimson/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary-crimson to-highlight-gold rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <img 
              src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
              alt={profile.displayName}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dark-bg object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center md:text-left space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold">{profile.displayName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-2 text-text-secondary">
                <Mail size={16} />
                {profile.email}
              </span>
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs font-bold uppercase tracking-widest border border-white/10">
                <Shield size={14} className={profile.role === 'admin' ? 'text-primary-crimson' : 'text-success'} />
                {profile.role === 'admin' ? 'Administrator' : 'Verified Student'}
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed max-w-md">
              Lifelong learner at EduMind. On a mission to master {profile.xp > 1000 ? 'the universe' : 'new topics'} through AI intelligence.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col items-center gap-3"
          >
            <div className={`w-12 h-12 rounded-2xl bg-white/5 ${stat.color} flex items-center justify-center shadow-inner`}>
              <stat.icon size={24} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{stat.val}</p>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-card p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={20} className="text-primary-crimson" />
            Account Settings
          </h2>
          <div className="space-y-4">
            <button className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-left text-sm transition-all flex justify-between items-center group">
              <span>Edit Profile Details</span>
              <span className="text-text-secondary group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-left text-sm transition-all flex justify-between items-center group">
              <span>Study Preferences</span>
              <span className="text-text-secondary group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-left text-sm transition-all flex justify-between items-center group">
              <span>Notification Centers</span>
              <span className="text-text-secondary group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </section>

        <section className="glass-card p-8 bg-error/5 border-error/10 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-error">
            <Shield size={20} />
            Danger Zone
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            These actions are permanent. Please be careful when proceeding.
          </p>
          <div className="space-y-4">
            <button 
              onClick={signOut}
              className="w-full p-4 rounded-2xl border border-error/30 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2 font-bold"
            >
              <LogOut size={20} />
              Sign Out of EduMind
            </button>
            <button className="w-full p-4 rounded-2xl text-text-secondary text-xs hover:underline">
              Permanently Deactivate Account
            </button>
          </div>
        </section>
      </div>

      {/* Footer Branding */}
      <div className="flex flex-col items-center py-10 opacity-30 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">EduMind Premium</span>
        </div>
        <p className="text-[10px]">Since 2026 • AI Intelligence Ecosystem</p>
      </div>
    </div>
  );
};

export default Profile;
