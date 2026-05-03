const REQUIRED_FIELDS = ['id', 'aggregate_id', 'event_type', 'version', 'payload', 'created_at'];

const BADGE = {
  SubscriptionCreated: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
  PlanUpgraded: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
  PaymentSucceeded: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
  PaymentFailed: 'bg-[var(--danger-soft)] text-red-500',
  SongPlayed: 'bg-[var(--info-soft)] text-sky-500',
};

function EventTimeline({ events = [] }) {
  const valid = events.filter((event) => {
    if (!REQUIRED_FIELDS.every((field) => field in event)) {
      console.warn('[EventTimeline] Skipping invalid event:', event);
      return false;
    }
    return true;
  });

  const sorted = [...valid].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (sorted.length === 0) {
    return <p className="py-4 text-sm text-[var(--text-secondary)]">No events yet.</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map((event) => {
        const badge = BADGE[event.event_type] || 'bg-[var(--surface)] text-[var(--text-secondary)]';
        const payloadStr = JSON.stringify(event.payload);
        const summary = payloadStr.length > 80 ? `${payloadStr.slice(0, 80)}...` : payloadStr;

        return (
          <div key={event.id} className="rounded-[28px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}>
                {event.event_type}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {new Date(event.created_at).toLocaleString()}
              </span>
              <span className="rounded-full bg-[var(--surface)] px-2 py-1 font-mono text-[11px] text-[var(--text-muted)]">
                #{event.aggregate_id.slice(0, 8)}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">v{event.version}</span>
            </div>
            <p className="mt-3 break-all rounded-[20px] bg-[var(--surface)] px-3 py-3 font-mono text-xs leading-6 text-[var(--text-secondary)]">
              {summary}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default EventTimeline;
