import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, KeyRound, PencilLine } from 'lucide-react';
import { changePassword, getProfile, updateProfile } from '../../api/userApi';
import { useAuth } from '../../context/useAuth';

const inputClass = 'h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(61,220,151,0.16)] transition';

function ProfileModal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
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
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [nameValue, setNameValue] = useState('');
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
    let active = true;

    getProfile()
      .then((response) => {
        if (!active) {
          return;
        }
        const nextProfile = response.data?.data ?? response.data;
        setProfile(nextProfile);
        setNameValue(nextProfile?.display_name || '');
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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
    () => profile?.display_name?.trim() || profile?.email?.trim() || label,
    [profile, label],
  );
  const initial = (displayName[0] || label[0] || 'U').toUpperCase();

  const openNameModal = () => {
    setMenuOpen(false);
    setNameError('');
    setSuccessMessage('');
    setNameValue(profile?.display_name || '');
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
      setProfile(nextProfile);
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
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shadow-[var(--shadow-soft)] hover:bg-[var(--surface-alt)]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green-500)] text-sm font-bold text-black">
            {initial}
          </div>
          <ChevronDown className={`h-4 w-4 text-[var(--text-secondary)] transition ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-40 mt-3 w-72 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-card)]">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Profile</p>
              <p className="mt-2 text-base font-bold text-[var(--text-primary)]">{loading ? 'Loading...' : displayName}</p>
              {profile?.email && <p className="text-sm text-[var(--text-secondary)]">{profile.email}</p>}
            </div>

            {successMessage && (
              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[rgba(61,220,151,0.12)] px-3 py-2 text-sm text-[var(--green-500)]">
                {successMessage}
              </div>
            )}

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={openNameModal}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-alt)]"
              >
                <PencilLine className="h-4 w-4 text-[var(--green-500)]" />
                Name
              </button>
              <button
                type="button"
                onClick={openPasswordModal}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-alt)]"
              >
                <KeyRound className="h-4 w-4 text-[var(--green-500)]" />
                Change Password
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-2xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {showNameModal && (
        <ProfileModal title="Update name" subtitle="This controls the initial and display name in your profile menu." onClose={() => setShowNameModal(false)}>
          <form className="space-y-4" onSubmit={handleSaveName}>
            <input
              value={nameValue}
              onChange={(event) => setNameValue(event.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
            {nameError && <p className="text-sm text-red-400">{nameError}</p>}
            <button
              type="submit"
              disabled={savingName}
              className="w-full rounded-xl bg-[var(--green-500)] px-4 py-3 text-sm font-semibold text-black hover:bg-[var(--green-600)] disabled:opacity-60"
            >
              {savingName ? 'Saving...' : 'Save Name'}
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
            {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full rounded-xl bg-[var(--green-500)] px-4 py-3 text-sm font-semibold text-black hover:bg-[var(--green-600)] disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </ProfileModal>
      )}
    </>
  );
}

export default UserPill;
