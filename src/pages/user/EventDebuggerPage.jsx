import { useEffect, useState } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import UserPill from '../../components/common/UserPill';
import { useSubscription } from '../../context/SubscriptionContext';
import { getSubscriptionEvents } from '../../api/subscriptionApi';
import { applyEvent, INITIAL_STATE } from '../../utils/subscriptionReducer';

function EventDebuggerPage() {
  const { isPremium } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentState, setCurrentState] = useState(INITIAL_STATE);
  const [replaying, setReplaying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const navItems = [
    { to: '/app/home', label: 'Home' },
    { to: '/app/subscription/events', label: 'Event Log' },
    { to: '/app/events', label: 'Events Debugger' },
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

  const showStatus = (message) => {
    setStatusMsg(message);
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleReplay = async () => {
    setReplaying(true);
    try {
      const { evts, derived } = await fetchAndDerive();
      setEvents(evts);
      setCurrentState(derived);
      showStatus(`Replayed from ${evts.length} event${evts.length !== 1 ? 's' : ''}`);
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
      showStatus('Projection reset and rebuilt');
    } finally {
      setResetting(false);
    }
  };

  const sorted = [...events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const lastEvent = sorted[0];
  const busy = replaying || resetting;

  const STATUS_STYLE = {
    active: 'bg-[rgba(61,220,151,0.14)] text-[var(--green-500)]',
    cancelled: 'bg-[rgba(148,163,184,0.14)] text-[var(--text-secondary)]',
    payment_failed: 'bg-[rgba(239,68,68,0.16)] text-red-400',
  };

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={isPremium ? handleSearchChange : undefined}
      searchPlaceholder="Search songs, artists, albums..."
      rightSlot={
        <div className="flex items-center gap-3">
          <Link
            to="/app/subscription"
            className={isPremium
              ? 'rounded-3xl bg-[var(--green-500)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[var(--green-600)]'
              : 'rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-strong)]'}
          >
            Premium
          </Link>
          <UserPill label="U" />
        </div>
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Events Debugger</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Inspect the raw event log and replay the event sourcing engine.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReplay}
            disabled={busy}
            className="flex items-center gap-2 rounded-3xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-black hover:bg-[var(--green-600)] transition disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${replaying ? 'animate-spin' : ''}`} />
            {replaying ? 'Replaying...' : 'Replay Events'}
          </button>
          <button
            onClick={handleReset}
            disabled={busy}
            className="flex items-center gap-2 rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-strong)] transition disabled:opacity-60"
          >
            <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Reset Projection'}
          </button>
          {statusMsg && (
            <span className="rounded-3xl border border-[var(--green-600)] bg-[rgba(61,220,151,0.14)] px-3 py-2 text-xs font-medium text-[var(--green-500)]">
              {statusMsg}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Events', value: events.length, accent: 'text-[var(--text-primary)]' },
          { label: 'Plan', value: currentState.plan, accent: 'text-[var(--green-500)] capitalize' },
          { label: 'Status', value: null, badge: currentState.status },
          { label: 'Last Event', value: lastEvent?.event_type || '—', accent: 'text-xs' },
        ].map(({ label, value, accent, badge }) => (
          <div key={label} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{label}</p>
            {badge ? (
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[badge] || 'bg-[rgba(148,163,184,0.14)] text-[var(--text-secondary)]'}`}>
                {badge.replace('_', ' ')}
              </span>
            ) : (
              <p className={`mt-1 text-xl font-bold ${accent}`}>{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-base font-bold text-[var(--text-primary)]">
          Raw Event Log
          <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">newest first</span>
        </h3>
        {sorted.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">No events recorded yet.</p>
        )}
        <div className="space-y-3">
          {sorted.map((event) => (
            <div key={event.id} className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                <span className="rounded-full bg-[rgba(61,220,151,0.14)] px-2 py-0.5 text-xs font-semibold text-[var(--green-500)]">
                  {event.event_type}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">{new Date(event.created_at).toLocaleString()}</span>
                <span className="ml-auto font-mono text-xs text-[var(--green-500)]">v{event.version}</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export default EventDebuggerPage;
