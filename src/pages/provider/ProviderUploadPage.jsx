import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import HeaderActions from '../../components/common/HeaderActions';
import { uploadProviderSong } from '../../api/appApi';

const navItems = [
  { to: '/provider/songs', label: 'My Songs' },
  { to: '/provider/upload', label: 'Upload' },
];

function ProviderUploadPage() {
  const [form, setForm] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    release_year: '',
  });
  const [status, setStatus] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    await uploadProviderSong(form);
    setStatus('Song metadata uploaded');
    setForm({ title: '', artist: '', album: '', genre: '', release_year: '' });
  };

  return (
    <AppShell navItems={navItems} rightSlot={<HeaderActions pillLabel="C" />}>
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl lg:text-5xl">Upload Song</h2>
        <p className="mt-2 text-base text-[var(--text-secondary)] sm:text-lg">Add song details to your catalog</p>
        <form onSubmit={submit} className="mt-8 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="space-y-6">
            {[
              ['title', 'Song Title'],
              ['artist', 'Artist Name'],
              ['album', 'Album Name'],
              ['genre', 'Genre'],
              ['release_year', 'Release Year'],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-base font-medium text-[var(--text-primary)] sm:text-lg">{label}</span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-2 h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-strong)] focus:ring-4 focus:ring-[var(--ring)] sm:h-14 sm:text-base"
                  required={key === 'title' || key === 'artist'}
                />
              </label>
            ))}
          </div>
          <button type="submit" className="mt-8 rounded-full bg-[var(--accent-strong)] px-6 py-3 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--accent)] sm:px-8 sm:text-lg">
            Upload
          </button>
          {status && <p className="mt-3 text-sm text-[var(--accent-strong)] sm:text-base">{status}</p>}
        </form>
      </div>
    </AppShell>
  );
}

export default ProviderUploadPage;
