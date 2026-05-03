import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, KeyRound, PencilLine, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { changePassword, getProfile, updateProfile } from '../../api/userApi';
import { useAuth } from '../../context/useAuth';

const inputClass = 'h-11 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-strong)] focus:ring-4 focus:ring-[var(--ring)]';

function ProfileModal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
            {subtitle && <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function UserPill({ label = 'U' }) {
  const { logout, user, setUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [nameValue, setNameValue] = useState(user?.display_name || '');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const displayName = useMemo(
    () => user?.display_name?.trim() || user?.email?.trim() || label,
    [user, label],
  );
  const initial = (displayName[0] || label[0] || 'U').toUpperCase();

  const openNameModal = () => {
    setMenuOpen(false);
    setNameError('');
    setSuccessMessage('');
    setNameValue(user?.display_name || '');
    setShowNameModal(true);
  };

  const openPasswordModal = () => {
    setMenuOpen(false);
    setPasswordError('');
    setSuccessMessage('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleSaveName = async (event) => {
    event.preventDefault();
    const trimmedName = nameValue.trim();
    if (!trimmedName) {
      setNameError('Name is required.');
      return;
    }

    setSavingName(true);
    setNameError('');
    try {
      const response = await updateProfile(trimmedName);
      const nextProfile = response.data?.data ?? response.data;
      setUser(nextProfile);
      setSuccessMessage('Name updated successfully.');
      setShowNameModal(false);
    } catch (error) {
      setNameError(error.response?.data?.error || 'Unable to update name right now.');
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password must match.');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');
    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword,
      );
      setSuccessMessage('Password changed successfully.');
      setShowPasswordModal(false);
    } catch (error) {
      setPasswordError(error.response?.data?.error || 'Unable to change password right now.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="relative z-40" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-strong)] text-sm font-bold text-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-card)]"
        >
          {initial}
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-40 mt-3 w-80 rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-3 shadow-[var(--shadow-card)] backdrop-blur-xl">
            <div className="rounded-[22px] bg-[var(--surface-highlight)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">Profile</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{displayName}</p>
              {user?.email && <p className="mt-1 text-sm text-[var(--text-secondary)]">{user.email}</p>}
            </div>

            {successMessage && (
              <div className="mt-3 rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent-strong)]">
                {successMessage}
              </div>
            )}

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={openNameModal}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border)] hover:bg-[var(--surface)]"
              >
                <PencilLine className="h-4 w-4 text-[var(--accent-strong)]" />
                Edit name
              </button>
              <button
                type="button"
                onClick={openPasswordModal}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border)] hover:bg-[var(--surface)]"
              >
                <KeyRound className="h-4 w-4 text-[var(--accent-strong)]" />
                Change password
              </button>
              <Link
                to="/app/subscription"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border)] hover:bg-[var(--surface)]"
              >
                <CreditCard className="h-4 w-4 text-[var(--accent-strong)]" />
                Manage Subscription
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-2xl bg-[var(--accent-strong)] px-3 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95 shadow-[var(--shadow-soft)]"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {showNameModal && (
        <ProfileModal title="Update name" subtitle="Change the display name shown in your workspace." onClose={() => setShowNameModal(false)}>
          <form className="space-y-4" onSubmit={handleSaveName}>
            <input
              value={nameValue}
              onChange={(event) => setNameValue(event.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            <button
              type="submit"
              disabled={savingName}
              className="w-full rounded-2xl bg-[var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-60"
            >
              {savingName ? 'Saving...' : 'Save name'}
            </button>
          </form>
        </ProfileModal>
      )}

      {showPasswordModal && (
        <ProfileModal title="Change password" subtitle="Use your current password to set a new one." onClose={() => setShowPasswordModal(false)}>
          <form className="space-y-4" onSubmit={handleSavePassword}>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              placeholder="Current password"
              className={inputClass}
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              placeholder="New password"
              className={inputClass}
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              placeholder="Confirm password"
              className={inputClass}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full rounded-2xl bg-[var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </ProfileModal>
      )}
    </>
  );
}

export default UserPill;
