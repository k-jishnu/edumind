import React, { useEffect, useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  PieChart, 
  Zap, 
  Target, 
  Award,
  Calendar,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/store';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QuizResult, Progress } from '../types';

const Analytics = () => {
  const { profile } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    const fetchData = async () => {
      try {
        const resultsQ = query(
          collection(db, 'quiz_results'),
          where('userId', '==', profile.uid),
          orderBy('createdAt', 'desc')
        );
        const resultsSnap = await getDocs(resultsQ);
        setResults(resultsSnap.docs.map(d => d.data() as QuizResult));

        const progressQ = query(
          collection(db, 'progress'),
          where('userId', '==', profile.uid),
          orderBy('masteryScore', 'desc')
        );
        const progressSnap = await getDocs(progressQ);
        setProgress(progressSnap.docs.map(d => d.data() as Progress));
      } catch (error) {
        console.error("Analytics Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  const avgScore = results.length > 0 
    ? Math.round((results.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / results.length) * 100)
    : 0;

  const totalQuizzes = results.length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Learning Analytics</h1>
          <p className="text-text-secondary">Insightful tracking of your academic growth.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Mastery Score', val: `${avgScore}%`, sub: 'Avg across all topics', icon: Target, color: 'text-primary-crimson', bg: 'bg-primary-crimson/10' },
          { label: 'Quizzes Taken', val: totalQuizzes, sub: 'Total practice sessions', icon: Zap, color: 'text-highlight-gold', bg: 'bg-highlight-gold/10' },
          { label: 'XP Milestone', val: profile?.xp || 0, sub: 'Gamification points', icon: Award, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Level', val: profile?.level || 1, sub: 'Academic ranking', icon: TrendingUp, color: 'text-accent-plum', bg: 'bg-accent-plum/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 flex flex-col items-center text-center space-y-3"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xl font-bold">{stat.val}</p>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-bold mt-1">{stat.label}</p>
            </div>
            <p className="text-xs text-text-secondary opacity-60">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <PieChart className="text-primary-crimson" />
            <h2 className="text-2xl font-bold">Topic Mastery Breakdown</h2>
          </div>
          <div className="space-y-8">
            {progress.length > 0 ? progress.map((p, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">{p.topic}</span>
                  <span className="text-text-secondary">{p.masteryScore}%</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${p.masteryScore}%` }}
                    className="h-full bg-linear-to-r from-primary-crimson to-[#F472B6] rounded-full"
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-text-secondary italic">
                Start learning to see your topic breakdown!
              </div>
            )}
          </div>
        </motion.div>

        {/* Quiz History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="text-success" />
            <h2 className="text-2xl font-bold">Recent Quiz History</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {results.length > 0 ? results.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.score / r.total >= 0.8 ? 'bg-success/20 text-success' : 'bg-primary-crimson/20 text-primary-crimson'}`}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{r.topic}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-text-secondary uppercase tracking-widest mt-1">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(r.createdAt?.toDate?.() || r.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Zap size={10} /> {r.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{r.score}/{r.total}</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest">Score</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-text-secondary italic">
                No quiz history available.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
