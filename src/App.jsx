import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlayerProvider } from './context/PlayerContext';
import { ToastProvider } from './components/common/Toast';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

// User pages
import HomePage from './pages/user/HomePage';
import PremiumHomePage from './pages/user/PremiumHomePage';
import SearchPage from './pages/user/SearchPage';
import LikedSongsPage from './pages/user/LikedSongsPage';
import PlayerPage from './pages/user/PlayerPage';
import SubscriptionPage from './pages/user/SubscriptionPage';
import EventLogPage from './pages/user/EventLogPage';

import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSongsPage from './pages/admin/AdminSongsPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminUserEventsPage from './pages/admin/AdminUserEventsPage';

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
  return <Navigate to="/app/home" replace />;
}

import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />

      {/* User routes with persistent layout */}
      <Route path="/app" element={<ProtectedRoute allowedRoles={['user']}><UserLayout /></ProtectedRoute>}>
        <Route path="home" element={<HomePage />} />
        <Route path="premium" element={<PremiumHomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="liked" element={<LikedSongsPage />} />

        <Route path="player" element={<PlayerPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="subscription/events" element={<EventLogPage />} />
      </Route>

      {/* Admin routes with persistent layout */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id/events" element={<AdminUserEventsPage />} />
        <Route path="songs" element={<AdminSongsPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <SubscriptionProvider>
              <PlayerProvider>
                <AppRoutes />
              </PlayerProvider>
            </SubscriptionProvider>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
