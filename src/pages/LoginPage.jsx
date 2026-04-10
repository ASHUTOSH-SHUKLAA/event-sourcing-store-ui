import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/useAuth';

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
      subtitle="Sign in to your Event Sound account."
      footer={
        <div className="flex items-center justify-between">
          <p>
            No account?{' '}
            <Link className="font-semibold text-green-600 hover:text-green-700" to="/register">
              Register
            </Link>
          </p>
          <Link className="font-semibold text-green-600 hover:text-green-700" to="/admin-login">
            Admin Login
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] placeholder:text-green-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] placeholder:text-green-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-green-500 font-semibold text-white hover:bg-green-600 transition disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
