import { Fragment, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import HeaderActions from '../../components/common/HeaderActions';
import EventTimeline from '../../components/subscription/EventTimeline';
import {
  adminDowngradeSubscription,
  adminUpgradeSubscription,
  getAdminMetrics,
  getAdminSubscriptions,
  getAdminUserEvents,
  getSubscriptionEvents,
} from '../../api/subscriptionApi';
import { getAdminUsers } from '../../api/appApi';
import { Search } from 'lucide-react';



function AdminSubscriptionsPage() {
  const { searchTerm: search } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [rowEvents, setRowEvents] = useState({});
  const [liveEvents, setLiveEvents] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pendingActionId, setPendingActionId] = useState('');
  const intervalRef = useRef(null);

  const loadData = async (currentPage = page) => {
    try {
      const [u, s] = await Promise.all([getAdminUsers(currentPage, 50), getAdminSubscriptions(currentPage, 50)]);
      setUsers(u || []);
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
    loadData(page);
    loadLive();
    intervalRef.current = setInterval(loadLive, 30000);
    return () => clearInterval(intervalRef.current);
  }, [page]);

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

  const premiumCount = subs.filter(s => s.plan === 'premium' && s.status === 'active').length;
  const churnedCount = subs.filter(s => s.plan === 'free' || ['cancelled', 'inactive', 'churned'].includes(s.status?.toLowerCase())).length;
  const mrr = premiumCount * 199;

  const filteredSubs = subs.filter(s => 
    [s.user_email, s.email, s.aggregate_id].some(v => 
      (v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

      return (
    <>
      <div className="rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Subscription Monitoring</h2>
        <p className="text-sm text-[var(--text-secondary)]">Track subscription performance and real-time business events.</p>
      </div>

      {error && (
        <div className="mt-4 rounded-3xl border border-red-600/30 bg-[rgba(220,38,38,0.12)] px-4 py-3 text-sm text-red-200">{error}</div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Active Premium', value: premiumCount, highlight: true },
          { label: 'Real MRR', value: `₹${mrr.toLocaleString('en-IN')}`, highlight: true },
          { label: 'Total Churned', value: churnedCount },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`group relative overflow-hidden rounded-[28px] border-2 border-blue-400/20 p-5 transition-all duration-300 hover:scale-[1.02] ${highlight ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_10px_30px_rgba(37,99,235,0.2)]' : 'bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)]'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-100/70' : 'text-[var(--text-secondary)]'}`}>{label}</p>
            <p className={`mt-2 text-2xl font-black ${highlight ? 'text-white' : 'text-[var(--text-primary)]'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-black uppercase tracking-widest text-[var(--text-primary)]">All Subscriptions</h3>
      </div>
      <div className="mt-4 overflow-hidden rounded-[30px] border-[6px] border-blue-600/30 bg-[var(--surface-elevated)] shadow-[0_20px_50px_rgba(37,99,235,0.15)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-blue-500/10 bg-[var(--surface-alt)]">
              {['Subscriber Identity', 'Current Plan', 'Status', 'Started At'].map((h) => (
                <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSubs.map((sub, idx) => (
              <tr
                key={sub.aggregate_id || sub.user_email || idx}
                className="border-b border-blue-500/5 transition hover:bg-[var(--surface)]"
              >
                <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">
                  {sub.user_email || sub.email || 'Unknown Identity'}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${PLAN_BADGE[sub.plan] || 'bg-[var(--surface-alt)] text-[var(--text-secondary)]'}`}>{sub.plan}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[sub.status] || 'bg-[var(--surface-alt)] text-[var(--text-secondary)]'}`}>{sub.status}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">{sub.started_at ? new Date(sub.started_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {filteredSubs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[var(--text-secondary)]">No subscriptions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-[var(--text-secondary)]">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={subs.length < 50}
          className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <h3 className="mt-8 text-base font-bold text-[var(--text-primary)]">
        Live Event Stream
        <span className="ml-2 text-xs font-normal text-[var(--text-secondary)]">auto-refreshes every 30s</span>
      </h3>
      <div className="mt-3">
        <EventTimeline events={liveEvents} />
      </div>
    </>
  );
}

export default AdminSubscriptionsPage;
