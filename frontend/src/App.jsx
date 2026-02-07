import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Camera, UserPlus, Home, Activity, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Attendance from './pages/Attendance';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Or unauthorized page
  }

  return children;
};

function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show navbar on login or register page
  if (location.pathname === '/login' || location.pathname === '/register') return null;

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 ${isActive
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
        >
          <Icon size={22} />
          <span className="font-semibold">{label}</span>
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 m-6"
    >
      <div className="glass-panel px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Camera className="text-white" size={28} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              DataCare HRMS
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles size={12} />
              {user ? `Welcome, ${user.name}` : 'Powered by AI Face Recognition'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role-based Navigation */}
          {user?.role === 'employee' && <NavLink to="/employee" icon={Home} label="Dashboard" />}
          {user?.role === 'manager' && <NavLink to="/manager" icon={Home} label="Manager Dashboard" />}
          {user?.role === 'admin' && <NavLink to="/admin" icon={Shield} label="Admin Panel" />}

          <NavLink to="/attendance" icon={Activity} label="Attendance" />

          {/* Only admin/manager can register new users? Or everyone? Keeping it open for now or restricted? */}
          {(user?.role === 'admin' || user?.role === 'manager') && <NavLink to="/register" icon={UserPlus} label="Register User" />}
        </div>
      </div>
    </motion.nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 -z-10 opacity-10"
        style={{
          backgroundImage: `
               linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
             `,
          backgroundSize: '50px 50px'
        }}>
      </div>

      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={
          <div className="pt-32 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                {/* Default route redirects based on role or to login - handled in ProtectedRoute or manual redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/employee" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/manager" element={
                  <ProtectedRoute allowedRoles={['manager', 'admin']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />

                <Route path="/attendance" element={
                  <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                    <Attendance />
                  </ProtectedRoute>
                } />


              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
