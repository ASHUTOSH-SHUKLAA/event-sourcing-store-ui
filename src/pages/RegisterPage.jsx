import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { register } from '../api/authApi';

const inputClass = 'h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-strong)] focus:ring-4 focus:ring-[var(--ring)] transition-all';

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
    if (!form.name.trim()) {
      errors.name = 'Name is required.';
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords must match.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

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
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        className={inputClass}
        required
        {...extra}
      />
      {fieldErrors[key] && <p className="mt-1 text-xs text-red-500">{fieldErrors[key]}</p>}
    </div>
  );

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Event Vault - free forever, upgrade anytime."
      footer={(
        <p className="text-sm text-[var(--text-secondary)] font-medium">
          Already have an account?{' '}
          <Link className="font-bold text-[var(--accent-strong)] transition hover:brightness-110" to="/login">
            Sign in
          </Link>
        </p>
      )}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}
        {field('name', 'text', 'Full name')}
        {field('email', 'email', 'Email address')}
        {field('password', 'password', 'Password', { minLength: 8 })}
        {field('confirmPassword', 'password', 'Confirm password', { minLength: 8 })}
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-[var(--accent-strong)] font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
