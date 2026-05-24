import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Brain,
  History,
  ArrowRight,
  FileUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/store';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lesson, Progress } from '../types';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (!profile?.uid) return;

    const fetchData = async () => {
      try {
        // Fetch recent lessons
        const lessonsQ = query(
          collection(db, 'lessons'),
          where('userId', '==', profile.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const lessonsSnap = await getDocs(lessonsQ);
        setRecentLessons(lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));

        // Fetch progress
        const progressQ = query(
          collection(db, 'progress'),
          where('userId', '==', profile.uid),
          orderBy('masteryScore', 'asc'),
          limit(3)
        );
        const progressSnap = await getDocs(progressQ);
        setProgress(progressSnap.docs.map(d => d.data() as Progress));
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Welcome Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[32px] welcome-gradient relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, {profile.displayName}! ✨</h1>
          <p className="text-white/80 max-w-md">Your personal AI tutor has prepared a roadmap to master your current goals.</p>
          <div className="mt-8 flex gap-4">
            <Link to="/generate" className="px-6 py-3 bg-white text-primary-crimson rounded-2xl font-bold hover:scale-105 transition-all shadow-xl">Resume Learning</Link>
            <Link to="/study" className="px-6 py-3 bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl font-bold">Try AI Study Room</Link>
          </div>
        </div>
        {/* Decorative Blobs */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
        <div className="absolute right-10 bottom-10 w-32 h-32 bg-highlight-gold/20 blur-[60px] rounded-full"></div>
      </motion.div>

      {/* Quick Launch Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/study" className="glass-card p-6 border-primary-crimson/20 hover:border-primary-crimson/50 transition-all group">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-primary-crimson/10 text-primary-crimson group-hover:bg-primary-crimson group-hover:text-white transition-all">
              <FileUp size={20} />
            </div>
            <h3 className="font-bold text-sm">AI Study Room</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">Flashcards, quizzes, and text extraction from your materials.</p>
        </Link>
        <Link to="/generate" className="glass-card p-6 border-accent-plum/20 hover:border-accent-plum/50 transition-all group">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-accent-plum/10 text-accent-plum group-hover:bg-accent-plum group-hover:text-white transition-all">
              <Brain size={20} />
            </div>
            <h3 className="font-bold text-sm">AI Curriculum</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">Personalized roadmap & lessons on any global topic you choose.</p>
        </Link>
        <Link to="/planner" className="glass-card p-6 border-success/20 hover:border-success/50 transition-all group">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-all">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-sm">Smart Planner</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">Adaptive schedule that fits your life and learning speed.</p>
        </Link>
        <Link to="/chat" className="glass-card p-6 border-[#38BDF8]/20 hover:border-[#38BDF8]/50 transition-all group">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] group-hover:bg-[#38BDF8] group-hover:text-white transition-all">
              <Brain size={20} />
            </div>
            <h3 className="font-bold text-sm">AI Tutor Chat</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">24/7 instant chat for doubts, complex concepts, and support.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Focus Points (Progress) */}
        <div className="lg:col-span-2 glass-card p-8 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold">Mastery Trends</h3>
            <span className="text-xs text-text-secondary uppercase tracking-widest font-bold">Topic Progress</span>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-4">
            {progress.length > 0 ? progress.map((p, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-4 group">
                <div className="w-full bg-white/5 rounded-t-2xl flex items-end justify-center h-48 overflow-hidden group-hover:bg-primary-crimson/10 transition-all cursor-pointer">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${p.masteryScore}%` }}
                    className="w-full bg-linear-to-t from-primary-crimson to-[#F472B6] rounded-t-2xl"
                  />
                </div>
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold truncate max-w-full">{p.topic}</span>
              </div>
            )) : (
              <div className="w-full flex flex-col items-center justify-center p-10 opacity-30 gap-4">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={32} />
                </div>
                <p className="text-sm font-medium">No progress data available yet.</p>
              </div>
            )}
          </div>

          <div className="mt-10 p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-highlight-gold/20 flex items-center justify-center text-highlight-gold">💡</div>
            <div>
              <p className="text-sm font-bold">Focus Point Suggestion</p>
              <p className="text-[11px] text-text-secondary">
                {progress.length > 0 
                  ? `Focus on "${progress[0].topic}" to achieve master level.`
                  : "Start a new lesson to see AI learning insights."}
              </p>
            </div>
          </div>
        </div>

        {/* Smart Tasks & Recommendations */}
        <div className="space-y-8">
          <div className="glass-card p-8 flex flex-col">
            <h3 className="text-lg font-bold mb-8">Smart Tasks</h3>
            <div className="space-y-4">
              {recentLessons.map((lesson, i) => (
                <Link 
                  key={lesson.id} 
                  to={`/quiz/${lesson.id}`}
                  className="block p-5 rounded-2xl bg-surface/60 border border-white/5 group hover:border-primary-crimson/50 transition-all"
                >
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1">Quick Challenge ✨</p>
                  <p className="text-sm font-bold">{lesson.topic} Quiz</p>
                  <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-primary-crimson"></div>
                  </div>
                </Link>
              ))}
              <Link 
                to="/generate"
                className="mt-4 flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl py-6 hover:bg-white/5 hover:border-white/30 transition-all text-text-secondary text-sm font-bold"
              >
                + New Learning Topic
              </Link>
            </div>
          </div>

          {/* Quick Stats/Badge Mini */}
          <div className="p-8 bg-linear-to-br from-accent-plum to-surface rounded-[32px] border border-white/10 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-crimson/5 rounded-full blur-2xl" />
            <p className="text-[10px] text-text-secondary uppercase font-bold mb-4 tracking-widest">Global Ranking</p>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F7374F" strokeWidth="3" strokeDasharray={`${(profile.xp/1000) * 100}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                  {profile.level}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest">Level {profile.level}</p>
                <p className="text-[10px] text-text-secondary font-medium">Rank: Scholar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
