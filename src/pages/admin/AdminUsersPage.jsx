import { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { getAdminUsers } from '../../api/appApi';
import { ExternalLink } from 'lucide-react';

const NEW_THIS_MONTH_CUTOFF = Date.now() - 30 * 86400000;

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className={`text-3xl font-bold ${accent || 'text-[var(--text-primary)]'}`}>{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function AdminUsersPage() {
  const { searchTerm: search } = useOutletContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAdminUsers(page, 50)
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  }, [page]);

  const filtered = useMemo(() => {
    return users.filter((u) =>
      [u.email, u.name].some((v) => (v || '').toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search]);

  const premiumCount = useMemo(() => users.filter((u) => u.plan === 'premium').length, [users]);
  const freeCount = useMemo(() => users.filter((u) => u.plan === 'free').length, [users]);
  const newThisMonthCount = useMemo(() => 
    users.filter((u) => new Date(u.created_at).getTime() > NEW_THIS_MONTH_CUTOFF).length,
    [users]
  );

  return (
    <>
      <div className="rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">User Management</h2>
        <p className="text-sm text-[var(--text-secondary)]">Oversee access and account tiers across the platform.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Premium', value: premiumCount, highlight: true },
          { label: 'Free Tier', value: freeCount },
          { label: 'New (Month)', value: newThisMonthCount, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`group relative overflow-hidden rounded-[28px] border-2 border-blue-400/20 p-5 transition-all duration-300 hover:scale-[1.02] ${highlight ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_10px_30px_rgba(37,99,235,0.2)]' : 'bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)]'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-100/70' : 'text-[var(--text-secondary)]'}`}>{label}</p>
            <p className={`mt-2 text-2xl font-black ${highlight ? 'text-white' : 'text-[var(--text-primary)]'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-[30px] border-[6px] border-blue-600/30 bg-[var(--surface-elevated)] shadow-[0_20px_50px_rgba(37,99,235,0.15)]">
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-blue-500/10 bg-[var(--surface)]">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
            {filtered.length} Recorded User{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Name', 'Email', 'Plan', 'Created', 'Actions'].map((heading) => (
                <th key={heading} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr 
                key={user.id} 
                className="group cursor-pointer border-b border-[var(--border)] transition hover:bg-blue-500/5"
                onClick={() => navigate(`/admin/users/${user.id}/events`)}
              >
                <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{user.name || '-'}</td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{user.email || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.plan === 'premium' ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'bg-[var(--surface-alt)] text-[var(--text-secondary)]'}`}>
                    {user.plan || 'free'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-blue-500 opacity-0 transition group-hover:opacity-100">
                    <ExternalLink className="h-3 w-3" />
                    Audit Log
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
                  No users match your search.
                </td>
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
          disabled={users.length < 50}
          className="rounded-full bg-[var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
}

export default AdminUsersPage;
