import { Fragment, useEffect, useRef, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import UserPill from '../../components/common/UserPill';
import EventTimeline from '../../components/subscription/EventTimeline';
import {
  adminDowngradeSubscription,
  adminUpgradeSubscription,
  getAdminMetrics,
  getAdminSubscriptions,
  getAdminUserEvents,
  getSubscriptionEvents,
} from '../../api/subscriptionApi';

const navItems = [
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/songs', label: 'Songs Monitoring' },
  { to: '/admin/subscriptions', label: 'Subscription Monitoring' },
];

function AdminSubscriptionsPage() {
  const [metrics, setMetrics] = useState(null);
  const [subs, setSubs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [rowEvents, setRowEvents] = useState({});
  const [liveEvents, setLiveEvents] = useState([]);
  const [error, setError] = useState('');
  const [pendingActionId, setPendingActionId] = useState('');
  const intervalRef = useRef(null);

  const loadData = async () => {
    try {
      const [m, s] = await Promise.all([getAdminMetrics(), getAdminSubscriptions()]);
      setMetrics(m.data);
      setSubs(s.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    }
  };

  const loadLive = async () => {
    try {
      const res = await getSubscriptionEvents();
      const sorted = (res.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setLiveEvents(sorted.slice(0, 5));
    } catch { /* silent */ }
  };

  useEffect(() => {
    loadData();
    loadLive();
    intervalRef.current = setInterval(loadLive, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const toggleRow = async (sub) => {
    if (expandedId === sub.aggregate_id) { setExpandedId(null); return; }
    setExpandedId(sub.aggregate_id);
    if (!rowEvents[sub.aggregate_id]) {
      try {
        const res = await getAdminUserEvents(sub.aggregate_id);
        setRowEvents((prev) => ({ ...prev, [sub.aggregate_id]: res.data || [] }));
      } catch {
        setRowEvents((prev) => ({ ...prev, [sub.aggregate_id]: [] }));
      }
    }
  };

  const PLAN_BADGE = { premium: 'bg-[rgba(61,220,151,0.14)] text-[var(--green-500)]', free: 'bg-[rgba(148,163,184,0.14)] text-[var(--text-secondary)]' };
  const STATUS_BADGE = { active: 'bg-[rgba(61,220,151,0.14)] text-[var(--green-500)]', cancelled: 'bg-[rgba(239,68,68,0.16)] text-red-400' };
  const updateSubscriptionPlan = async (sub, nextPlan) => {
    const action = nextPlan === 'premium' ? adminUpgradeSubscription : adminDowngradeSubscription;
    setPendingActionId(sub.aggregate_id);
    setError('');
    try {
      await action(sub.aggregate_id);
      await Promise.all([loadData(), loadLive()]);
      if (expandedId === sub.aggregate_id) {
        const res = await getAdminUserEvents(sub.aggregate_id);
        setRowEvents((prev) => ({ ...prev, [sub.aggregate_id]: res.data || [] }));
      }
    } catch (err) {
      setError(err.message || `Failed to switch ${sub.user_email} to ${nextPlan}.`);
    } finally {
      setPendingActionId('');
    }
  };

  return (
    <AppShell navItems={navItems} rightSlot={<UserPill label="A" />}>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Subscription Monitoring</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Track subscription status and event history.</p>

      {error && (
        <div className="mt-4 rounded-3xl border border-red-600/30 bg-[rgba(220,38,38,0.12)] px-4 py-3 text-sm text-red-200">{error}</div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Subscribers', value: metrics?.total_subscribers ?? '—' },
          { label: 'MRR', value: metrics ? `₹${metrics.mrr.toLocaleString('en-IN')}` : '—', accent: 'text-[var(--green-500)]' },
          { label: 'Active', value: metrics?.active_count ?? '—', accent: 'text-[var(--green-500)]' },
          { label: 'Cancelled', value: metrics?.cancelled_count ?? '—' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
            <p className={`text-2xl font-bold ${accent || 'text-[var(--text-primary)]'}`}>{value}</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{label}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-8 text-base font-bold text-[var(--text-primary)]">All Subscriptions</h3>
      <div className="mt-3 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)]">
              {['Email', 'Plan', 'Status', 'Started At', 'Action'].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map((sub) => (
              <Fragment key={sub.aggregate_id}>
                <tr
                  onClick={() => toggleRow(sub)}
                  className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--surface-alt)] transition"
                >
                  <td className="px-5 py-3 text-sm text-[var(--text-primary)]">{sub.user_email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PLAN_BADGE[sub.plan] || 'bg-[var(--surface-alt)] text-[var(--text-secondary)]'}`}>{sub.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[sub.status] || 'bg-[var(--surface-alt)] text-[var(--text-secondary)]'}`}>{sub.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{new Date(sub.started_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        updateSubscriptionPlan(sub, sub.plan === 'premium' ? 'free' : 'premium');
                      }}
                      disabled={pendingActionId === sub.aggregate_id}
                      className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-alt)] disabled:opacity-60"
                    >
                      {pendingActionId === sub.aggregate_id
                        ? 'Updating...'
                        : sub.plan === 'premium'
                          ? 'Downgrade'
                          : 'Upgrade'}
                    </button>
                  </td>
                </tr>
                {expandedId === sub.aggregate_id && (
                  <tr>
                    <td colSpan={5} className="bg-[var(--surface-alt)] px-5 py-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Event history</p>
                      <EventTimeline events={rowEvents[sub.aggregate_id] || []} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--text-secondary)]">No subscription records yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 text-base font-bold text-[var(--text-primary)]">
        Live Event Stream
        <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">auto-refreshes every 30s</span>
      </h3>
      <div className="mt-3">
        <EventTimeline events={liveEvents} />
      </div>
    </AppShell>
  );
}

export default AdminSubscriptionsPage;
