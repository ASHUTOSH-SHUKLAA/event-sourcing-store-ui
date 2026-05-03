import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import UserPill from './UserPill';

function HeaderActions({
  showPremium = false,
  isPremium = false,
  premiumTo = '/app/subscription',
  premiumLabel = 'Premium',
  pillLabel = 'U',
  leading,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {leading}
      {showPremium && (
        <Link
          to={premiumTo}
          className="rounded-full border border-transparent px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
          style={{ background: 'var(--accent-strong)' }}
        >
          {premiumLabel}
        </Link>
      )}
      <ThemeToggle />
      <UserPill label={pillLabel} />
    </div>
  );
}

export default HeaderActions;
