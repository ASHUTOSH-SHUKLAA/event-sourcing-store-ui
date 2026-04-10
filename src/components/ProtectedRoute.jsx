import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-soft)]">
          Restoring your session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'admin') {
      return <Navigate to="/admin/users" replace />;
    }
    if (role === 'provider') {
      return <Navigate to="/provider/songs" replace />;
    }
    return <Navigate to="/app/home" replace />;
  }

  return children;
}

export default ProtectedRoute;

