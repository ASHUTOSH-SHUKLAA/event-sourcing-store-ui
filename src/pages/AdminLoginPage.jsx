import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/useAuth';

const inputClass = 'h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-strong)] focus:ring-4 focus:ring-[var(--ring)] transition-all';

function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', adminPasscode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(form.email, form.password, form.adminPasscode);
      navigate('/admin/users', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Admin login failed. Check your credentials and passcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Admin Login"
      subtitle="Enter your credentials and admin passcode to access the dashboard."
      footer={(
        <Link className="text-sm font-bold text-[var(--accent-strong)] transition hover:brightness-110" to="/login">
          Back to user login
        </Link>
      )}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-red-500">{error}</div>
        )}
        <input className={inputClass} placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
        <input className={inputClass} placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
        <div>
          <input className={inputClass} placeholder="Admin Passcode" type="password" value={form.adminPasscode} onChange={(e) => setForm((prev) => ({ ...prev, adminPasscode: e.target.value }))} required />
          <p className="mt-2 text-xs text-[var(--text-secondary)]">Enter the admin passcode provided by your system administrator.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-[var(--accent-strong)] font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in as Admin'}
        </button>
      </form>
    </AuthShell>
  );
}

export default AdminLoginPage;
