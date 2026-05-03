import { useEffect, useState } from 'react';
import { Home, List, Activity, RefreshCw, RotateCcw, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import HeaderActions from '../../components/common/HeaderActions';
import { useSubscription } from '../../context/useSubscription';
import { getSubscriptionEvents } from '../../api/subscriptionApi';
import { applyEvent, INITIAL_STATE } from '../../utils/subscriptionReducer';

function EventDebuggerPage() {
  const { isPremium, subscription } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentState, setCurrentState] = useState(INITIAL_STATE);
  const [replaying, setReplaying] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const navItems = [
    { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
    { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

  ];

  const fetchAndDerive = async () => {
    const res = await getSubscriptionEvents();
    const evts = res.data || [];
    const sorted = [...evts].sort((a, b) => a.version - b.version);
    const derived = sorted.reduce(applyEvent, INITIAL_STATE);
    return { evts, derived };
  };

  useEffect(() => {
    fetchAndDerive().then(({ evts, derived }) => {
      setEvents(evts);
      setCurrentState(derived);
    });
  }, []);



  const handleReplay = async () => {
    setReplaying(true);
    try {
      const { evts, derived } = await fetchAndDerive();
      setEvents(evts);
      setCurrentState(derived);
    } finally {
      setReplaying(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setCurrentState(INITIAL_STATE);
    try {
      const { evts, derived } = await fetchAndDerive();
      setEvents(evts);
      setCurrentState(derived);
    } finally {
      setResetting(false);
    }
  };

  const sorted = [...events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const lastEvent = sorted[0];
  const busy = replaying || resetting;

  const STATUS_STYLE = {
    active: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
    cancelled: 'bg-[var(--surface)] text-[var(--text-secondary)]',
    payment_failed: 'bg-[var(--danger-soft)] text-red-500',
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-6 shadow-[var(--shadow-card)]">
        <div>

          <p className="mt-1 text-sm leading-7 text-[var(--text-secondary)]">Inspect the raw event log and replay the event sourcing engine.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReplay}
            disabled={busy}
            className="flex items-center gap-2 rounded-full bg-[var(--accent-strong)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${replaying ? 'animate-spin' : ''}`} />
            {replaying ? 'Replaying...' : 'Replay Events'}
          </button>
          <button
            onClick={handleReset}
            disabled={busy}
            className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] disabled:opacity-60"
          >
            <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Reset Projection'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Events', value: events.length },
          { label: 'Current Plan', value: isPremium ? 'Premium' : 'Free' },
          { label: 'Account Status', value: (subscription?.status || 'active').replace('_', ' ') },
          { label: 'Latest Action', value: lastEvent?.event_type || 'None' },
        ].map(({ label, value }) => (
          <div key={label} className="group relative overflow-hidden rounded-[28px] border-2 border-blue-400/20 bg-gradient-to-br from-blue-600 to-indigo-600 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/70">{label}</p>
            <p className="mt-2 text-xl font-black capitalize text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1.5 rounded-full bg-blue-500" />
          <h3 className="text-lg font-black text-[var(--text-primary)]">
            Raw Event Log
            <span className="ml-3 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Chronological Trace</span>
          </h3>
        </div>
        
        {sorted.length === 0 && (
          <div className="rounded-[28px] border-2 border-dashed border-[var(--border)] p-12 text-center">
            <p className="text-sm font-medium text-[var(--text-secondary)]">No events have been emitted to the audit trail yet.</p>
          </div>
        )}
        
        <div className="space-y-4">
          {sorted.map((event) => (
            <div key={event.id} className="relative overflow-hidden rounded-[30px] border-[4px] border-blue-600/30 bg-[var(--surface-elevated)] shadow-[0_10px_30px_rgba(37,99,235,0.1)] transition-all duration-300 hover:border-blue-500">
              <div className="flex items-center gap-3 border-b border-blue-500/10 bg-[var(--surface)]/50 px-6 py-4">
                <span className="rounded-full bg-blue-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  {event.event_type}
                </span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">{new Date(event.created_at).toLocaleString()}</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Sequence</span>
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-500">v{event.version}</span>
                </div>
              </div>
              <pre className="overflow-x-auto p-6 font-mono text-xs leading-relaxed text-[var(--text-secondary)] selection:bg-blue-500/20">
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default EventDebuggerPage;
