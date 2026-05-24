import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/store';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LessonGenerator from './pages/LessonGenerator';
import LessonView from './pages/LessonView';
import SavedLessons from './pages/SavedLessons';
import Quiz from './pages/Quiz';
import StudyPlanner from './pages/StudyPlanner';
import Chat from './pages/Chat';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudyMaterials from './pages/StudyMaterials';
import VideoGenerator from './pages/VideoGenerator';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Header from './components/Header';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-dark-bg text-white">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);
  const showDashboardLayout = user && !isPublicRoute;

  return (
    <div className={`flex h-screen overflow-hidden ${showDashboardLayout ? 'bg-dark-bg text-text-primary p-4 md:p-6 gap-6' : ''}`}>
      {showDashboardLayout && (
        <>
          <div className="hidden md:block w-20 shrink-0 h-full sticky top-0">
            <Sidebar />
          </div>
          <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
            <BottomNav />
          </div>
        </>
      )}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${!showDashboardLayout ? 'w-full' : ''}`}>
        {showDashboardLayout && <Header />}
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${showDashboardLayout ? 'mb-24 md:mb-0' : ''}`}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/generate" element={<PrivateRoute><LessonGenerator /></PrivateRoute>} />
            <Route path="/lesson/:id" element={<PrivateRoute><LessonView /></PrivateRoute>} />
            <Route path="/saved" element={<PrivateRoute><SavedLessons /></PrivateRoute>} />
            <Route path="/quiz/:lessonId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
            <Route path="/planner" element={<PrivateRoute><StudyPlanner /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/study" element={<PrivateRoute><StudyMaterials /></PrivateRoute>} />
            <Route path="/video-generator" element={<PrivateRoute><VideoGenerator /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
