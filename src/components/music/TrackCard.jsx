import { Heart, Play, Music, Pause, Activity } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

const FALLBACK = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80';

function TrackCard({ track, liked, onToggleLike, onPlay, playCount }) {
  const { currentTrack, isPlaying } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <article className="group overflow-hidden rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative overflow-hidden rounded-t-[30px] bg-[var(--surface-alt)]">
        {track.artwork ? (
          <img
            src={track.artwork}
            alt={track.title}
            onError={(e) => { e.currentTarget.src = FALLBACK; }}
            className="h-72 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-[var(--surface-alt)]">
            <Music className="h-16 w-16 text-[var(--text-muted)]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
          Track
        </div>
        <button
          type="button"
          onClick={() => onPlay?.(track)}
          className={`absolute inset-0 flex items-center justify-center bg-slate-950/20 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          aria-label={isActive && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {isActive ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-strong)] shadow-xl">
              {isPlaying ? (
                <Activity className="h-7 w-7 text-white animate-pulse" />
              ) : (
                <Pause className="h-7 w-7 text-white" />
              )}
            </div>
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/92 shadow-[var(--shadow-card)]">
              <Play className="h-6 w-6 text-slate-900 translate-x-0.5" />
            </span>
          )}
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-[var(--text-primary)]">{track.title}</p>
            <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{track.artist}</p>
            {track.album && <p className="mt-2 truncate text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{track.album}</p>}
          </div>
          <button
            type="button"
            onClick={() => onToggleLike?.(track)}
            className="shrink-0 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 shadow-[var(--shadow-soft)] transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
            aria-label={`Toggle like ${track.title}`}
          >
            <Heart className={`h-5 w-5 transition-colors ${liked ? 'fill-[var(--accent-strong)] text-[var(--accent-strong)]' : 'text-[var(--text-secondary)]'}`} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default TrackCard;
