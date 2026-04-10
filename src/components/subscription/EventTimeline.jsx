const REQUIRED_FIELDS = ['id', 'aggregate_id', 'event_type', 'version', 'payload', 'created_at'];

const BADGE = {
  SubscriptionCreated: 'bg-[rgba(61,220,151,0.12)] text-[var(--green-500)]',
  PlanUpgraded: 'bg-[rgba(61,220,151,0.12)] text-[var(--green-500)]',
  PaymentSucceeded: 'bg-[rgba(61,220,151,0.12)] text-[var(--green-500)]',
  PaymentFailed: 'bg-[rgba(239,68,68,0.16)] text-red-400',
  SongPlayed: 'bg-[rgba(59,130,246,0.14)] text-sky-300',
};

function EventTimeline({ events = [] }) {
  const valid = events.filter((e) => {
    if (!REQUIRED_FIELDS.every((f) => f in e)) {
      console.warn('[EventTimeline] Skipping invalid event:', e);
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
        const badge = BADGE[event.event_type] || 'bg-[rgba(148,163,184,0.12)] text-[var(--text-secondary)]';
        const payloadStr = JSON.stringify(event.payload);
        const summary = payloadStr.length > 80 ? payloadStr.slice(0, 80) + '…' : payloadStr;

        return (
          <div key={event.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
                {event.event_type}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {new Date(event.created_at).toLocaleString()}
              </span>
              <span className="font-mono text-xs text-[var(--green-500)]">
                #{event.aggregate_id.slice(0, 8)}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">v{event.version}</span>
            </div>
            <p className="mt-2 font-mono text-xs text-[var(--text-secondary)] break-all">{summary}</p>
          </div>
        );
      })}
    </div>
  );
}

export default EventTimeline;
