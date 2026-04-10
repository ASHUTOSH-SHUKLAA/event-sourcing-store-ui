import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import TrackCard from '../../components/music/TrackCard';
import StatusCard from '../../components/common/StatusCard';
import PremiumGate from '../../components/common/PremiumGate';
import UserPill from '../../components/common/UserPill';
import { useSubscription } from '../../context/SubscriptionContext';
import { useToast } from '../../components/common/Toast';
import { likeSong, unlikeSong } from '../../api/appApi';
import { getTopTracks } from '../../api/itunesApi';
import { recordPlay, getPlayCounts } from '../../api/subscriptionApi';

const HOME_DISCOVERY_SEEDS = ['pop', 'dance', 'rock', 'hip hop', 'r&b', 'indie', 'electronic', 'soul', 'chill'];

function HomePage() {
  const { isPremium } = useSubscription();
  const { fireToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/app/home', label: 'Home' },
    { to: '/app/subscription/events', label: 'Event Log' },
    { to: '/app/events', label: 'Events Debugger' },
  ];

  const [homeSearch, setHomeSearch] = useState('');
  const [tracks, setTracks] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [playCountMap, setPlayCountMap] = useState({});
  const [upgradePromptMap, setUpgradePromptMap] = useState({});
  const [likeErrors, setLikeErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const seed = HOME_DISCOVERY_SEEDS[Math.floor(Math.random() * HOME_DISCOVERY_SEEDS.length)];

    try {
      const [songs, counts] = await Promise.all([getTopTracks(seed, 12), getPlayCounts()]);
      setTracks(songs);
      setPlayCountMap(counts.data || {});
    } catch (err) {
      setError(err.message || 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === '/app/home') {
      load();
    }
  }, [location.pathname]);

  const handleHomeSearchChange = (value) => {
    setHomeSearch(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const toggleLike = async (track) => {
    if (!isPremium) {
      setUpgradePromptMap((prev) => ({ ...prev, [track.id]: true }));
      return;
    }
    const wasLiked = Boolean(likedMap[track.id]);
    setLikedMap((prev) => ({ ...prev, [track.id]: !wasLiked }));
    setLikeErrors((prev) => ({ ...prev, [track.id]: null }));
    try {
      if (wasLiked) {
        await unlikeSong(track.id);
      } else {
        await likeSong(track);
        fireToast('Event fired: LikedSong');
      }
    } catch {
      setLikedMap((prev) => ({ ...prev, [track.id]: wasLiked }));
      setLikeErrors((prev) => ({ ...prev, [track.id]: 'Failed - tap to retry' }));
    }
  };

  const playTrack = async (track) => {
    setPlayCountMap((prev) => ({ ...prev, [track.id]: (prev[track.id] || 0) + 1 }));
    try {
      await recordPlay(track.id);
      fireToast('Event fired: SongPlayed');
    } catch {
      setPlayCountMap((prev) => ({ ...prev, [track.id]: Math.max(0, (prev[track.id] || 1) - 1) }));
    }
  };

  return (
    <AppShell
      navItems={navItems}
      searchValue={isPremium ? homeSearch : ''}
      onSearchChange={isPremium ? handleHomeSearchChange : undefined}
      searchPlaceholder="Search songs, artists, albums..."
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Popular Songs</h3>
          <p className="text-sm text-[var(--text-secondary)]">Curated for your listening.</p>
        </div>
        <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">Powered by iTunes</span>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-3xl border border-red-600/30 bg-[rgba(220,38,38,0.12)] px-4 py-3 text-sm text-red-200">
          <p className="flex-1">{error}</p>
          <button onClick={load} className="rounded-2xl border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/10">Retry</button>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-[28px] bg-[var(--surface-alt)]" />
          ))}
        </div>
      )}

      {!loading && !error && tracks.length === 0 && (
        <StatusCard title="No songs found" subtitle="Check your connection and retry." />
      )}

      {!loading && tracks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tracks.map((track) => (
            <div key={track.id}>
              <TrackCard
                track={track}
                liked={Boolean(likedMap[track.id])}
                onToggleLike={toggleLike}
                onPlay={playTrack}
                playCount={playCountMap[track.id] || 0}
              />
              {upgradePromptMap[track.id] && (
                <div className="mt-2"><PremiumGate variant="inline" /></div>
              )}
              {likeErrors[track.id] && (
                <p className="mt-1 cursor-pointer text-xs text-red-300 underline" onClick={() => toggleLike(track)}>
                  {likeErrors[track.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default HomePage;
