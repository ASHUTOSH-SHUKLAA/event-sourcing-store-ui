import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, Music, List, Activity, Disc, RefreshCw } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import TrackCard from '../../components/music/TrackCard';
import StatusCard from '../../components/common/StatusCard';
import PremiumGate from '../../components/common/PremiumGate';
import HeaderActions from '../../components/common/HeaderActions';
import MusicPlayer from '../../components/music/MusicPlayer';
import { useSubscription } from '../../context/useSubscription';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../components/common/useToast';
import { likeSong, unlikeSong, getLikedSongs } from '../../api/appApi';
import { getCatalogSongs } from '../../api/catalogApi';
import { recordPlay, getPlayCounts } from '../../api/subscriptionApi';

let homeCache = {
  tracks: null,
  playCountMap: null,
  likedMap: null,
};

const navItems = [
  { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
  { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

];

function HomePage() {
  const { isPremium, loading: loadingSub } = useSubscription();
  const { fireToast } = useToast();

  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [playCountMap, setPlayCountMap] = useState({});
  const [likedMap, setLikedMap] = useState({});
  const [songIndex, setSongIndex] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const load = async (force = false) => {
    if (!force && homeCache.tracks) {
      setTracks(homeCache.tracks);
      setPlayCountMap(homeCache.playCountMap);
      setLikedMap(homeCache.likedMap);
      setLoading(false);
      
      if (isPremium) {
        getLikedSongs().then(likedItems => {
          const newLikedMap = {};
          (likedItems || []).forEach(item => { newLikedMap[item.id] = true; });
          setLikedMap(newLikedMap);
          homeCache.likedMap = newLikedMap;
        }).catch(() => {});
      }
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [songs, counts, likedItems] = await Promise.all([
        getCatalogSongs(), 
        getPlayCounts(),
        isPremium ? getLikedSongs().catch(() => []) : Promise.resolve([])
      ]);
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      const selectedSongs = shuffled.slice(0, 12);
      
      const newLikedMap = {};
      (likedItems || []).forEach(item => { newLikedMap[item.id] = true; });

      homeCache = {
        tracks: selectedSongs,
        playCountMap: counts.data || {},
        likedMap: newLikedMap,
      };

      setTracks(homeCache.tracks);
      setPlayCountMap(homeCache.playCountMap);
      setLikedMap(homeCache.likedMap);
    } catch (err) {
      setError(err.message || 'Failed to fetch music catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only trigger load once subscription status is known
    if (!loadingSub) {
      load();
    }
  }, [isPremium, loadingSub]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const onToggleLike = async (track, currentlyLiked) => {
    if (!isPremium) {
      fireToast('Upgrade to Premium to save liked songs!');
      return;
    }
    try {
      setLikedMap(prev => {
        const next = { ...prev, [track.id]: !currentlyLiked };
        if (homeCache.likedMap) homeCache.likedMap = next;
        return next;
      });
      if (currentlyLiked) {
        await unlikeSong(track.id);
      } else {
        await likeSong(track);

      }
    } catch (err) {
      setLikedMap(prev => {
        const next = { ...prev, [track.id]: currentlyLiked };
        if (homeCache.likedMap) homeCache.likedMap = next;
        return next;
      });
      console.error('Like toggle failed', err);
    }
  };

  const onPlay = (track) => {
    playTrack(track, tracks);

  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Popular Songs</h2>
        <button 
          onClick={() => load(true)} 
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={load} className="mt-3 text-sm font-semibold text-red-500 underline">Try again</button>
        </div>
      )}

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[32px] bg-[var(--surface-strong)]" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              playCount={playCountMap[track.id] || 0}
              liked={!!likedMap[track.id]}
              onPlay={() => onPlay(track)}
              onToggleLike={() => onToggleLike(track, !!likedMap[track.id])}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default HomePage;
