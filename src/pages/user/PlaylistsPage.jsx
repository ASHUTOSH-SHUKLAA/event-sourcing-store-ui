import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import UserPill from '../../components/common/UserPill';
import TrackRow from '../../components/music/TrackRow';
import { createPlaylist, getPlaylists } from '../../api/appApi';
import { getCatalogPlaylists, getCatalogSongs } from '../../api/catalogApi';
import { useSubscription } from '../../context/SubscriptionContext';

const navItems = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/liked', label: 'Liked Songs' },
  { to: '/app/playlists', label: 'Playlists' },
  { to: '/app/player', label: 'Mixes' },
];

function PlaylistsPage() {
  const { isPremium } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [discoveryPlaylists, setDiscoveryPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const load = async () => {
    const [list, songs, curated] = await Promise.all([getPlaylists(), getCatalogSongs(), getCatalogPlaylists()]);
    setPlaylists(list);
    setTracks(songs);
    setDiscoveryPlaylists(curated);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    if (!newPlaylistName.trim()) {
      return;
    }
    await createPlaylist(newPlaylistName.trim(), tracks.slice(0, 4).map((track) => track.id));
    setNewPlaylistName('');
    await load();
  };

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={isPremium ? handleSearchChange : undefined}
      searchPlaceholder="Search songs, artists, albums..."
      rightSlot={
        <div className="flex items-center gap-3">
          <Link
            to="/app/subscription"
            className={isPremium
              ? 'rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600'
              : 'rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-alt)]'}
          >
            Premium
          </Link>
          <UserPill label="U" />
        </div>
      }
    >
      <h2 className="text-6xl font-semibold">Playlists</h2>
      <p className="mt-2 text-2xl text-[var(--text-secondary)]">
        Playlist discovery from Deezer and custom playlists from your events flow.
      </p>
      <div className="mt-6 flex gap-3">
        <input
          value={newPlaylistName}
          onChange={(event) => setNewPlaylistName(event.target.value)}
          placeholder="New playlist name"
          className="h-12 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-lg text-[var(--text-primary)] outline-none"
        />
        <button onClick={onCreate} className="rounded-full bg-emerald-500 px-6 text-lg font-semibold text-white">
          Create
        </button>
      </div>

      <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-3xl font-semibold">Your Playlists</h3>
        {playlists.length === 0 && <div className="mt-4"><StatusCard title="No playlists yet" /></div>}
        {playlists.length > 0 && (
          <div className="mt-4 space-y-3">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <p className="text-2xl font-semibold">{playlist.name}</p>
                <p className="text-xl text-[var(--text-secondary)]">{playlist.song_ids.length} songs</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-3xl font-semibold">Trending Playlists</h3>
        {discoveryPlaylists.length === 0 && <div className="mt-4"><StatusCard title="No playlist suggestions available" /></div>}
        {discoveryPlaylists.length > 0 && (
          <div className="mt-4 grid gap-4 xl:grid-cols-3 md:grid-cols-2">
            {discoveryPlaylists.slice(0, 6).map((playlist) => (
              <article key={playlist.id} className="rounded-2xl border border-[var(--border)] p-3">
                <img src={playlist.artwork} alt={playlist.title} className="h-40 w-full rounded-2xl object-cover" />
                <p className="mt-3 text-2xl font-semibold">{playlist.title}</p>
                <p className="text-lg text-[var(--text-secondary)]">{playlist.curator}</p>
                <p className="text-lg text-[var(--text-secondary)]">{playlist.track_count} tracks</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h3 className="px-4 py-3 text-3xl font-semibold">Available Songs</h3>
        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} />
        ))}
        {tracks.length === 0 && <StatusCard title="No songs available for playlist creation" />}
      </section>
    </AppShell>
  );
}

export default PlaylistsPage;
