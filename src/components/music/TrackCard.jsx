import { Heart, Play } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80';

function TrackCard({ track, liked, onToggleLike, onPlay, playCount }) {
  return (
    <article className="group overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <div className="relative overflow-hidden rounded-t-[30px] bg-[var(--surface-alt)]">
        <img
          src={track.artwork || FALLBACK}
          alt={track.title}
          className="h-72 w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <button
          type="button"
          onClick={() => onPlay?.(track)}
          className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-label={`Play ${track.title}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--green-500)] shadow-[0_20px_40px_rgba(16,185,129,0.18)]">
            <Play className="h-6 w-6 text-white" />
          </span>
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[var(--text-primary)]">{track.title}</p>
            <p className="truncate text-sm text-[var(--text-secondary)] mt-1">{track.artist}</p>
            {track.album && <p className="truncate text-xs text-[var(--text-muted)] mt-2">{track.album}</p>}
          </div>
          <button
            type="button"
            onClick={() => onToggleLike?.(track)}
            className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm transition hover:border-[var(--green-500)] hover:bg-[var(--green-500)]/10"
            aria-label={`Toggle like ${track.title}`}
          >
            <Heart className={`h-5 w-5 transition-colors ${liked ? 'fill-[var(--green-500)] text-[var(--green-500)]' : 'text-[var(--text-secondary)]'}`} />
          </button>
        </div>
        {playCount > 0 && (
          <div className="flex items-center rounded-2xl bg-[var(--surface-alt)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
            ▶ {playCount} plays
          </div>
        )}
      </div>
    </article>
  );
}

export default TrackCard;
