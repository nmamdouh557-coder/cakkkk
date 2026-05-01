import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OffersPage from './pages/OffersPage';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import AddOffer from './pages/AddOffer';
import EditOffer from './pages/EditOffer';

const PrivateRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin"></div>
  </div>;
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin"></div>
  </div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><OffersPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute adminOnly><UserManagement /></PrivateRoute>} />
      <Route path="/add" element={<PrivateRoute adminOnly><AddOffer /></PrivateRoute>} />
      <Route path="/edit/:id" element={<PrivateRoute adminOnly><EditOffer /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
