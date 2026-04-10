import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ToastProvider } from './components/common/Toast';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ServiceLoginPage from './pages/ServiceLoginPage';

// User pages
import HomePage from './pages/user/HomePage';
import PremiumHomePage from './pages/user/PremiumHomePage';
import SearchPage from './pages/user/SearchPage';
import LikedSongsPage from './pages/user/LikedSongsPage';
import SubscriptionPage from './pages/user/SubscriptionPage';
import EventLogPage from './pages/user/EventLogPage';
import EventDebuggerPage from './pages/user/EventDebuggerPage';

import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSongsPage from './pages/admin/AdminSongsPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';

// Provider pages
import ProviderUploadPage from './pages/provider/ProviderUploadPage';
import ProviderSongsPage from './pages/provider/ProviderSongsPage';

function HomeRedirect() {
  const { isAuthenticated, isBootstrapping, role } = useAuth();
  if (isBootstrapping) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'admin') {
    return <Navigate to="/admin/users" replace />;
  }
  if (role === 'provider') {
    return <Navigate to="/provider/songs" replace />;
  }
  return <Navigate to="/app/home" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/service-login" element={<ServiceLoginPage />} />

      {/* User routes */}
      <Route path="/app/home" element={<ProtectedRoute allowedRoles={['user']}><HomePage /></ProtectedRoute>} />
      <Route path="/app/premium" element={<ProtectedRoute allowedRoles={['user']}><PremiumHomePage /></ProtectedRoute>} />
      <Route path="/app/search" element={<ProtectedRoute allowedRoles={['user']}><SearchPage /></ProtectedRoute>} />
      <Route path="/app/liked" element={<ProtectedRoute allowedRoles={['user']}><LikedSongsPage /></ProtectedRoute>} />
      <Route path="/app/subscription" element={<ProtectedRoute allowedRoles={['user']}><SubscriptionPage /></ProtectedRoute>} />
      <Route path="/app/subscription/events" element={<ProtectedRoute allowedRoles={['user']}><EventLogPage /></ProtectedRoute>} />
      <Route path="/app/events" element={<ProtectedRoute allowedRoles={['user']}><EventDebuggerPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/songs" element={<ProtectedRoute allowedRoles={['admin']}><AdminSongsPage /></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptionsPage /></ProtectedRoute>} />

      {/* Provider routes */}
      <Route path="/provider/upload" element={<ProtectedRoute allowedRoles={['provider']}><ProviderUploadPage /></ProtectedRoute>} />
      <Route path="/provider/songs" element={<ProtectedRoute allowedRoles={['provider']}><ProviderSongsPage /></ProtectedRoute>} />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <SubscriptionProvider>
            <AppRoutes />
          </SubscriptionProvider>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
