import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/useAuth';

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

  const inputClass = 'h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] placeholder:text-green-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition';

  return (
    <AuthShell
      title="Admin Login"
      subtitle="Enter your credentials and admin passcode to access the dashboard."
      footer={
        <Link className="font-semibold text-green-600 hover:text-green-700" to="/login">
          ← Back to user login
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <input className={inputClass} placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input className={inputClass} placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        <div>
          <input className={inputClass} placeholder="Admin Passcode" type="password" value={form.adminPasscode} onChange={(e) => setForm((p) => ({ ...p, adminPasscode: e.target.value }))} required />
          <p className="mt-1 text-xs text-green-600">Enter the admin passcode provided by your system administrator.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-green-500 font-semibold text-white hover:bg-green-600 transition disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in as Admin'}
        </button>
      </form>
    </AuthShell>
  );
}

export default AdminLoginPage;
