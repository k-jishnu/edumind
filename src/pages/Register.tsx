import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, Brain, Target, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';

const Register = () => {
  const { signIn, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUpWithEmail(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Register Error Root:", err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-crimson/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-plum/10 rounded-full blur-[120px]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 font-sans">
        {/* Value Prop Side */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-10"
        >
          <div className="space-y-6">
            <h2 className="text-6xl font-bold leading-tight">
              Unlock your <br />
              <span className="text-gradient">Full Potential</span> 🧠
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed max-w-md">
              Join thousands of students who are mastering complex topics faster with EduMind AI.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Brain, text: 'Custom AI Lessons on any topic' },
              { icon: Zap, text: 'Adaptive quizzes that learn with you' },
              { icon: Target, text: 'Personalized 7-day study routines' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 text-white font-medium"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-crimson shadow-lg">
                  <item.icon size={24} />
                </div>
                <span className="text-lg">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Register Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 space-y-6"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-2 lg:hidden">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="text-center lg:text-left space-y-2">
            <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mx-auto lg:mx-0 shadow-xl shadow-primary-crimson/30 mb-4">
              <Sparkles className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold">Start Learning Free</h1>
            <p className="text-text-secondary text-sm">
              Create your account to transform how you study ✨
            </p>
          </div>

          <form onSubmit={handleEmailRegister} className="space-y-4">
             <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-text-secondary px-1">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-crimson/50 transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-text-secondary px-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. learner@edumind.ai"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-crimson/50 transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-text-secondary px-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-crimson/50 transition-all text-sm"
              />
            </div>
            
            {error && <p className="text-xs text-error font-medium px-1">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-sm font-bold shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Join EduMind ✨'}
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs text-text-secondary font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button 
            onClick={signIn}
            className="w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-50 transition-all shadow-xl group border border-transparent hover:border-primary-crimson/20"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          <p className="text-center text-xs text-text-secondary leading-relaxed px-4 opacity-60">
            By registering, you agree to EduMind's <span className="underline hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="underline hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
          </p>

          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-crimson font-bold hover:underline">
                Log in here ✨
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
