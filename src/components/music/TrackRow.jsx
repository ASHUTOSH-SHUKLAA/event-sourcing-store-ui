import { Heart, Play } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80';

function TrackRow({ track, liked = false, onToggleLike, onPlay }) {
  return (
    <div className="group flex items-center gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--green-500)] hover:shadow-[var(--shadow-card)]">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-[var(--surface-alt)]">
        <img src={track.artwork || FALLBACK} alt={track.title} className="h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{track.title}</p>
        <p className="truncate text-xs text-[var(--text-secondary)]">{track.artist}</p>
        {track.album && <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{track.album}</p>}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-xs text-[var(--text-secondary)]">{track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : ''}</span>
        <div className="flex items-center gap-1">
          {onPlay && (
            <button type="button" onClick={() => onPlay(track)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-2 text-[var(--green-500)] transition hover:border-[var(--green-500)] hover:bg-[var(--green-500)]/10">
              <Play className="h-4 w-4" />
            </button>
          )}
          {onToggleLike && (
            <button type="button" onClick={() => onToggleLike(track)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-2 transition hover:border-[var(--green-500)] hover:bg-[var(--green-500)]/10">
              <Heart className={`h-4 w-4 ${liked ? 'fill-[var(--green-500)] text-[var(--green-500)]' : 'text-[var(--text-secondary)]'}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackRow;
