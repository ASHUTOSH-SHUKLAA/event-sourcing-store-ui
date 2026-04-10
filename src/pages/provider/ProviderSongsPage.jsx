import { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import UserPill from '../../components/common/UserPill';
import { getProviderSongs } from '../../api/appApi';

const navItems = [
  { to: '/provider/songs', label: 'My Songs' },
  { to: '/provider/upload', label: 'Upload' },
];

function ProviderSongsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getProviderSongs().then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <AppShell navItems={navItems} rightSlot={<UserPill label="C" />}>
      <h2 className="text-6xl font-semibold text-[var(--text-primary)]">My Songs</h2>
      <div className="mt-8 overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-5 border-b border-[var(--border)] bg-[var(--surface-alt)] px-6 py-4 text-2xl font-semibold text-[var(--text-primary)]">
          <span>Song Name</span>
          <span>Album</span>
          <span>Genre</span>
          <span>Release Year</span>
          <span>Upload Date</span>
        </div>
        {rows.map((row, index) => (
          <div key={`${row.title}-${index}`} className="grid grid-cols-5 border-b border-[var(--border)] px-6 py-4 text-2xl text-[var(--text-primary)]">
            <span>{row.title}</span>
            <span>{row.album || '-'}</span>
            <span>{row.genre || '-'}</span>
            <span>{row.release_year || '-'}</span>
            <span>{row.uploaded_at ? new Date(row.uploaded_at).toLocaleDateString() : '-'}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6"><StatusCard title="No uploaded songs yet" /></div>}
      </div>
    </AppShell>
  );
}

export default ProviderSongsPage;

