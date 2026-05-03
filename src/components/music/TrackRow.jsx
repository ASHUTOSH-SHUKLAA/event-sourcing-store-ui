import { Heart, Play, Activity, Pause } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

const FALLBACK = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80';

function TrackRow({ track, liked = false, onToggleLike, onPlay }) {
  const { currentTrack, isPlaying } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  return (
    <div className="group flex items-center gap-4 rounded-[26px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[22px] bg-[var(--surface-alt)]">
        <img 
          src={track.artwork || FALLBACK} 
          alt={track.title} 
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
          className="h-full w-full object-cover object-center" 
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        {onPlay && (
          <button
            type="button"
            onClick={() => onPlay(track)}
            className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            aria-label={isActive && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            {isActive ? (
              isPlaying ? (
                <Activity className="h-7 w-7 text-white animate-pulse" />
              ) : (
                <Pause className="h-7 w-7 text-white" />
              )
            ) : (
              <Play className="h-7 w-7 fill-white text-white translate-x-0.5" />
            )}
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{track.title}</p>
        <p className="truncate text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{track.artist}</p>
        {track.album && <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{track.album}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {track.duration ? (
            typeof track.duration === 'string' && track.duration.includes(':')
              ? track.duration
              : `${Math.floor(Number(track.duration) / 60)}:${String(Number(track.duration) % 60).padStart(2, '0')}`
          ) : ''}
        </span>
        <div className="flex items-center gap-2">
          {onToggleLike && (
            <button
              type="button"
              onClick={() => onToggleLike(track)}
              className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-[var(--accent-strong)] text-[var(--accent-strong)]' : 'text-[var(--text-secondary)]'}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackRow;
