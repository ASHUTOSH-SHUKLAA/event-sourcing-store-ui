import { Link, useLocation } from 'react-router-dom';
import { Search, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useSubscription } from '../../context/useSubscription';
import { usePlayer } from '../../context/PlayerContext';
import MusicPlayer from '../music/MusicPlayer';

function AppShell({
  brand = 'Event Vault',
  subtitle = '',
  navItems = [],
  searchPlaceholder = 'Search songs or artists',
  searchValue = '',
  onSearchChange,
  autoFocusSearch = false,
  headerAction,
  rightSlot,
  children,
}) {
  const location = useLocation();
  const { logout } = useAuth();
  const { isPremium } = useSubscription();
  const { currentTrack } = usePlayer();
  const showHeaderSearch = typeof onSearchChange === 'function';

  const combinedNavItems = [...navItems];
  if (
    isPremium &&
    location.pathname.startsWith('/app') &&
    !combinedNavItems.some((item) => item.to === '/app/liked')
  ) {
    const likedItem = { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4 fill-current" /> };
    const homeIndex = combinedNavItems.findIndex((item) => item.to === '/app/home');
    if (homeIndex >= 0) {
      combinedNavItems.splice(homeIndex + 1, 0, likedItem);
    } else {
      combinedNavItems.unshift(likedItem);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex h-screen w-full flex-col lg:flex-row">
        <aside className="hidden w-[310px] shrink-0 border-r border-[var(--border-strong)] bg-[var(--surface-glass)] px-7 py-8 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="rounded-[34px] border border-[var(--border-strong)] bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-6 shadow-2xl">
            <div className="flex items-center gap-5">
              <div 
                className="group relative flex h-16 w-16 items-center justify-center rounded-[24px] border-2 border-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-black text-white shadow-lg animate-breathing-blue transition-all duration-500 hover:scale-110"
              >
                <div className="absolute inset-0 rounded-[24px] bg-white opacity-10 blur-sm" />
                <span className="relative z-10 tracking-tighter">EV</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black uppercase tracking-[0.2em] text-blue-400">Vault</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100/40">Secure Events</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 flex-1 space-y-2">
            {combinedNavItems.map((item, index) => {
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    'group flex items-center gap-3 rounded-[24px] border px-4 py-3 text-sm font-semibold transition-all duration-200',
                    active
                      ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[var(--shadow-soft)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  {item.icon && (
                    <span 
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                        active 
                          ? 'bg-[var(--accent-strong)] text-white' 
                          : `bg-[var(--nav-icon-${(index % 3) + 1}-bg)] text-[var(--nav-icon-${(index % 3) + 1})] group-hover:scale-110`
                      }`}
                    >
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-auto mb-2 rounded-[24px] bg-[var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95"
          >
            Sign out
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[var(--border)] bg-[var(--surface-glass)] px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="rounded-[30px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="group relative flex h-12 w-12 items-center justify-center rounded-[18px] border border-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-black text-white shadow-lg animate-breathing-blue"
                  >
                    <span className="relative z-10 tracking-tighter">EV</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Vault</h1>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Sign out
                </button>
              </div>
              <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {combinedNavItems.map((item) => {
                  const active = item.exact
                    ? location.pathname === item.to
                    : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={[
                        'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition',
                        active
                          ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                          : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--border-strong)] bg-[var(--surface-glass)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex w-full flex-1 items-center gap-3">
                {showHeaderSearch ? (
                  <div className="relative flex-1 lg:max-w-2xl">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="search"
                      autoFocus={autoFocusSearch}
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="h-12 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none shadow-[var(--shadow-soft)] focus:border-[var(--accent-strong)] focus:ring-4 focus:ring-[var(--ring)]"
                    />
                  </div>
                ) : (
                  <div className="flex-1" />
                )}
                {headerAction}
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">{rightSlot}</div>
            </div>
          </header>

          <main 
            className="relative flex-1 overflow-y-auto"
            style={{ paddingBottom: currentTrack ? '140px' : '24px' }}
          >
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8">
              {children}
            </div>
          </main>
          <MusicPlayer />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
