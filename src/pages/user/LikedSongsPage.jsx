import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import PremiumGate from '../../components/common/PremiumGate';
import UserPill from '../../components/common/UserPill';
import TrackRow from '../../components/music/TrackRow';
import { getLikedSongs, unlikeSong } from '../../api/appApi';
import { useSubscription } from '../../context/SubscriptionContext';

const navItems = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/liked', label: 'Liked Songs' },
  { to: '/app/subscription/events', label: 'Event Log' },
  { to: '/app/events', label: 'Events Debugger' },
];

function LikedSongsPage() {
  const { isPremium } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const liked = await getLikedSongs();
    setSongs([...new Map(liked.map((item) => [item.id, item])).values()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }
    load();
  }, [isPremium]);

  if (!isPremium) {
    return (
      <AppShell
        navItems={navItems}
        rightSlot={(
          <div className="flex items-center gap-3">
            <Link
              to="/app/subscription"
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-strong)]"
            >
              Premium
            </Link>
            <UserPill label="U" />
          </div>
        )}
      >
        <PremiumGate message="Liked songs require a Premium subscription." />
      </AppShell>
    );
  }

  const filtered = songs.filter((song) =>
    [song.title, song.artist, song.album].some((value) => (value || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onUnlike = async (track) => {
    await unlikeSong(track.id);
    setSongs((prev) => prev.filter((item) => item.id !== track.id));
  };

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      rightSlot={
        <div className="flex items-center gap-3">
          <Link
            to="/app/subscription"
            className={isPremium
              ? 'rounded-3xl bg-[var(--green-500)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[var(--green-600)]'
              : 'rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-strong)]'}
          >
            Premium
          </Link>
          <UserPill label="U" />
        </div>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-4xl font-semibold text-[var(--text-primary)]">Liked Songs</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Your premium favorites, organized for easy playback and discovery.</p>
        </div>
        <span className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
          {songs.length} saved song{songs.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        {loading && <StatusCard title="Loading liked songs..." />}
        {!loading && filtered.length === 0 && (
          <StatusCard
            title={searchTerm ? 'No liked songs matched your search' : 'No liked songs yet'}
            subtitle={searchTerm ? 'Try a different search term or clear the search bar.' : 'Like songs from Home or Search.'}
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {searchTerm && (
              <div className="rounded-3xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)] shadow-sm">
                Showing {filtered.length} result{filtered.length === 1 ? '' : 's'} for "{searchTerm}"
              </div>
            )}
            <div className="space-y-3">
              {filtered.map((track) => (
                <TrackRow key={track.id} track={track} liked onToggleLike={onUnlike} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default LikedSongsPage;
