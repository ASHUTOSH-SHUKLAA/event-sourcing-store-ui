import { applyEvent, INITIAL_STATE } from '../../utils/subscriptionReducer';

const STATUS_STYLE = {
  active: 'bg-[rgba(61,220,151,0.14)] text-[var(--green-500)]',
  cancelled: 'bg-[rgba(148,163,184,0.14)] text-[var(--text-secondary)]',
  payment_failed: 'bg-[rgba(239,68,68,0.16)] text-red-400',
};

function StatePanel({ label, state, highlight }) {
  const badge = STATUS_STYLE[state.status] || 'bg-[rgba(148,163,184,0.14)] text-[var(--text-secondary)]';
  return (
    <div className={`rounded-3xl border px-5 py-6 ${highlight ? 'border-[var(--green-600)] bg-[var(--surface-strong)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">{label}</p>
      <p className="text-2xl font-bold capitalize text-[var(--text-primary)]">{state.plan}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">₹{state.price}/month</p>
      <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
        {state.status.replace('_', ' ')}
      </span>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">Version {state.version}</p>
    </div>
  );
}

function StateReplayViewer({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm text-[var(--text-secondary)]">No events to replay.</p>
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => a.version - b.version);
  const stateBefore = sorted.slice(0, -1).reduce(applyEvent, INITIAL_STATE);
  const stateAfter = sorted.reduce(applyEvent, INITIAL_STATE);
  const lastEvent = sorted[sorted.length - 1];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[rgba(61,220,151,0.14)] px-2.5 py-0.5 text-xs font-semibold text-[var(--green-500)]">
          {lastEvent.event_type}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {new Date(lastEvent.created_at).toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatePanel label="State Before" state={stateBefore} />
        <StatePanel label="State After" state={stateAfter} highlight />
      </div>
    </div>
  );
}

export default StateReplayViewer;
