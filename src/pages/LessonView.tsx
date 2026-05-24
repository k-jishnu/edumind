import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  FileText, 
  Zap,
  Share2,
  Bookmark
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lesson } from '../types';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchLesson = async () => {
      try {
        const snap = await getDoc(doc(db, 'lessons', id));
        if (snap.exists()) {
          setLesson({ id: snap.id, ...snap.data() } as Lesson);
        }
      } catch (error) {
        console.error("Fetch Lesson Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading Lesson...</div>;
  if (!lesson) return <div className="p-10 text-center">Lesson not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary px-4 py-2 flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex gap-3">
          <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <Bookmark size={20} />
          </button>
          <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Lesson Title & Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-block px-4 py-1 rounded-full bg-primary-crimson/10 text-primary-crimson text-sm font-bold uppercase tracking-wider">
          {lesson.topic}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{lesson.title}</h1>
        <p className="text-xl text-text-secondary leading-relaxed italic">
          "{lesson.summary}"
        </p>
      </motion.div>

      {/* Glass Sections */}
      <div className="space-y-8">
        {/* Main Explanation */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="glass-card p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-6 text-primary-crimson">
            <BookOpen size={24} />
            <h2 className="text-2xl font-bold">The Deep Dive</h2>
          </div>
          <div className="prose prose-invert max-w-none text-text-secondary leading-loose text-lg whitespace-pre-wrap">
            {lesson.explanation}
          </div>
        </motion.section>

        {/* Key Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="glass-card p-8 border-success/20"
          >
            <div className="flex items-center gap-3 mb-6 text-success">
              <CheckCircle2 size={24} />
              <h2 className="text-xl font-bold">Key Takeaways</h2>
            </div>
            <ul className="space-y-4">
              {lesson.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-text-secondary">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="glass-card p-8 border-highlight-gold/20"
          >
            <div className="flex items-center gap-3 mb-6 text-highlight-gold">
              <Lightbulb size={24} />
              <h2 className="text-xl font-bold">Real-world Examples</h2>
            </div>
            <ul className="space-y-4">
              {lesson.examples.map((ex, i) => (
                <li key={i} className="flex gap-3 text-text-secondary italic">
                  <span className="text-highlight-gold font-bold">ex.</span>
                  {ex}
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Exam Notes */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-primary-crimson/20 bg-linear-to-br from-primary-crimson/5 to-transparent"
        >
          <div className="flex items-center gap-3 mb-4 text-primary-crimson">
            <FileText size={24} />
            <h2 className="text-xl font-bold">Exam Preparation</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            {lesson.examNotes}
          </p>
        </motion.section>
      </div>

      {/* Action Footer */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 p-8 glass-card border-primary-crimson/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-crimson flex items-center justify-center text-white shadow-lg">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Ready to test your knowledge?</h3>
            <p className="text-sm text-text-secondary">Take a quick 5-question adaptive quiz ✨</p>
          </div>
        </div>
        <Link 
          to={`/quiz/${lesson.id}`}
          className="btn-primary w-full md:w-auto text-lg px-10 py-4"
        >
          Let's try a quick quiz ✨
        </Link>
      </div>
    </div>
  );
};

export default LessonView;
