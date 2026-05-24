import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BookOpen, BarChart2, Shield, Trash2, Edit2, Check, X, Search, Crown, PlusCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { collection, getDocs, doc, deleteDoc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

const AdminDashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', displayName: '', role: 'user' });

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  if (authLoading) return null;
  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Note: This only creates the Firestore profile. 
      // In a real app, you'd use a cloud function to create the Auth account too.
      const tempId = `user_${Date.now()}`;
      const newProfile: UserProfile = {
        uid: tempId,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: '',
        xp: 0,
        streak: 0,
        level: 1,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        role: newUser.role as 'user' | 'admin',
      };
      
      await setDoc(doc(db, 'users', tempId), newProfile);
      setIsAddModalOpen(false);
      setNewUser({ email: '', displayName: '', role: 'user' });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === profile.uid) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user profile? This action is irreversible.")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleStartEdit = (user: UserProfile) => {
    setEditingId(user.uid);
    setEditForm({ role: user.role });
  };

  const handleSaveEdit = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), editForm);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = [
    { label: 'Registered Learners', value: users.length.toString(), icon: Users, color: 'text-primary-crimson' },
    { label: 'Admin Moderators', value: users.filter(u => u.role === 'admin').length.toString(), icon: Crown, color: 'text-accent-plum' },
    { label: 'Average XP', value: users.length ? Math.round(users.reduce((acc, u) => acc + u.xp, 0) / users.length).toString() : '0', icon: BarChart2, color: 'text-[#38BDF8]' },
    { label: 'System Health', value: '100%', icon: Shield, color: 'text-[#4ADE80]' },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">System Administration</h1>
          <p className="text-text-secondary">Comprehensive control over users, security, and platform data 🔐</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-text-secondary text-xs font-medium uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-primary-crimson" size={20} />
            User Management
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-white transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search users by email..."
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-crimson/50 transition-all w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-xs font-bold uppercase tracking-widest text-text-secondary">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={user.uid}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white font-bold">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.displayName || 'No Name'}</p>
                          <p className="text-xs text-text-secondary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === user.uid ? (
                        <select
                          className="bg-dark-bg border border-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                          user.role === 'admin' ? 'bg-primary-crimson/10 text-primary-crimson border border-primary-crimson/20' : 'bg-success/10 text-success border border-success/20'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex flex-col">
                          <span className="text-text-secondary uppercase">XP</span>
                          <span className="text-white font-bold">{user.xp}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-text-secondary uppercase">Level</span>
                          <span className="text-white font-bold">{user.level}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === user.uid ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(user.uid)}
                              className="p-2 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(user)}
                              className="p-2 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.uid)}
                              className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && (
            <div className="p-12 text-center text-text-secondary">
              <Users className="mx-auto mb-4 opacity-20" size={48} />
              <p>No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Add New User Profile</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-secondary"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson/50 transition-all"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson/50 transition-all"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Assigned Role</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson/50 transition-all"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="user" className="bg-dark-bg">Standard Learner</option>
                    <option value="admin" className="bg-dark-bg">System Administrator</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 btn-primary"
                  >
                    Create Profile
                  </button>
                </div>
                <p className="text-[10px] text-text-secondary text-center leading-relaxed">
                  Note: This creates a data profile in Firestore. The user must still register with this email to access their individual analytics and progress.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
