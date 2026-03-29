import { useContext } from 'react';
import AuthContext from './AuthContext';

/** Convenience hook for consuming auth state and actions. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
