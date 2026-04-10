import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { register } from '../api/authApi';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords must match.';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password, form.confirmPassword);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, type, placeholder, extra = {}) => (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] placeholder:text-green-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
        required
        {...extra}
      />
      {fieldErrors[key] && <p className="mt-1 text-xs text-red-600">{fieldErrors[key]}</p>}
    </div>
  );

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Event Sound — free forever, upgrade anytime."
      footer={
        <p>
          Already have an account?{' '}
          <Link className="font-semibold text-green-600 hover:text-green-700" to="/login">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {field('name', 'text', 'Full name')}
        {field('email', 'email', 'Email address')}
        {field('password', 'password', 'Password', { minLength: 8 })}
        {field('confirmPassword', 'password', 'Confirm password', { minLength: 8 })}
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-green-500 font-semibold text-white hover:bg-green-600 transition disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
