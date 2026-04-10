import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/useAuth';

function ServiceLoginPage() {
  const { loginService } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await loginService(form.email, form.password);
      navigate('/provider/songs', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Service login failed');
    }
  };

  return (
    <AuthShell
      title="Service Login"
      subtitle="Authenticate as content provider to manage songs."
      footer={<Link className="font-semibold text-emerald-700" to="/login">Back to user login</Link>}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}
        <input className="h-12 w-full rounded-2xl border border-[var(--border)] px-4" placeholder="Service email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input className="h-12 w-full rounded-2xl border border-[var(--border)] px-4" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        <button className="h-12 w-full rounded-full bg-emerald-500 font-semibold text-white">Sign in as Service</button>
      </form>
    </AuthShell>
  );
}

export default ServiceLoginPage;

