import React, { useState } from 'react';
import { Sparkles, Brain, Loader2, BookOpen, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/store';
import { generateLesson as aiGenerateLesson } from '../lib/gemini';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LessonGenerator = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');

    try {
      // 1. Call Gemini
      const lessonData = await aiGenerateLesson(topic, notes);
      
      // 2. Save to Firestore
      const docRef = await addDoc(collection(db, 'lessons'), {
        ...lessonData,
        userId: profile?.uid,
        topic,
        createdAt: serverTimestamp(),
      });

      // 3. Navigate to lesson view
      navigate(`/lesson/${docRef.id}`);
    } catch (err: any) {
      console.error("Generator Error:", err);
      setError("Something went wrong while generating your lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex p-4 rounded-3xl bg-primary-crimson/10 text-primary-crimson mb-6 shadow-xl shadow-primary-crimson/20"
        >
          <Brain size={48} />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4">What shall we learn today?</h1>
        <p className="text-text-secondary max-w-lg mx-auto">
          Enter a topic or paste your messy notes, and I'll transform them into a structured learning experience for you.
        </p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleGenerate} 
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary px-2">Topic or Subject</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photosynthesis, Quantum Physics, World War II..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary-crimson/50 focus:outline-none transition-all text-lg"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary px-2">Additional Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your notes here for a more personalized lesson..."
            className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary-crimson/50 focus:outline-none transition-all resize-none"
            disabled={loading}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-error/10 text-error text-sm border border-error/20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !topic}
          className="w-full btn-primary flex items-center justify-center gap-3 py-5 text-xl relative overflow-hidden"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Crafting your lesson...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Generate Learning ✨
            </>
          )}
          {loading && (
            <motion.div 
              className="absolute inset-0 bg-white/10"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          )}
        </button>
      </motion.form>

      {/* Suggested Topics */}
      <div className="mt-12">
        <h3 className="text-sm font-medium text-text-secondary mb-4 uppercase tracking-widest text-center">Suggested Topics</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {['Deep Learning', 'History of Art', 'Macroeconomics', 'Human Anatomy'].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:border-primary-crimson/50 transition-all"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonGenerator;
