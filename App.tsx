import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPatient } from './pages/DashboardPatient';
import { DashboardDoctor } from './pages/DashboardDoctor';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { BookAppointment } from './pages/BookAppointment';
import { ChatPage } from './pages/Chat';
import { Auth } from './pages/Auth';
import { User, UserRole } from './types';
import { mockDb } from './services/mockDb';
import { AccessGate } from './components/AccessGate';

interface ProtectedRouteProps {
  user: User | null;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

// Guard Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedRoles, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Access Gate Logic
  const [accessGranted, setAccessGranted] = useState(() => {
      // Check localStorage immediately to prevent flash
      return localStorage.getItem('docspot_access_granted') === 'true';
  });

  // Check persistent session on load
  useEffect(() => {
    mockDb.getSession().then((session) => {
      if (session) setUser(session);
      setLoading(false);
    });
  }, []);

  const handleUnlock = () => {
      localStorage.setItem('docspot_access_granted', 'true');
      setAccessGranted(true);
  };

  // 1. Security Check: Render AccessGate if not authorized
  if (!accessGranted) {
      return <AccessGate onUnlock={handleUnlock} />;
  }

  // 2. Loading State: Render simple loader while checking session
  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 font-mono">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span>Initializing DocSpot System...</span>
          </div>
      );
  }

  // 3. Main App: Render Router only after access is granted and loading is done
  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={
            !user ? <Navigate to="/login" /> : <Navigate to={
              user.role === UserRole.PATIENT ? '/patient-dashboard' :
              user.role === UserRole.DOCTOR ? '/doctor-dashboard' :
              '/admin-dashboard'
            } />
          } />
          
          <Route path="/login" element={!user ? <Auth setUser={setUser} mode="login" /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Auth setUser={setUser} mode="signup" /> : <Navigate to="/" />} />
          
          <Route path="/patient-dashboard" element={
            <ProtectedRoute user={user} allowedRoles={[UserRole.PATIENT]}>
              <DashboardPatient user={user!} />
            </ProtectedRoute>
          } />
          
          <Route path="/doctor-dashboard" element={
             <ProtectedRoute user={user} allowedRoles={[UserRole.DOCTOR]}>
              <DashboardDoctor user={user!} />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
             <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
              <DashboardAdmin />
            </ProtectedRoute>
          } />

          <Route path="/book" element={
             <ProtectedRoute user={user} allowedRoles={[UserRole.PATIENT]}>
              <BookAppointment user={user!} />
            </ProtectedRoute>
          } />

          <Route path="/chat/:appointmentId" element={
             <ProtectedRoute user={user}>
              <ChatPage user={user!} />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;