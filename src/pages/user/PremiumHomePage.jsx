import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, List, Activity } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import TrackCard from '../../components/music/TrackCard';
import StatusCard from '../../components/common/StatusCard';
import HeaderActions from '../../components/common/HeaderActions';
import MusicPlayer from '../../components/music/MusicPlayer';
import { getLikedSongs, likeSong, postPlayerEvent, unlikeSong } from '../../api/appApi';
import { getCatalogSongs } from '../../api/catalogApi';
import { usePlayer } from '../../context/PlayerContext';
import { RefreshCw } from 'lucide-react';

let premiumCache = {
  tracks: null,
  likedMap: null,
};

const navItems = [
  { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
  { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },
];

function PremiumHomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState(null);
  const [likedMap, setLikedMap] = useState({});
  const { playTrack } = usePlayer();

  const load = async (force = false) => {
    if (!force && premiumCache.tracks) {
      setTracks(premiumCache.tracks);
      setLikedMap(premiumCache.likedMap);
      
      // Background revalidation for likes
      getLikedSongs().then(liked => {
        const map = liked.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
        setLikedMap(map);
        premiumCache.likedMap = map;
      }).catch(() => {});
      return;
    }

    setTracks(null);
    try {
      const [catalog, liked] = await Promise.all([getCatalogSongs(), getLikedSongs()]);
      const map = liked.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
      
      premiumCache = {
        tracks: catalog,
        likedMap: map,
      };

      setTracks(catalog);
      setLikedMap(map);
    } catch {
      setTracks([]);
      setLikedMap({});
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const toggleLike = async (track) => {
    if (likedMap[track.id]) {
      await unlikeSong(track.id);
      setLikedMap((prev) => {
        const next = { ...prev, [track.id]: false };
        if (premiumCache.likedMap) premiumCache.likedMap = next;
        return next;
      });
    } else {
      await likeSong(track);
      setLikedMap((prev) => {
        const next = { ...prev, [track.id]: true };
        if (premiumCache.likedMap) premiumCache.likedMap = next;
        return next;
      });
    }
  };

  const loading = tracks === null;
  const visibleTracks = tracks || [];

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search songs, artists, albums..."
      rightSlot={(
        <HeaderActions
          pillLabel="P"
          leading={<span className="rounded-full border border-transparent px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)]" style={{ background: 'var(--brand-tile-bg)' }}>Premium Active</span>}
        />
      )}
    >
      <div className="rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-8 shadow-[var(--shadow-card)] lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[var(--accent-strong)] px-4 py-2 text-sm font-semibold text-white shadow-sm">Premium curated</span>
            <h2 className="mt-5 text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">For You</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Curated tracks for premium listeners, blending deep focus, warm vocals, and club-ready rhythms.
            </p>
          </div>
          <div className="shrink-0 pt-4 lg:pt-0">
            <button 
              onClick={() => load(true)} 
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Curated
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="mt-8"><StatusCard title="Loading premium songs..." /></div>}
      {!loading && visibleTracks.length === 0 && <div className="mt-8"><StatusCard title="No songs available" subtitle="Upload songs from provider panel or refresh." /></div>}

      {!loading && visibleTracks.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {visibleTracks.slice(0, 12).map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              liked={Boolean(likedMap[track.id])}
              onToggleLike={toggleLike}
              onPlay={(item) => playTrack(item, visibleTracks.slice(0, 12))}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default PremiumHomePage;
