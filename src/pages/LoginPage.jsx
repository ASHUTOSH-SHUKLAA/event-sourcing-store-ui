import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/useAuth';

const inputClass = 'h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-strong)] focus:ring-4 focus:ring-[var(--ring)] transition-all';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/app/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Event Vault account."
      footer={(
        <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-secondary)] font-medium">
          <p>
            No account?{' '}
            <Link className="font-bold text-[var(--accent-strong)] transition hover:brightness-110" to="/register">
              Register
            </Link>
          </p>
          <Link className="font-bold text-[var(--accent-strong)] transition hover:brightness-110" to="/admin-login">
            Admin Login
          </Link>
        </div>
      )}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          className={inputClass}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          className={inputClass}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-[var(--accent-strong)] font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
