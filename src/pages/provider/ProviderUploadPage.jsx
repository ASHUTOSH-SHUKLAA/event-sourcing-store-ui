import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import UserPill from '../../components/common/UserPill';
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
    <AppShell navItems={navItems} rightSlot={<UserPill label="C" />}>
      <div className="mx-auto max-w-4xl">
        <h2 className="text-6xl font-semibold text-[var(--text-primary)]">Upload Song</h2>
        <p className="mt-2 text-3xl text-[var(--text-secondary)]">Add song details to your catalog</p>
        <form onSubmit={submit} className="mt-8 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            {[
              ['title', 'Song Title', false],
              ['artist', 'Artist Name', false],
              ['album', 'Album Name', true],
              ['genre', 'Genre', true],
              ['release_year', 'Release Year', true],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-3xl font-medium text-[var(--text-primary)]">{label}</span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 text-2xl text-[var(--text-primary)] outline-none"
                  required={key === 'title' || key === 'artist'}
                />
              </label>
            ))}
          </div>
          <button type="submit" className="mt-8 rounded-full bg-[var(--green-500)] px-8 py-3 text-2xl font-semibold text-black shadow-[var(--shadow-soft)] hover:bg-[var(--green-600)] transition">
            Upload
          </button>
          {status && <p className="mt-3 text-xl text-[var(--green-500)]">{status}</p>}
        </form>
      </div>
    </AppShell>
  );
}

export default ProviderUploadPage;

