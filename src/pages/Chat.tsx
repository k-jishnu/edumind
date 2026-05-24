import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, Brain, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/store';
import { chatExplanation } from '../lib/gemini';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const Chat = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatExplanation(messages, input);
      const botMessage: Message = { role: 'model', parts: [{ text: response }] };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = { role: 'model', parts: [{ text: "I'm sorry, I encountered an error. Please try again." }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-crimson flex items-center justify-center shadow-lg shadow-primary-crimson/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">EduMind AI</h1>
            <p className="text-xs text-success flex items-center gap-1 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online Tutor
            </p>
          </div>
        </div>
        <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-text-secondary">
          <History size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-6 space-y-6 pr-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50 px-10">
              <Brain size={64} className="text-primary-crimson" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Your Personal AI Tutor</h3>
                <p className="max-w-xs mx-auto">Ask me anything about your lessons, simplify complex topics, or just say hi!</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {['Explain Quantum Physics simply', 'Who won WW2?', 'How to master math?'].map(q => (
                  <button 
                    key={q} 
                    onClick={() => setInput(q)}
                    className="text-xs px-4 py-2 rounded-full border border-white/20 hover:bg-white/5"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  flex gap-4 max-w-[85%] md:max-w-[70%]
                  ${m.role === 'user' ? 'flex-row-reverse' : ''}
                `}>
                  <div className={`
                    w-10 h-10 rounded-xl shrink-0 flex items-center justify-center
                    ${m.role === 'user' ? 'bg-primary-crimson' : 'bg-accent-plum'}
                  `}>
                    {m.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                  </div>
                  <div className={`
                    p-6 rounded-3xl leading-relaxed text-sm
                    ${m.role === 'user' 
                      ? 'bg-primary-crimson text-white rounded-tr-none' 
                      : 'glass-card rounded-tl-none'}
                  `}>
                    {m.parts[0].text}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-plum flex items-center justify-center">
                <Loader2 className="animate-spin" size={20} />
              </div>
              <div className="p-6 rounded-3xl glass-card rounded-tl-none flex gap-2">
                <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className="relative group"
      >
        <div className="absolute inset-0 bg-primary-crimson/20 rounded-3xl blur-xl transition-all opacity-0 group-focus-within:opacity-100" />
        <div className="relative flex items-center glass-card p-2 border-white/5 focus-within:border-primary-crimson/50 transition-all rounded-3xl overflow-hidden">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your tutor anything..."
            className="flex-1 bg-transparent px-6 py-4 focus:outline-none text-lg"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className={`
              p-4 rounded-2xl transition-all
              ${input.trim() ? 'bg-primary-crimson text-white shadow-lg' : 'bg-white/5 text-text-secondary cursor-not-allowed'}
            `}
          >
            <Send size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
