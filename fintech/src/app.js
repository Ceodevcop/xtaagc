import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, getCurrentUser, getUserRole } from './firebase';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PhoneVerification from './pages/PhoneVerification';

// Main Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Airtime from './pages/Airtime';
import Bills from './pages/Bills';
import Betting from './pages/Betting';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';

// Agent Pages
import AgentPortal from './pages/agent/AgentPortal';
import PosOperations from './pages/agent/PosOperations';
import SubAgents from './pages/agent/SubAgents';
import Commission from './pages/agent/Commission';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import UserManagement from './pages/admin/UserManagement';
import AgentManagement from './pages/admin/AgentManagement';
import SystemSettings from './pages/admin/SystemSettings';

// Utility Pages
import Profile from './pages/Profile';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<PhoneVerification />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/airtime" element={
              <ProtectedRoute>
                <Airtime />
              </ProtectedRoute>
            } />
            
            <Route path="/bills" element={
              <ProtectedRoute>
                <Bills />
              </ProtectedRoute>
            } />
            
            <Route path="/betting" element={
              <ProtectedRoute>
                <Betting />
              </ProtectedRoute>
            } />
            
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Agent Routes */}
            <Route path="/agent" element={
              <ProtectedRoute requiredRole="agent">
                <AgentPortal />
              </ProtectedRoute>
            } />
            
            <Route path="/agent/pos" element={
              <ProtectedRoute requiredRole="agent">
                <PosOperations />
              </ProtectedRoute>
            } />
            
            <Route path="/agent/sub-agents" element={
              <ProtectedRoute requiredRole="agent">
                <SubAgents />
              </ProtectedRoute>
            } />
            
            <Route path="/agent/commission" element={
              <ProtectedRoute requiredRole="agent">
                <Commission />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/agents" element={
              <ProtectedRoute requiredRole="admin">
                <AgentManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <SystemSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
