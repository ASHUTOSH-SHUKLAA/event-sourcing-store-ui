import { useEffect, useState } from 'react';
import { Home, Heart, Music, List, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import HeaderActions from '../../components/common/HeaderActions';
import TrackRow from '../../components/music/TrackRow';


import { useSubscription } from '../../context/useSubscription';

const navItems = [
  { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
  { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

];


  const { isPremium } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();


  const [tracks, setTracks] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {

        if (!active) {
          return;
        }

        setTracks(songs);

      } catch {
        if (!active) {
          return;
        }

        setTracks([]);

      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const onCreate = async () => {
    if (!newPlaylistName.trim()) {
      return;
    }
    await createPlaylist(newPlaylistName.trim(), tracks.slice(0, 4).map((track) => track.id));
    setNewPlaylistName('');
    try {


      setTracks(songs);

    } catch {

      setTracks([]);

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
      <div className="rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-6 shadow-[var(--shadow-card)]">

        <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">

        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={newPlaylistName}
          onChange={(event) => setNewPlaylistName(event.target.value)}
          placeholder="New playlist name"
          className="h-12 w-full max-w-lg rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-strong)] focus:ring-4 focus:ring-[var(--ring)]"
        />
        <button onClick={onCreate} className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--accent)]">
          Create playlist
        </button>
      </div>

      <section className="mt-8 rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-soft)]">



          <div className="mt-4 space-y-3">

              <div key={playlist.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <p className="text-xl font-semibold text-[var(--text-primary)]">{playlist.name}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{playlist.song_ids.length} songs</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-soft)]">



          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              <article key={playlist.id} className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)]">
                <img src={playlist.artwork} alt={playlist.title} className="h-40 w-full rounded-[22px] object-cover" />
                <p className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{playlist.title}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{playlist.curator}</p>
                <p className="text-sm text-[var(--text-secondary)]">{playlist.track_count} tracks</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-soft)]">
        <h3 className="px-4 py-3 text-2xl font-semibold text-[var(--text-primary)]">Available Songs</h3>
        <div className="space-y-3">
          {tracks.map((track) => (
            <TrackRow key={track.id} track={track} />
          ))}
        </div>
        {tracks.length === 0 && <StatusCard title="No songs available for playlist creation" />}
      </section>
    </AppShell>
  );
}


