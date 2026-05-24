import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Zap, 
  Target, 
  BookOpen, 
  Cpu, 
  BarChart3,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/store';

const Landing = () => {
  const { profile } = useAuth();

  const features = [
    { 
      icon: Brain, 
      title: 'Neural Summaries', 
      desc: 'Our proprietary LLM logic extracts the core cognitive map from your notes, discarding noise.',
      color: 'text-primary-crimson',
      bg: 'bg-primary-crimson/5',
      size: 'col-span-1 md:col-span-2'
    },
    { 
      icon: Zap, 
      title: 'Live Evolution', 
      desc: 'Quizzes that adapt in real-time to your response speed and accuracy.',
      color: 'text-accent-plum',
      bg: 'bg-accent-plum/5',
      size: 'col-span-1'
    },
    { 
      icon: Target, 
      title: 'Precision Planning', 
      desc: 'Time-blocked schedules optimized for long-term retention.',
      color: 'text-highlight-gold',
      bg: 'bg-highlight-gold/5',
      size: 'col-span-1'
    },
    { 
      icon: Cpu, 
      title: 'Direct PDF Parsing', 
      desc: 'Instant structural analysis of complex documents, including diagrams and scientific notation.',
      color: 'text-success',
      bg: 'bg-success/5',
      size: 'col-span-1'
    },
    { 
      icon: BarChart3, 
      title: 'Cognitive Analytics', 
      desc: 'Visualize your memory decay curves and identify knowledge gaps before they widen.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/5',
      size: 'col-span-1 md:col-span-2'
    }
  ];

  const steps = [
    { number: '01', title: 'Upload Material', desc: 'Drop your PDFs, raw notes, or lecture recordings.' },
    { number: '02', title: 'AI Synthesis', desc: 'Our engine identifies key concepts and hierarchies.' },
    { number: '03', title: 'Active Mastery', desc: 'Engage with generated flashcards and dynamic tests.' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-primary-crimson/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-crimson flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-xl">EduMind</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">How it Works</a>
          </div>

          <div className="flex items-center gap-4">
            {profile ? (
              <Link to="/dashboard" className="px-4 py-2 rounded-full bg-primary-crimson text-white text-sm font-bold hover:bg-primary-crimson/90 transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors">Join Now</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative pt-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl aspect-square pointer-events-none opacity-50">
          <div className="absolute top-0 left-0 w-full h-full bg-radial-at-t from-primary-crimson/20 to-transparent blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-accent-plum/10 rounded-full blur-[100px] animate-pulse" />
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-primary-crimson animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Next Gen AI Tutor</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.85]"
            >
              Learn <span className="text-primary-crimson italic">Smarter.</span> <br />
              Master <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-crimson via-accent-plum to-highlight-gold">Everything.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-text-secondary max-w-3xl mb-12 leading-relaxed"
            >
              EduMind is the world's most advanced learning synthesizer. Convert fragmented notes into biological understanding using neural synthesis and adaptive testing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Link 
                to="/register"
                className="group relative flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary-crimson/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-3 px-10 py-5 rounded-full font-bold border border-white/10 hover:bg-white/5 transition-all text-xl"
              >
                View Demo
              </Link>
            </motion.div>

            {/* Floating Visual Asset */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-24 w-full max-w-6xl relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-crimson to-accent-plum rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative border border-white/10 rounded-[2.5rem] overflow-hidden bg-[#0F0F11]/80 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-2 p-5 border-b border-white/5 bg-white/5">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10" />
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10" />
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10" />
                  </div>
                  <div className="mx-auto text-[10px] font-mono text-text-secondary tracking-[0.3em] uppercase pl-12">edumind_workstation_v2.0</div>
                </div>
                <div className="p-8 md:p-16">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 space-y-8">
                      <div className="h-6 w-1/3 bg-white/10 rounded-full animate-pulse" />
                      <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 p-8 flex items-center justify-center relative overflow-hidden group/box">
                         <div className="absolute inset-0 bg-primary-crimson/5 opacity-0 group-hover/box:opacity-100 transition-opacity" />
                         <div className="text-center relative z-10">
                            <div className="w-20 h-20 rounded-2xl bg-primary-crimson shadow-[0_0_30px_rgba(224,30,55,0.4)] flex items-center justify-center mb-6 mx-auto">
                              <Layers size={40} className="text-white" />
                            </div>
                            <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Processing Analysis</p>
                            <p className="text-[10px] text-text-secondary">Extracting core concepts...</p>
                         </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 w-full bg-white/5 rounded-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-primary-crimson/20 w-3/4" />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-text-secondary tracking-widest">
                           <span>Synthesizing</span>
                           <span>75%</span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-7 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-1/4 bg-white/10 rounded-full" />
                        <div className="flex gap-2">
                           <div className="h-6 w-16 bg-success/10 border border-success/20 rounded-full text-[10px] flex items-center justify-center text-success font-bold">READY</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/[0.08] transition-all cursor-default">
                             <div className="h-1 w-1/2 bg-white/10 rounded-full mb-4" />
                             <div className="h-1 w-full bg-white/10 rounded-full mb-2" />
                             <div className="h-1 w-3/4 bg-white/10 rounded-full" />
                             <div className="mt-8 flex justify-end">
                                <ChevronRight size={16} className="text-text-secondary" />
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-40 border-t border-white/5 relative z-10">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-primary-crimson text-sm font-bold uppercase tracking-[0.3em] mb-4">Core Ecosystem</h2>
              <p className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9]">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">achieve mastery.</span></p>
            </div>
            <p className="text-text-secondary max-w-sm mb-2">Our proprietary neural synthesis engine replaces hours of manual flashcard creation with instant, cognitive mapping.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`group p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all ${f.bg} ${f.size} relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                  <f.icon size={160} />
                </div>
                
                <div className={`w-14 h-14 rounded-[1.25rem] bg-white/5 flex items-center justify-center mb-16 ${f.color} group-hover:scale-110 transition-transform shadow-xl`}>
                  <f.icon size={28} />
                </div>
                
                <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  {f.title}
                  <ChevronRight size={20} className="text-white/20 group-hover:translate-x-1 group-hover:text-white transition-all" />
                </h3>
                <p className="text-text-secondary text-lg leading-relaxed max-w-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-40 border-t border-white/5">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
              <div className="lg:col-span-5">
                 <div className="sticky top-32">
                    <h2 className="text-highlight-gold text-sm font-bold uppercase tracking-[0.3em] mb-4">The Protocol</h2>
                    <p className="text-6xl font-bold tracking-tight mb-10 leading-[0.9]">Optimization <br /><span className="text-gradient">Loop.</span></p>
                    <p className="text-text-secondary text-xl leading-relaxed mb-12">Our system uses a three-pillar synthesis approach to ensure information moves from short-term memory to permanent understanding.</p>
                    
                    <div className="space-y-4">
                       {[
                         'Direct PDF Vectorization',
                         'Memory Decay Smoothing',
                         'Contextual Knowledge Graphs',
                         '256-bit Document Encryption'
                       ].map(item => (
                         <div key={item} className="flex items-center gap-3 text-sm font-bold py-3 border-b border-white/5 uppercase tracking-widest text-text-secondary">
                            <Sparkles size={14} className="text-primary-crimson" />
                            {item}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="lg:col-span-7 space-y-8">
                 {steps.map((s, i) => (
                    <motion.div 
                      key={s.number}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="p-16 rounded-[4rem] bg-white/[0.015] border border-white/5 flex flex-col md:flex-row gap-12 items-start group hover:bg-white/[0.03] transition-all cursor-default"
                    >
                       <span className="text-9xl font-bold text-white/[0.02] font-mono group-hover:text-primary-crimson/10 transition-colors leading-none">{s.number}</span>
                       <div>
                          <h4 className="text-3xl font-bold mb-6 group-hover:text-primary-crimson transition-colors">{s.title}</h4>
                          <p className="text-text-secondary text-xl leading-relaxed">{s.desc}</p>
                          <div className="mt-12 flex gap-3">
                             {[1,2,3].map(dot => (
                               <div key={dot} className="h-1.5 w-12 bg-white/10 rounded-full group-hover:bg-primary-crimson/20 transition-colors" />
                             ))}
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-40">
           <div className="p-16 md:p-32 rounded-[5rem] bg-gradient-to-br from-primary-crimson via-primary-crimson to-secondary-wine relative overflow-hidden text-center group">
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-[3000ms]" />
              <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-black/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-3xl flex items-center justify-center mb-12 mx-auto shadow-2xl rotate-12"
                >
                   <Brain size={48} className="text-white" />
                </motion.div>
                
                <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-10 leading-[0.85]">Join the 1% <br />of elite learners.</h2>
                <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto leading-relaxed font-medium">Join 50,000+ students and professionals who are already using EduMind to redefine how they learn.</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                   <Link to="/register" className="bg-white text-black px-14 py-6 rounded-full font-bold text-2xl hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
                      Initialize Genius
                      <ArrowRight size={24} />
                   </Link>
                   <Link to="/login" className="bg-black/20 backdrop-blur-xl text-white border border-white/20 px-14 py-6 rounded-full font-bold text-2xl hover:bg-white/10 transition-all">
                      Secure Login
                   </Link>
                </div>
              </div>
           </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
           <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-primary-crimson flex items-center justify-center">
                 <Brain size={24} />
               </div>
               <span className="text-2xl font-bold tracking-tight">EduMind</span>
             </div>
             <p className="text-text-secondary max-w-sm text-lg">Advancing human cognition through synthetic intelligence and first-principles learning architecture.</p>
           </div>
           
           <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white mb-8">Ecosystem</h4>
              <ul className="space-y-4 text-text-secondary font-medium">
                 <li><a href="#" className="hover:text-primary-crimson transition-colors">Neural Library</a></li>
                 <li><a href="#" className="hover:text-primary-crimson transition-colors">Cognitive Maps</a></li>
                 <li><a href="#" className="hover:text-primary-crimson transition-colors">Synthesis Core</a></li>
              </ul>
           </div>
           
           <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white mb-8">Support</h4>
              <ul className="space-y-4 text-text-secondary font-medium">
                 <li><a href="#" className="hover:text-primary-crimson transition-colors">Documentation</a></li>
                 <li><a href="#" className="hover:text-primary-crimson transition-colors">Security</a></li>
                 <li><a href="#" className="hover:text-primary-crimson transition-colors">Status</a></li>
              </ul>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
          <div className="flex gap-10">
            <a href="#" className="text-[10px] font-bold text-text-secondary hover:text-white uppercase tracking-[0.3em]">Privacy Protocol</a>
            <a href="#" className="text-[10px] font-bold text-text-secondary hover:text-white uppercase tracking-[0.3em]">Terms of Synthesis</a>
          </div>

          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.3em]">© 2024 EduMind Systems. Built with Bio-Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
