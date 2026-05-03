import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home, List, Activity, Search, Heart } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import PremiumGate from '../../components/common/PremiumGate';
import HeaderActions from '../../components/common/HeaderActions';
import MusicPlayer from '../../components/music/MusicPlayer';
import TrackCard from '../../components/music/TrackCard';
import { useSubscription } from '../../context/useSubscription';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../components/common/useToast';
import { getLikedSongs, likeSong, unlikeSong } from '../../api/appApi';
import { searchTracks } from '../../api/itunesApi';

function SearchPage() {
  const { isPremium } = useSubscription();

  const { playTrack } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();

  const navItems = [
    { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
    { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

  ];

  const { fireToast } = useToast();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [tracks, setTracks] = useState([]);
  const [likedMap, setLikedMap] = useState({});
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
      fireToast('Upgrade to Premium to save liked songs!');
      return;
    }

    const wasLiked = Boolean(likedMap[track.id]);
    setLikedMap((prev) => ({ ...prev, [track.id]: !wasLiked }));
    try {
      if (wasLiked) {
        await unlikeSong(track.id);
      } else {
        await likeSong(track);

      }
    } catch {
      setLikedMap((prev) => ({ ...prev, [track.id]: wasLiked }));
    }
  };

  if (!isPremium) {
    return <PremiumGate variant="fullscreen" message="Search requires a Premium subscription." />;
  }

  return (
    <>
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tracks.map((track) => (
          <div key={track.id}>
            <TrackCard
              track={track}
              liked={Boolean(likedMap[track.id])}
              onToggleLike={toggleLike}
              onPlay={(item) => playTrack(item, tracks)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default SearchPage;
