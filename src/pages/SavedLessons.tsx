import React, { useEffect, useState } from 'react';
import { BookOpen, Search, ArrowRight, BookMarked, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/store';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lesson } from '../types';
import { Link } from 'react-router-dom';

const SavedLessons = () => {
  const { profile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLessons = async () => {
    if (!profile?.uid) return;
    try {
      const q = query(
        collection(db, 'lessons'),
        where('userId', '==', profile.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
    } catch (error) {
      console.error("Fetch Lessons Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [profile]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await deleteDoc(doc(db, 'lessons', id));
        setLessons(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        console.error("Delete Lesson Error:", error);
        alert("Failed to delete lesson.");
      }
    }
  };

  const filteredLessons = lessons.filter(l => 
    (l.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (l.topic?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Learning Library</h1>
          <p className="text-text-secondary">Your AI-generated lessons, saved forever.</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary-crimson transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search topics or titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-primary-crimson/50 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card h-64 shimmer" />
          ))}
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group hover:border-primary-crimson/30"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary-crimson/10 flex items-center justify-center text-primary-crimson group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                      {new Date(l.createdAt?.toDate?.() || l.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(l.id!, e)}
                      className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-all"
                      title="Delete Lesson"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{l.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-3 mb-8 flex-1">
                  {l.summary}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-xs px-3 py-1 rounded-full bg-accent-plum/30 text-text-secondary font-medium">
                    {l.topic}
                  </span>
                  <Link 
                    to={`/lesson/${l.id}`}
                    className="flex items-center gap-2 text-primary-crimson font-bold text-sm hover:translate-x-1 transition-transform"
                  >
                    Open Lesson
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card">
          <BookMarked size={64} className="mx-auto mb-6 text-text-secondary opacity-20" />
          <h2 className="text-2xl font-bold mb-2">No lessons found</h2>
          <p className="text-text-secondary mb-8">Try searching for something else or generate a new lesson!</p>
          <Link to="/generate" className="btn-primary inline-flex">Explore a Topic ✨</Link>
        </div>
      )}
    </div>
  );
};

export default SavedLessons;
