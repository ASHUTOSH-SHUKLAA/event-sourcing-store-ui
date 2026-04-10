import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import PremiumGate from '../../components/common/PremiumGate';
import UserPill from '../../components/common/UserPill';
import TrackCard from '../../components/music/TrackCard';
import { useSubscription } from '../../context/SubscriptionContext';
import { useToast } from '../../components/common/Toast';
import { getLikedSongs, likeSong, unlikeSong } from '../../api/appApi';
import { searchTracks } from '../../api/itunesApi';

function SearchPage() {
  const { isPremium } = useSubscription();
  const { fireToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const navItems = [
    { to: '/app/home', label: 'Home' },
    { to: '/app/subscription/events', label: 'Event Log' },
    { to: '/app/events', label: 'Events Debugger' },
  ];

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [tracks, setTracks] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [upgradePromptMap, setUpgradePromptMap] = useState({});
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isPremium) {
      return;
    }

    let isMounted = true;
    const loadLikedSongs = async () => {
      try {
        const likedSongs = await getLikedSongs();
        if (!isMounted) {
          return;
        }
        setLikedMap(likedSongs.reduce((acc, item) => {
          acc[item.id] = true;
          return acc;
        }, {}));
      } catch {
        // ignore liked-state load failures
      }
    };

    loadLikedSongs();
    return () => {
      isMounted = false;
    };
  }, [isPremium]);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchTerm(query);
  }, [searchParams]);

  useEffect(() => {
    if (!isPremium) {
      return;
    }
    if (searchTerm.length < 2) {
      setTracks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchTracks(searchTerm, 20);
        setTracks(results);
      } catch {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, isPremium]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setSearchParams(value ? { q: value } : {});
  };

  const toggleLike = async (track) => {
    if (!isPremium) {
      setUpgradePromptMap((prev) => ({ ...prev, [track.id]: true }));
      return;
    }

    const wasLiked = Boolean(likedMap[track.id]);
    setLikedMap((prev) => ({ ...prev, [track.id]: !wasLiked }));
    try {
      if (wasLiked) {
        await unlikeSong(track.id);
      } else {
        await likeSong(track);
        fireToast('Event fired: LikedSong');
      }
    } catch {
      setLikedMap((prev) => ({ ...prev, [track.id]: wasLiked }));
    }
  };

  if (!isPremium) {
    return (
      <AppShell navItems={navItems} rightSlot={<UserPill label="U" />}>
        <PremiumGate variant="fullscreen" message="Search requires a Premium subscription." />
      </AppShell>
    );
  }

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
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
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-[28px] bg-[var(--surface-alt)]" />
          ))}
        </div>
      )}

      {!loading && searchTerm.length >= 2 && tracks.length === 0 && (
        <StatusCard title="No results found" subtitle={`No songs matched "${searchTerm}"`} />
      )}

      {!loading && tracks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tracks.map((track) => (
            <div key={track.id}>
              <TrackCard
                track={track}
                liked={Boolean(likedMap[track.id])}
                onToggleLike={toggleLike}
              />
              {upgradePromptMap[track.id] && (
                <div className="mt-2"><PremiumGate variant="inline" /></div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default SearchPage;
