import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import UserPill from '../../components/common/UserPill';
import { getPlayerState, postPlayerEvent } from '../../api/appApi';
import { getCatalogSongs } from '../../api/catalogApi';
import { useSubscription } from '../../context/SubscriptionContext';

const navItems = [
  { to: '/app/home', label: 'Home' },
  { to: '/app/liked', label: 'Liked Songs' },
  { to: '/app/playlists', label: 'Playlists' },
  { to: '/app/player', label: 'Mixes' },
];

function PlayerPage() {
  const { isPremium } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [playerState, setPlayerState] = useState(null);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  useEffect(() => {
    Promise.all([getCatalogSongs(), getPlayerState()]).then(([songs, state]) => {
      setTracks(songs);
      setPlayerState(state);
    });
  }, []);

  const currentTrack = tracks.find((item) => item.id === playerState?.current_song_id) || tracks[0];

  const triggerEvent = async (eventType) => {
    if (!currentTrack) {
      return;
    }
    const state = await postPlayerEvent(eventType, currentTrack.id);
    setPlayerState(state);
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
      {!currentTrack && <StatusCard title="No track loaded" subtitle="No songs available in catalog yet." />}
      {currentTrack && (
        <div className="mx-auto mt-4 max-w-3xl text-center">
          <img src={currentTrack.artwork} alt={currentTrack.title} className="mx-auto h-96 w-full rounded-3xl object-cover" />
          <p className="mt-8 text-3xl text-emerald-600">Now Playing</p>
          <h2 className="mt-2 text-6xl font-semibold">{currentTrack.title}</h2>
          <p className="mt-2 text-4xl text-[var(--text-secondary)]">{currentTrack.artist}</p>

          <div className="mt-10 flex items-center justify-center gap-8">
            <button className="rounded-full p-3 hover:bg-[var(--surface-alt)]"><SkipBack className="h-9 w-9" /></button>
            <button
              onClick={() => triggerEvent(playerState?.is_playing ? 'SongPaused' : 'SongPlayed')}
              className="rounded-full bg-emerald-500 p-6 text-white shadow-[var(--shadow-card)]"
            >
              {playerState?.is_playing ? <Pause className="h-12 w-12" /> : <Play className="h-12 w-12" />}
            </button>
            <button onClick={() => triggerEvent('SongSkipped')} className="rounded-full p-3 hover:bg-[var(--surface-alt)]">
              <SkipForward className="h-9 w-9" />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default PlayerPage;
