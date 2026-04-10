import { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import UserPill from '../../components/common/UserPill';
import { getAdminSongs } from '../../api/appApi';
import { MOCK_PLAY_COUNTS } from '../../data/mockSubscriptions';

const navItems = [
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/songs', label: 'Songs Monitoring' },
  { to: '/admin/subscriptions', label: 'Subscription Monitoring' },
];

// Mock songs for demo
const MOCK_SONGS = [
  { id: '1440857781', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', plays: 42, likes: 18 },
  { id: '1440857782', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', plays: 17, likes: 9 },
  { id: '1440857783', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', plays: 8, likes: 4 },
  { id: '1440857784', title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3', plays: 5, likes: 2 },
  { id: '1440857785', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', plays: 3, likes: 1 },
];

function AdminSongsPage() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminSongs()
      .then((data) => {
        if (data.length) {
          setSongs(data);
        } else {
          // Merge mock play counts into mock songs
          const enriched = MOCK_SONGS.map((s) => ({
            ...s,
            plays: MOCK_PLAY_COUNTS[s.id] ?? s.plays,
          }));
          setSongs(enriched);
        }
      })
      .catch(() => setSongs(MOCK_SONGS));
  }, []);

  const filtered = songs.filter((s) =>
    [s.title, s.artist, s.album].some((v) => (v || '').toLowerCase().includes(search.toLowerCase()))
  );

  const totalPlays = songs.reduce((sum, s) => sum + (s.plays || 0), 0);
  const totalLikes = songs.reduce((sum, s) => sum + (s.likes || 0), 0);

  return (
    <AppShell
      navItems={navItems}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search songs, artists…"
      rightSlot={<UserPill label="A" />}
    >
      <h2 className="text-3xl font-bold text-[var(--text-primary)]">Songs Monitoring</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Track plays and engagement across the catalog.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{songs.length}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Total Songs</p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-3xl font-bold text-[var(--green-500)]">{totalPlays}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Total Plays</p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{totalLikes}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Total Likes</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface-alt)] px-6 py-3">
          <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            {filtered.length} song{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Title', 'Artist', 'Album', 'Plays', 'Likes'].map((h) => (
                <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((song) => (
              <tr key={song.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-alt)] transition">
                <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{song.title}</td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{song.artist}</td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{song.album || '—'}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-[rgba(61,220,151,0.14)] px-2.5 py-1 text-xs font-semibold text-[var(--green-500)]">
                    ▶ {song.plays || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{song.likes || 0}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
                  No songs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

export default AdminSongsPage;
