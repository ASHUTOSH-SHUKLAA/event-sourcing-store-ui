import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, List, Activity, Heart } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import HeaderActions from '../../components/common/HeaderActions';
import EventTimeline from '../../components/subscription/EventTimeline';
import StateReplayViewer from '../../components/subscription/StateReplayViewer';
import { useSubscription } from '../../context/useSubscription';
import { getSubscriptionEvents } from '../../api/subscriptionApi';
import { applyEvent, INITIAL_STATE } from '../../utils/subscriptionReducer';

const REQUIRED_FIELDS = ['id', 'aggregate_id', 'event_type', 'version', 'payload', 'created_at'];

function EventLogPage() {
  const { isPremium, subscription } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const sorted = [...events].sort((a, b) => a.version - b.version);
  const currentState = sorted.reduce(applyEvent, INITIAL_STATE);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const navItems = [
    { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
    { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

  ];

  useEffect(() => {
    let active = true;

    getSubscriptionEvents()
      .then((res) => {
        if (!active) {
          return;
        }
        const valid = (res.data || []).filter((event) => {
          if (!REQUIRED_FIELDS.every((field) => field in event)) {
            console.warn('[EventLogPage] Skipping invalid event:', event);
            return false;
          }
          return true;
        });
        setEvents(valid);
      })
      .catch(() => {
        if (active) {
          setEvents([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Event Log</h2>
          <p className="text-sm text-[var(--text-secondary)]">Append-only audit trail of your subscription events.</p>
        </div>
      </div>

      {loading && <div className="mt-6"><StatusCard title="Loading events..." /></div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Audit Trail', value: events.length + ' Events' },
          { label: 'Current Tier', value: isPremium ? 'Premium' : 'Free' },
          { label: 'Account Status', value: subscription.status.replace('_', ' ') },
          { label: 'Last Action', value: sorted.length > 0 ? sorted[sorted.length - 1].event_type : 'None' },
        ].map(({ label, value }) => (
          <div key={label} className="group relative overflow-hidden rounded-[28px] border-2 border-blue-400/20 bg-gradient-to-br from-blue-600 to-indigo-600 p-5 shadow-[0_10px_30px_rgba(37,99,235,0.2)] transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/70">{label}</p>
            <p className="mt-2 text-xl font-black capitalize text-white">{value}</p>
          </div>
        ))}
      </div>

      {!loading && (
        <div className="mt-10 space-y-10">
          <section className="relative overflow-hidden rounded-[30px] border-[6px] border-blue-600/40 bg-[var(--surface-elevated)] p-8 shadow-[0_20px_50px_rgba(37,99,235,0.15)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1.5 rounded-full bg-blue-500" />
              <h3 className="text-lg font-black text-[var(--text-primary)]">State Replay</h3>
            </div>
            <StateReplayViewer events={events} />
          </section>

          <section className="relative overflow-hidden rounded-[30px] border-[6px] border-blue-600/40 bg-[var(--surface-elevated)] p-8 shadow-[0_20px_50px_rgba(37,99,235,0.15)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1.5 rounded-full bg-blue-500" />
              <h3 className="text-lg font-black text-[var(--text-primary)]">
                Event Timeline
                <span className="ml-3 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">{events.length} Recorded Actions</span>
              </h3>
            </div>
            <EventTimeline events={events} />
          </section>
        </div>
      )}
    </>
  );
}

export default EventLogPage;
