import { Pause, Play, SkipBack, SkipForward, Home, Heart, Music, List, Activity, Disc } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import HeaderActions from '../../components/common/HeaderActions';
import { getPlayerState, postPlayerEvent } from '../../api/appApi';
import { getCatalogSongs } from '../../api/catalogApi';
import { useSubscription } from '../../context/useSubscription';

const navItems = [
  { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
  { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

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
    if (!currentTrack) return;
    const state = await postPlayerEvent(eventType, currentTrack.id);
    setPlayerState(state);
  };

  const handlePlayPause = () => {
    if (!currentTrack) return;
    const audio = document.getElementById('audio-player');
    if (playerState?.is_playing) {
      audio?.pause();
      triggerEvent('SongPaused');
    } else {
      audio?.play();
      triggerEvent('SongPlayed');
    }
  };

  const handleSkip = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    const audio = document.getElementById('audio-player');
    if (audio && tracks[nextIndex]) {
      audio.src = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(nextIndex % 16) + 1}.mp3`;
      audio.play();
      triggerEvent('SongSkipped');
    }
  };

  const handlePrevious = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    const audio = document.getElementById('audio-player');
    if (audio && tracks[prevIndex]) {
      audio.src = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(prevIndex % 16) + 1}.mp3`;
      audio.play();
      triggerEvent('SongSkipped');
    }
  };

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={isPremium ? handleSearchChange : undefined}
      searchPlaceholder="Search songs, artists, albums..."
      rightSlot={<HeaderActions showPremium isPremium={isPremium} pillLabel="U" />}
    >
      {!currentTrack && <StatusCard title="No track loaded" subtitle="No songs available in catalog yet." />}
      {currentTrack && (
        <div className="mx-auto mt-4 max-w-4xl rounded-[34px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
          <img src={currentTrack.artwork} alt={currentTrack.title} className="mx-auto h-80 w-full rounded-[28px] object-cover sm:h-96" />
          <h2 className="mt-8 text-4xl font-semibold text-[var(--text-primary)] sm:text-6xl">{currentTrack.title}</h2>
          <p className="mt-2 text-xl text-[var(--text-secondary)] sm:text-3xl">{currentTrack.artist}</p>

          <audio
            id="audio-player"
            src={`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(tracks.findIndex((t) => t.id === currentTrack.id) % 16) + 1}.mp3`}
            onEnded={handleSkip}
            className="hidden"
          />

          <div className="mt-10 flex items-center justify-center gap-6">
            <button onClick={handlePrevious} className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-[var(--text-primary)] transition hover:border-[var(--accent)]">
              <SkipBack className="h-8 w-8" />
            </button>
            <button
              onClick={handlePlayPause}
              className="rounded-full bg-[var(--accent-strong)] p-6 text-white shadow-[var(--shadow-card)] transition hover:scale-[1.02] hover:bg-[var(--accent)]"
            >
              {playerState?.is_playing ? <Pause className="h-12 w-12" /> : <Play className="h-12 w-12" />}
            </button>
            <button onClick={handleSkip} className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-[var(--text-primary)] transition hover:border-[var(--accent)]">
              <SkipForward className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default PlayerPage;
