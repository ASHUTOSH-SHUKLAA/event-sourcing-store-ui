import { useEffect, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import UserPill from '../../components/common/UserPill';
import { getAdminUsers } from '../../api/appApi';

const navItems = [
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/songs', label: 'Songs Monitoring' },
  { to: '/admin/subscriptions', label: 'Subscription Monitoring' },
];

// Mock users for demo when backend is unavailable
const MOCK_USERS = [
  { id: '1', email: 'alice@example.com', name: 'Alice Johnson', role: 'user', plan: 'premium', created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
  { id: '2', email: 'bob@example.com', name: 'Bob Smith', role: 'user', plan: 'free', created_at: new Date(Date.now() - 45 * 86400000).toISOString() },
  { id: '3', email: 'carol@example.com', name: 'Carol White', role: 'user', plan: 'premium', created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: '4', email: 'dave@example.com', name: 'Dave Brown', role: 'user', plan: 'free', created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: '5', email: 'eve@example.com', name: 'Eve Davis', role: 'user', plan: 'free', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
];

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <p className={`text-3xl font-bold ${accent || 'text-[var(--text-primary)]'}`}>{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAdminUsers()
      .then((data) => setUsers(data.length ? data : MOCK_USERS))
      .catch(() => setUsers(MOCK_USERS));
  }, []);

  const filtered = users.filter((u) =>
    [u.email, u.name].some((v) => (v || '').toLowerCase().includes(search.toLowerCase()))
  );

  const premiumCount = users.filter((u) => u.plan === 'premium').length;
  const freeCount = users.filter((u) => u.plan === 'free').length;

  return (
    <AppShell
      navItems={navItems}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search users by name or email…"
      rightSlot={<UserPill label="A" />}
    >
      <h2 className="text-3xl font-bold text-[var(--text-primary)]">User Management</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage and monitor all registered users.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Premium Users" value={premiumCount} accent="text-green-600" />
        <StatCard label="Free Users" value={freeCount} />
        <StatCard label="New This Month" value={users.filter((u) => new Date(u.created_at) > new Date(Date.now() - 30 * 86400000)).length} />
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface-alt)] px-6 py-3">
          <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Name', 'Email', 'Plan', 'Joined'].map((h) => (
                <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id || user.email} className="border-b border-[var(--border)] hover:bg-[var(--surface-alt)] transition">
                <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{user.name || '—'}</td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${user.plan === 'premium' ? 'bg-[rgba(61,220,151,0.14)] text-[var(--green-500)]' : 'bg-[rgba(148,163,184,0.14)] text-[var(--text-secondary)]'}`}>
                    {user.plan || 'free'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

export default AdminUsersPage;
