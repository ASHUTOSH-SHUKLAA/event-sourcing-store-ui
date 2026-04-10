import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import StatusCard from '../../components/common/StatusCard';
import UserPill from '../../components/common/UserPill';
import EventTimeline from '../../components/subscription/EventTimeline';
import StateReplayViewer from '../../components/subscription/StateReplayViewer';
import { useSubscription } from '../../context/SubscriptionContext';
import { getSubscriptionEvents } from '../../api/subscriptionApi';

const REQUIRED_FIELDS = ['id', 'aggregate_id', 'event_type', 'version', 'payload', 'created_at'];

function EventLogPage() {
  const { isPremium } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const navItems = [
    { to: '/app/home', label: 'Home' },
    { to: '/app/subscription/events', label: 'Event Log' },
    { to: '/app/events', label: 'Events Debugger' },
  ];

  useEffect(() => {
    setLoading(true);
    getSubscriptionEvents()
      .then((res) => {
        const valid = (res.data || []).filter((event) => {
          if (!REQUIRED_FIELDS.every((field) => field in event)) {
            console.warn('[EventLogPage] Skipping invalid event:', event);
            return false;
          }
          return true;
        });
        setEvents(valid);
      })
      .finally(() => setLoading(false));
  }, []);

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
      <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Event Log</h2>
          <p className="text-sm text-[var(--text-secondary)]">Append-only audit trail of your subscription events.</p>
        </div>
      </div>

      {loading && <div className="mt-6"><StatusCard title="Loading events..." /></div>}

      {!loading && (
        <>
          <section className="mt-6">
            <h3 className="mb-3 text-base font-bold text-[var(--text-primary)]">State Replay</h3>
            <StateReplayViewer events={events} />
          </section>

          <section className="mt-8">
            <h3 className="mb-3 text-base font-bold text-[var(--text-primary)]">
              Timeline
              <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">{events.length} events</span>
            </h3>
            <EventTimeline events={events} />
          </section>
        </>
      )}
    </AppShell>
  );
}

export default EventLogPage;
