import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Login page — email + password form.
 * On success stores the access token via AuthContext and redirects to /dashboard.
 * Displays an error message on 401 or any API failure.
 * Requirements 5.1, 5.2
 */
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Sign in</h2>

        {error && <p style={styles.error} role="alert">{error}</p>}

        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={styles.input}
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={styles.link}>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    maxWidth: '360px',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  title: { margin: '0 0 0.5rem', textAlign: 'center' },
  label: { fontWeight: 500, fontSize: '0.9rem' },
  input: { padding: '0.5rem 0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #cbd5e0' },
  button: { padding: '0.6rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '4px' },
  error: { color: '#c53030', margin: 0, fontSize: '0.9rem' },
  link: { textAlign: 'center', fontSize: '0.9rem', margin: 0 },
};

export default LoginPage;
