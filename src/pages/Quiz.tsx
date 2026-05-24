import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Loader2, 
  Trophy,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/store';
import { generateQuiz as aiGenerateQuiz } from '../lib/gemini';
import { db } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { Lesson, Quiz as QuizType, QuizQuestion } from '../types';

const Quiz = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!lessonId || !profile?.uid) return;

    const initQuiz = async () => {
      try {
        // 1. Fetch Lesson
        const lessonSnap = await getDoc(doc(db, 'lessons', lessonId));
        if (!lessonSnap.exists()) return;
        const lessonData = lessonSnap.data() as Lesson;
        setLesson(lessonData);

        // 2. Check if quiz exists for this lesson
        const quizQ = query(
          collection(db, 'quizzes'),
          where('lessonId', '==', lessonId),
          where('userId', '==', profile.uid)
        );
        const quizSnap = await getDocs(quizQ);

        if (!quizSnap.empty) {
          setQuiz({ id: quizSnap.docs[0].id, ...quizSnap.docs[0].data() } as QuizType);
        } else {
          // 3. Generate new quiz
          const lessonContent = `${lessonData.title}\n${lessonData.summary}\n${lessonData.explanation}`;
          const questions = await aiGenerateQuiz(lessonContent);
          
          const newQuiz = {
            lessonId,
            userId: profile.uid,
            topic: lessonData.topic,
            questions,
            createdAt: serverTimestamp(),
          };
          
          const quizRef = await addDoc(collection(db, 'quizzes'), newQuiz);
          setQuiz({ id: quizRef.id, ...newQuiz } as QuizType);
        }
      } catch (error) {
        console.error("Quiz Init Error:", error);
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [lessonId, profile]);

  const handleAnswer = (option: string) => {
    const isCorrect = option === quiz?.questions[currentStep].correctAnswer;
    if (isCorrect) setScore(s => s + 1);
    
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentStep < (quiz?.questions.length || 0) - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finishQuiz(isCorrect ? score + 1 : score);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    setShowResult(true);
    
    // Save Result & Update User Progress
    if (!profile || !quiz) return;

    try {
      await addDoc(collection(db, 'quiz_results'), {
        quizId: quiz.id,
        userId: profile.uid,
        topic: quiz.topic,
        score: finalScore,
        total: quiz.questions.length,
        difficulty: quiz.questions[0].difficulty,
        createdAt: serverTimestamp(),
      });

      // Update User XP
      const xpGained = finalScore * 20;
      await updateDoc(doc(db, 'users', profile.uid), {
        xp: increment(xpGained),
        lastActive: new Date().toISOString(),
      });

      // Update Topic Progress
      const mastery = Math.round((finalScore / quiz.questions.length) * 100);
      const progressQ = query(
        collection(db, 'progress'),
        where('userId', '==', profile.uid),
        where('topic', '==', quiz.topic)
      );
      const progressSnap = await getDocs(progressQ);

      if (progressSnap.empty) {
        await addDoc(collection(db, 'progress'), {
          userId: profile.uid,
          topic: quiz.topic,
          masteryScore: mastery,
          lastAttemptAt: serverTimestamp(),
        });
      } else {
        const progDoc = progressSnap.docs[0];
        const oldMastery = progDoc.data().masteryScore;
        await updateDoc(progDoc.ref, {
          masteryScore: Math.max(oldMastery, mastery),
          lastAttemptAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Finish Quiz Error:", error);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center gap-6">
      <div className="w-24 h-24 rounded-3xl bg-primary-crimson/10 flex items-center justify-center relative">
        <Zap className="text-primary-crimson animate-pulse" size={48} fill="currentColor" />
        <Loader2 className="absolute inset-0 animate-spin text-white/20" size={96} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Generating personalized questions...</h2>
        <p className="text-text-secondary">Adapting difficulty to your level ✨</p>
      </div>
    </div>
  );

  if (showResult) return (
    <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full glass-card p-10 text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-highlight-gold/20 flex items-center justify-center mx-auto mb-4 border-2 border-highlight-gold/30">
            <Trophy className="text-highlight-gold" size={48} />
          </div>
          <motion.div 
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -50, opacity: 1 }}
            className="absolute top-0 right-[-40px] px-3 py-1 rounded-full bg-primary-crimson text-white font-bold text-sm shadow-lg xp-animation"
          >
            +{score * 20} XP
          </motion.div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Quiz Complete!</h1>
          <p className="text-text-secondary text-lg">Great job on finishing the quiz ✨</p>
        </div>

        <div className="flex justify-center gap-12 py-6">
          <div>
            <p className="text-3xl font-bold text-primary-crimson">{score}/{quiz?.questions.length}</p>
            <p className="text-text-secondary text-sm">Correct Answers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-success">{Math.round((score / (quiz?.questions.length || 1)) * 100)}%</p>
            <p className="text-text-secondary text-sm">Mastery Score</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full py-4 text-lg"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => {
              setCurrentStep(0);
              setAnswers([]);
              setScore(0);
              setShowResult(false);
            }}
            className="btn-secondary w-full py-4 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );

  const currentQuestion = quiz?.questions[currentStep];

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      {/* Quiz Progress */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-crimson flex items-center justify-center text-white shadow-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold">{quiz?.topic}</h2>
            <p className="text-xs text-text-secondary font-medium tracking-widest uppercase">Question {currentStep + 1} of {quiz?.questions.length}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary mb-1">XP Potential</p>
          <p className="font-bold text-highlight-gold">{quiz?.questions.length ? quiz.questions.length * 20 : 0} XP</p>
        </div>
      </div>

      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-12">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / (quiz?.questions.length || 1)) * 100}%` }}
          className="h-full bg-primary-crimson"
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-10"
        >
          <h3 className="text-2xl md:text-3xl font-bold leading-tight">
            {currentQuestion?.question}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="glass-card p-6 text-left hover:bg-primary-crimson transition-all group flex items-center justify-between"
              >
                <span className="text-lg font-medium group-hover:text-white transition-colors">{option}</span>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:bg-white/20 transition-all">
                  <ArrowRight size={18} />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
