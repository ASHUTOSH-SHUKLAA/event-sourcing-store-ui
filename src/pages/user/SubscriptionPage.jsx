import { Check } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import UserPill from '../../components/common/UserPill';
import { useSubscription } from '../../context/SubscriptionContext';
import { useToast } from '../../components/common/Toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Browse songs on Home', 'View Event Log', 'Access Events Debugger'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    features: ['Everything in Free', 'Search songs via iTunes', 'Like & save songs'],
    highlight: true,
  },
];

function SubscriptionPage() {
  const { subscription, isPremium, upgrade, downgrade, loading, error, refresh } = useSubscription();
  const { fireToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    navigate(`/app/search${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  };

  const navItems = [
    { to: '/app/home', label: 'Home' },
    { to: '/app/subscription/events', label: 'Event Log' },
    { to: '/app/events', label: 'Events Debugger' },
  ];

  return (
    <AppShell
      navItems={navItems}
      searchValue={searchTerm}
      onSearchChange={isPremium ? handleSearchChange : undefined}
      searchPlaceholder="Search songs, artists, albums..."
      rightSlot={
        <div className="flex items-center gap-3">
          <Link
            to="/app/subscription"
            className={isPremium
              ? 'rounded-3xl bg-[var(--green-500)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[var(--green-600)]'
              : 'rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-strong)]'}
          >
            Premium
          </Link>
          <UserPill label="U" />
        </div>
      }
    >
      {error && (
        <div className="flex items-center gap-3 rounded-3xl border border-red-600/30 bg-[rgba(220,38,38,0.12)] px-4 py-3 text-sm text-red-200">
          <p className="flex-1">{error}</p>
          <button onClick={refresh} className="rounded-2xl border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/10 transition">Retry</button>
        </div>
      )}

      <div className="grid max-w-3xl gap-5 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrent = subscription.plan === plan.id;
          const currentStyles = isCurrent
            ? 'border-[var(--green-500)] bg-[var(--surface-alt)] shadow-[var(--shadow-card)]'
            : plan.highlight
              ? 'border-[var(--green-500)]/40 bg-[var(--surface)] shadow-[var(--shadow-soft)]'
              : 'border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]';

          const textMuted = 'text-[var(--text-secondary)]';

          return (
            <div
              key={plan.id}
              className={`flex min-h-[320px] flex-col gap-5 rounded-[28px] border p-7 transition ${currentStyles}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${textMuted}`}>
                    {isCurrent ? 'Selected Plan' : 'Plan'}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-[var(--text-primary)]">{plan.name}</h2>
                </div>
                {isCurrent ? (
                  <span className="rounded-full bg-[var(--green-500)]/15 px-3 py-1 text-xs font-semibold text-[var(--green-700)]">
                    Current
                  </span>
                ) : plan.highlight ? (
                  <span className="rounded-full bg-[var(--green-500)] px-3 py-1 text-xs font-semibold text-black">Popular</span>
                ) : null}
              </div>

              <div>
                <p className="text-4xl font-bold text-[var(--text-primary)]">Rs.{plan.price}</p>
                <p className={`mt-1 text-sm ${textMuted}`}>per month</p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-2 text-sm ${textMuted}`}>
                    <Check className={`h-4 w-4 shrink-0 ${isCurrent && plan.id === 'premium' ? 'text-white' : 'text-[var(--green-500)]'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2">
                {isCurrent ? (
                  <span className="inline-block rounded-xl bg-[var(--green-500)]/15 px-4 py-2 text-sm font-semibold text-[var(--green-700)]">
                    Active
                  </span>
                ) : plan.id === 'premium' ? (
                  <button
                    onClick={() => upgrade(fireToast)}
                    disabled={loading}
                    className="rounded-xl bg-[var(--green-500)] px-5 py-2 text-sm font-semibold text-black hover:bg-[var(--green-600)] transition disabled:opacity-60"
                  >
                    {loading ? 'Upgrading...' : 'Upgrade to Premium'}
                  </button>
                ) : (
                  <button
                    onClick={() => downgrade(fireToast)}
                    disabled={loading}
                    className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-alt)] transition disabled:opacity-60"
                  >
                    {loading ? 'Downgrading...' : 'Switch to Free'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

export default SubscriptionPage;
