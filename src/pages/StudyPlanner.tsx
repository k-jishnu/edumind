import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Plus, Sparkles, Loader2, ArrowRight, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/store';
import { generateStudyPlan as aiGenerateStudyPlan } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { StudyPlan } from '../types';

const StudyPlanner = () => {
  const { profile } = useAuth();
  const [goal, setGoal] = useState('');
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    const fetchPlans = async () => {
      try {
        const q = query(
          collection(db, 'study_plans'),
          where('userId', '==', profile.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyPlan)));
      } catch (error) {
        console.error("Fetch Plans Error:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchPlans();
  }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || loading) return;

    setLoading(true);
    try {
      const planData = await aiGenerateStudyPlan(goal);
      const newPlan = {
        ...planData,
        userId: profile?.uid,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'study_plans'), newPlan);
      setPlans(prev => [{ id: docRef.id, ...newPlan }, ...prev]);
      setGoal('');
    } catch (error) {
      console.error("Plan Gen Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'study_plans', id));
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Delete Plan Error:", error);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Study Planner</h1>
          <p className="text-text-secondary">AI-designed schedules for your learning goals.</p>
        </div>
      </div>

      {/* Goal Input */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 relative overflow-hidden"
      >
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary-crimson/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-flex p-4 rounded-3xl bg-primary-crimson/10 text-primary-crimson shadow-xl">
            <Target size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">What is your learning goal?</h2>
            <p className="text-text-secondary">Tell me what you want to achieve, and I'll build a day-by-day plan for you.</p>
          </div>

          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="e.g. Master React in a week, Learn basics of Spanish..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-crimson/50"
              disabled={loading}
              required
            />
            <button 
              type="submit"
              disabled={loading || !goal}
              className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap py-4 sm:py-0"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              Generate Plan ✨
            </button>
          </form>
        </div>
      </motion.div>

      {/* Plans List */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Calendar className="text-primary-crimson" />
          Active Routines
        </h2>

        {fetching ? (
          <div className="text-center py-10 opacity-50">Loading Study Plans...</div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {plans.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden"
              >
                <div className="bg-white/5 px-8 py-6 flex justify-between items-center border-b border-white/10">
                  <h3 className="text-xl font-bold">{p.goal}</h3>
                  <button 
                    onClick={() => p.id && deletePlan(p.id)}
                    className="text-xs text-text-secondary hover:text-error transition-colors uppercase tracking-widest font-bold"
                  >
                    Delete Plan
                  </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {p.schedule.map((day, di) => (
                    <div key={di} className="space-y-4">
                      <div className="flex items-center gap-2 text-primary-crimson">
                        <Calendar size={16} />
                        <span className="text-sm font-bold uppercase tracking-widest">{day.day}</span>
                      </div>
                      <ul className="space-y-2">
                        {day.tasks.map((task, ti) => (
                          <li key={ti} className="flex items-start gap-2 p-3 rounded-xl bg-white/5 text-sm text-text-secondary leading-relaxed group">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0 group-hover:bg-primary-crimson transition-colors" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-text-secondary italic">No active routines. Set a goal above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;
