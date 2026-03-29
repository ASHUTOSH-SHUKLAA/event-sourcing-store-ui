import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';

/**
 * Registration page — email + password form.
 * On success redirects to /login.
 * Displays validation errors returned by the API.
 * Requirement 5.3
 */
function RegisterPage() {
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
      await register(email, password);
      navigate('/login', { replace: true });
    } catch (err) {
      const apiError = err.response?.data?.error;
      setError(apiError || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Create account</h2>

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
          minLength={8}
          autoComplete="new-password"
          style={styles.input}
        />
        <small style={styles.hint}>Minimum 8 characters</small>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating account…' : 'Register'}
        </button>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Sign in</Link>
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
  hint: { color: '#718096', marginTop: '-0.5rem' },
  button: { padding: '0.6rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '4px' },
  error: { color: '#c53030', margin: 0, fontSize: '0.9rem' },
  link: { textAlign: 'center', fontSize: '0.9rem', margin: 0 },
};

export default RegisterPage;
