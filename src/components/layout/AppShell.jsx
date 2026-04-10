import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useSubscription } from '../../context/SubscriptionContext';

function AppShell({
  brand = 'Event Sound',
  subtitle = '',
  navItems = [],
  searchPlaceholder = 'Search songs or artists',
  searchValue = '',
  onSearchChange,
  headerAction,
  rightSlot,
  children,
}) {
  const location = useLocation();
  const { logout } = useAuth();
  const { isPremium } = useSubscription();
  const showHeaderSearch = typeof onSearchChange === 'function';

  const combinedNavItems = [...navItems];
  if (isPremium && !combinedNavItems.some((item) => item.to === '/app/liked')) {
    const likedItem = { to: '/app/liked', label: 'Liked Songs' };
    const homeIndex = combinedNavItems.findIndex((item) => item.to === '/app/home');
    if (homeIndex >= 0) {
      combinedNavItems.splice(homeIndex + 1, 0, likedItem);
    } else {
      combinedNavItems.unshift(likedItem);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-[280px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col px-6 py-8 shadow-[var(--shadow-soft)]">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-alt)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--green-500)] text-lg font-bold text-black shadow-[var(--shadow-soft)]">
                ES
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{brand}</h1>
                {subtitle && <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">Premium audio UX with event-driven orchestration, curated for music lovers.</p>
          </div>

          <nav className="mt-10 flex-1 space-y-2">
            {combinedNavItems.map((item) => {
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    'flex items-center rounded-3xl px-4 py-3 text-base font-medium transition-all duration-150',
                    active
                      ? 'bg-[var(--green-500)]/10 text-[var(--green-500)] ring-1 ring-[var(--green-500)] shadow-[var(--shadow-soft)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-strong)] hover:text-[var(--text-primary)] transition"
          >
            Sign out
          </button>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface-alt)] px-8 py-4 shadow-[var(--shadow-soft)] backdrop-blur-md">
            <div className="flex flex-1 items-center gap-3">
              {showHeaderSearch ? (
                <div className="relative flex-1 max-w-2xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-12 w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none shadow-sm transition focus:border-[var(--green-500)] focus:ring-2 focus:ring-[rgba(34,197,94,0.18)]"
                  />
                </div>
              ) : (
                <div className="flex-1" />
              )}
              {headerAction}
            </div>
            <div className="flex items-center gap-3">{rightSlot}</div>
          </header>

          <main className="flex-1 px-8 py-8 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
