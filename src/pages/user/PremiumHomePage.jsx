import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import TrackCard from '../../components/music/TrackCard';
import StatusCard from '../../components/common/StatusCard';
import UserPill from '../../components/common/UserPill';
import { getLikedSongs, likeSong, postPlayerEvent, unlikeSong } from '../../api/appApi';
import { getCatalogSongs } from '../../api/catalogApi';

const navItems = [
  { to: '/app/premium', label: 'Home' },
  { to: '/app/liked', label: 'Liked Songs' },
];

function PremiumHomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([getCatalogSongs(), getLikedSongs()])
      .then(([catalog, liked]) => {
        if (!isMounted) {
          return;
        }
        setTracks(catalog);
        const map = liked.reduce((acc, item) => {
          acc[item.id] = true;
          return acc;
        }, {});
        setLikedMap(map);
      })
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const toggleLike = async (track) => {
    if (likedMap[track.id]) {
      await unlikeSong(track.id);
      setLikedMap((prev) => ({ ...prev, [track.id]: false }));
    } else {
      await likeSong(track);
      setLikedMap((prev) => ({ ...prev, [track.id]: true }));
    }
  };

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search songs, artists, albums..."
      rightSlot={(
        <>
          <span className="rounded-full bg-emerald-500 px-6 py-2 text-lg font-semibold text-white">Premium Active</span>
          <UserPill label="P" />
        </>
      )}
    >
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-alt)] p-10 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[var(--green-500)]/15 px-4 py-2 text-sm font-semibold text-[var(--green-700)]">Premium curated</span>
            <h2 className="mt-5 text-5xl font-semibold text-[var(--text-primary)]">For You</h2>
            <p className="mt-4 max-w-2xl text-xl text-[var(--text-secondary)]">Curated tracks for premium listeners, blending deep focus, warm vocals, and club-ready rhythms.</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Premium Status</p>
            <p className="mt-3 text-3xl font-bold text-[var(--green-700)]">Active</p>
          </div>
        </div>
      </div>

      {loading && <div className="mt-8"><StatusCard title="Loading premium songs..." /></div>}
      {!loading && tracks.length === 0 && <div className="mt-8"><StatusCard title="No songs available" subtitle="Upload songs from provider panel or refresh." /></div>}

      {!loading && tracks.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {tracks.slice(0, 10).map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              liked={Boolean(likedMap[track.id])}
              onToggleLike={toggleLike}
              onPlay={(item) => postPlayerEvent('SongPlayed', item.id)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default PremiumHomePage;
