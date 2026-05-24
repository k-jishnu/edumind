import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';

const Login = () => {
  const { signIn, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login detail:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-crimson/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-plum/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 relative z-10 space-y-8"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-4">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto shadow-xl shadow-primary-crimson/30 mb-4">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-text-secondary text-sm">Continue your quest for knowledge ✨</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary px-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. learner@edumind.ai"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-crimson/50 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-text-secondary px-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-crimson/50 transition-all"
            />
          </div>
          
          {error && <p className="text-xs text-error font-medium px-1">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-sm font-bold shadow-lg"
          >
            {loading ? 'Entering Library...' : 'Log into EduMind'}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-xs text-text-secondary font-bold uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button 
          onClick={signIn}
          className="w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-all shadow-xl group border border-transparent hover:border-primary-crimson/20"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-crimson font-bold hover:underline">
              Create one now ✨
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
