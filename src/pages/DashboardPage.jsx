import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getProfile } from '../api/userApi';

/**
 * Protected dashboard — fetches and displays the user's profile.
 * Logout clears AuthContext and redirects to /login.
 * Requirements 4.1, 5.5
 */
function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res.data.data))
      .catch(() => setError('Failed to load profile.'));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Dashboard</h2>

        {error && <p style={styles.error} role="alert">{error}</p>}

        {profile ? (
          <dl style={styles.dl}>
            <dt style={styles.dt}>Email</dt>
            <dd style={styles.dd}>{profile.email}</dd>

            <dt style={styles.dt}>Display name</dt>
            <dd style={styles.dd}>{profile.display_name || '—'}</dd>

            <dt style={styles.dt}>Member since</dt>
            <dd style={styles.dd}>{new Date(profile.created_at).toLocaleDateString()}</dd>
          </dl>
        ) : (
          !error && <p>Loading profile…</p>
        )}

        <button onClick={handleLogout} style={styles.button}>
          Log out
        </button>
      </div>
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
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  title: { margin: 0 },
  dl: { margin: 0 },
  dt: { fontWeight: 600, fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' },
  dd: { margin: '0.1rem 0 0', fontSize: '1rem' },
  button: { padding: '0.6rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '4px', marginTop: '0.5rem' },
  error: { color: '#c53030', margin: 0, fontSize: '0.9rem' },
};

export default DashboardPage;
