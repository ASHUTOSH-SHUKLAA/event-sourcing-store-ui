import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Home, Search, Heart, List, Activity, Sparkles } from 'lucide-react';
import AppShell from './AppShell';
import HeaderActions from '../common/HeaderActions';
import { useSubscription } from '../../context/useSubscription';

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value && location.pathname !== '/app/liked') {
      navigate(`/app/search?q=${encodeURIComponent(value)}`);
    }
  };

  const navItems = useMemo(() => [
    { to: '/app/home', label: 'Home', icon: <Home className="h-4 w-4" />, exact: true },
    { to: '/app/liked', label: 'Liked Songs', icon: <Heart className="h-4 w-4" /> },
    { to: '/app/subscription/events', label: 'Event Log', icon: <List className="h-4 w-4" /> },

  ], []);

  const showSearch = location.pathname === '/app/search' || location.pathname === '/app/home' || location.pathname === '/app/liked';

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={showSearch ? handleSearchChange : undefined}
      searchPlaceholder={location.pathname === '/app/liked' ? "Filter liked songs..." : "Search songs, artists, albums..."}
      rightSlot={<HeaderActions showPremium isPremium={isPremium} pillLabel="U" />}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </div>
    </AppShell>
  );
}
