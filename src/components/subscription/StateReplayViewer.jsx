import { applyEvent, INITIAL_STATE } from '../../utils/subscriptionReducer';
import { useSubscription } from '../../context/useSubscription';

const STATUS_STYLE = {
  active: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
  cancelled: 'bg-[var(--surface)] text-[var(--text-secondary)]',
  payment_failed: 'bg-[var(--danger-soft)] text-red-500',
};

function StatePanel({ label, state, highlight }) {
  const badge = STATUS_STYLE[state.status] || 'bg-[var(--surface)] text-[var(--text-secondary)]';

  return (
    <div 
      className={`relative overflow-hidden rounded-[30px] border-[4px] px-6 py-6 shadow-xl transition-all duration-500 ${highlight ? 'border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]'}`}
    >
      {highlight && <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />}
      <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-100/70' : 'text-[var(--text-secondary)]'}`}>{label}</p>
      <p className="text-2xl font-black capitalize">{state.plan}</p>
      <p className={`mt-1 text-sm font-medium ${highlight ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>Rs.{state.price}/month</p>
      
      <div className="mt-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${highlight ? 'bg-white/20 text-white' : badge}`}>
          {state.status.replace('_', ' ')}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
          Version {state.version}
        </span>
      </div>
    </div>
  );
}

function StateReplayViewer({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-[28px] border-[4px] border-blue-500/20 bg-[var(--surface-elevated)] p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="text-sm font-medium text-[var(--text-secondary)]">No events available to replay.</p>
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => a.version - b.version);
  const stateAfter = sorted.reduce(applyEvent, INITIAL_STATE);
  const replayedBefore = sorted.slice(0, -1).reduce(applyEvent, INITIAL_STATE);
  const lastEvent = sorted[sorted.length - 1];

  // Smart derivation for "State Before" to handle missing history
  let stateBefore = { ...replayedBefore };
  if (lastEvent.payload) {
    const { from } = lastEvent.payload;
    if (from === 'premium' && stateBefore.plan === 'free') {
      stateBefore = { ...stateBefore, plan: 'premium', price: 199, status: 'active' };
    } else if (from === 'free' && stateBefore.plan === 'premium') {
      stateBefore = { ...stateBefore, plan: 'free', price: 0, status: 'active' };
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-blue-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20">
          {lastEvent.event_type}
        </span>
        <span className="text-xs font-bold text-[var(--text-secondary)]">
          {new Date(lastEvent.created_at).toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StatePanel label="State Before" state={stateBefore} />
        <StatePanel label="Current State" state={stateAfter} highlight />
      </div>
    </div>
  );
}

export default StateReplayViewer;
