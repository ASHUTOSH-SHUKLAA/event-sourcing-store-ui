import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Home, List, Activity, Heart } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import PremiumGate from '../../components/common/PremiumGate';
import HeaderActions from '../../components/common/HeaderActions';
import MusicPlayer from '../../components/music/MusicPlayer';
import TrackRow from '../../components/music/TrackRow';
import { getLikedSongs, unlikeSong } from '../../api/appApi';
import { useSubscription } from '../../context/useSubscription';
import { usePlayer } from '../../context/PlayerContext';

const navItems = [
  { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
  { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

];

function LikedSongsPage() {
  const { isPremium } = useSubscription();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();
  const { searchTerm } = useOutletContext();
  const [songs, setSongs] = useState(() => (isPremium ? null : []));

  useEffect(() => {
    if (!isPremium) {
      return undefined;
    }

    let active = true;

    getLikedSongs()
      .then((liked) => {
        if (!active) {
          return;
        }
        setSongs([...new Map(liked.map((item) => [item.id, item])).values()]);
      })
      .catch(() => {
        if (active) {
          setSongs([]);
        }
      });

    return () => {
      active = false;
    };
  }, [isPremium]);

  if (!isPremium) {
    return <PremiumGate message="Liked songs require a Premium subscription." />;
  }

  const loading = songs === null;
  const songList = songs || [];

  const filtered = songList.filter((song) =>
    [song.title, song.artist, song.album].some((value) => (value || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onUnlike = async (track) => {
    await unlikeSong(track.id);
    setSongs((prev) => (prev || []).filter((item) => item.id !== track.id));
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-4xl font-semibold text-[var(--text-primary)]">Liked Songs</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Your premium favorites, organized for easy playback and discovery.</p>
        </div>
        <span className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
          {songList.length} saved song{songList.length === 1 ? '' : 's'}
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
                <TrackRow 
                  key={track.id} 
                  track={track} 
                  liked 
                  onToggleLike={onUnlike} 
                  onPlay={() => playTrack(track, filtered)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default LikedSongsPage;
