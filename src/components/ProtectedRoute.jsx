import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Wraps a route and redirects unauthenticated users to /login.
 * Requirement 5.1
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
