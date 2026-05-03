import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, List, Shield } from 'lucide-react';
import StatusCard from '../../components/common/StatusCard';
import EventTimeline from '../../components/subscription/EventTimeline';
import StateReplayViewer from '../../components/subscription/StateReplayViewer';
import { getAdminUserEvents } from '../../api/appApi';
import { applyEvent, INITIAL_STATE } from '../../utils/subscriptionReducer';

const REQUIRED_FIELDS = ['id', 'aggregate_id', 'event_type', 'version', 'payload', 'created_at'];

function AdminUserEventsPage() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const sorted = [...events].sort((a, b) => a.version - b.version);
  const currentState = sorted.reduce(applyEvent, INITIAL_STATE);

  useEffect(() => {
    let active = true;

    getAdminUserEvents(userId)
      .then((res) => {
        if (!active) return;
        const valid = (res || []).filter((event) => {
          if (!REQUIRED_FIELDS.every((field) => field in event)) {
            console.warn('[AdminUserEventsPage] Skipping invalid event:', event);
            return false;
          }
          return true;
        });
        setEvents(valid);
      })
      .catch(() => {
        if (active) setEvents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <>
      <div className="flex items-center gap-4 rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-6 shadow-[var(--shadow-card)]">
        <button 
          onClick={() => navigate('/admin/users')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">User Audit Log</h2>
          <p className="text-sm text-[var(--text-secondary)]">Events for user ID: <span className="font-mono text-blue-400">{userId}</span></p>
        </div>
      </div>

      {loading && <div className="mt-6"><StatusCard title="Loading audit logs..." /></div>}

      {!loading && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Event Count', value: events.length },
              { label: 'Current Plan', value: currentState.plan.toUpperCase(), highlight: true },
              { label: 'Account Version', value: events.length > 0 ? events[events.length - 1].version : 0 },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`group relative overflow-hidden rounded-[28px] border-2 border-blue-400/20 p-5 transition-all duration-300 hover:scale-[1.02] ${highlight ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_10px_30px_rgba(37,99,235,0.2)]' : 'bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)]'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-100/70' : 'text-[var(--text-secondary)]'}`}>{label}</p>
                <p className={`mt-2 text-2xl font-black ${highlight ? 'text-white' : 'text-[var(--text-primary)]'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-10">
            <section className="relative overflow-hidden rounded-[30px] border-[1px] border-[var(--border-strong)] bg-[var(--surface-elevated)] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-black text-[var(--text-primary)]">Admin State Projection</h3>
              </div>
              <StateReplayViewer events={events} />
            </section>

            <section className="relative overflow-hidden rounded-[30px] border-[1px] border-[var(--border-strong)] bg-[var(--surface-elevated)] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <List className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-black text-[var(--text-primary)]">Full Event History</h3>
              </div>
              <EventTimeline events={events} />
            </section>
          </div>
        </>
      )}
    </>
  );
}

export default AdminUserEventsPage;
