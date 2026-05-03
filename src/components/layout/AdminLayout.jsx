import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Users, Music, CreditCard, LayoutDashboard } from 'lucide-react';
import AppShell from './AppShell';
import HeaderActions from '../common/HeaderActions';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Add logic if admin needs search
  };

  const navItems = useMemo(() => [
    { to: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { to: '/admin/songs', label: 'Songs', icon: <Music className="h-4 w-4" /> },
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-4 w-4" /> },
  ], []);

  const searchPlaceholder = useMemo(() => {
    if (location.pathname.includes('users')) return "Search users by name or email...";
    if (location.pathname.includes('songs')) return "Search monitoring index (Title, Artist, Album)...";
    if (location.pathname.includes('subscriptions')) return "Search subscriptions by email or ID...";
    return "Search admin data...";
  }, [location.pathname]);

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      brand="Admin Panel"
      searchPlaceholder={searchPlaceholder}
      rightSlot={<HeaderActions pillLabel="A" />}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </div>
    </AppShell>
  );
}
