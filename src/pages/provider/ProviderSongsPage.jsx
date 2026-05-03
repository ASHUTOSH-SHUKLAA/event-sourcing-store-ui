import { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import HeaderActions from '../../components/common/HeaderActions';
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
    <AppShell navItems={navItems} rightSlot={<HeaderActions pillLabel="C" />}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl lg:text-5xl">My Songs</h2>
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            Track the songs you have already added to the catalog.
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
          {rows.length} song{rows.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-8 overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="hidden overflow-x-auto md:block">
          <div className="grid min-w-[760px] grid-cols-5 border-b border-[var(--border)] bg-[var(--surface-alt)] px-6 py-4 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            <span>Song Name</span>
            <span>Album</span>
            <span>Genre</span>
            <span>Release Year</span>
            <span>Upload Date</span>
          </div>
          {rows.map((row, index) => (
            <div key={`${row.title}-${index}`} className="grid min-w-[760px] grid-cols-5 border-b border-[var(--border)] px-6 py-4 text-sm text-[var(--text-primary)]">
              <span>{row.title}</span>
              <span>{row.album || '-'}</span>
              <span>{row.genre || '-'}</span>
              <span>{row.release_year || '-'}</span>
              <span>{row.uploaded_at ? new Date(row.uploaded_at).toLocaleDateString() : '-'}</span>
            </div>
          ))}
        </div>

        <div className="divide-y divide-[var(--border)] md:hidden">
          {rows.map((row, index) => (
            <div key={`${row.title}-${index}`} className="space-y-3 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">{row.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{row.album || 'No album'}</p>
                </div>
                <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  {row.genre || 'Unknown genre'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <span>Release {row.release_year || '-'}</span>
                <span>Uploaded {row.uploaded_at ? new Date(row.uploaded_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="p-6">
            <StatusCard title="No uploaded songs yet" />
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default ProviderSongsPage;
