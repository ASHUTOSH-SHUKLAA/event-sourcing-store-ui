import { Check, Home, Heart, List, Pause, Play, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/useSubscription';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Basic event log access', 'Track play history', 'Community features'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    features: ['Everything in Free', 'iTunes song search', 'Like & save songs', 'Priority event processing'],
    highlight: true,
  },
];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function ProRataEstimate({ subscription }) {
  if (!subscription?.started_at || !subscription?.current_period_end || !subscription?.price) return null;
  const total = new Date(subscription.current_period_end) - new Date(subscription.started_at);
  const used = Date.now() - new Date(subscription.started_at);
  if (total <= 0) return null;
  const fraction = Math.min(1, used / total);
  const charge = Math.round(fraction * subscription.price);
  return (
    <span className="font-semibold text-amber-300">
      ≈ ₹{charge} charged for {Math.round(fraction * 30)} days used
    </span>
  );
}

function SubscriptionPage() {
  const { subscription, isPremium, upgrade, downgrade, pause, resume, loading, error, refresh } = useSubscription();
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const navigate = useNavigate();

  const isActive   = subscription?.status === 'active';
  const isPaused   = subscription?.status === 'paused';
  const isCancelPending = subscription?.cancel_at_period_end === true;
  const periodEnd  = subscription?.current_period_end;
  const daysLeft   = daysUntil(periodEnd);
  const pausedAt   = subscription?.paused_at;
  const pauseDays  = subscription?.pause_days_remaining;

  const handleDowngrade = async () => {
    setShowDowngradeModal(false);
    await downgrade();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-[28px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={refresh} className="rounded-full border border-red-500/30 px-3 py-1 text-xs font-semibold hover:bg-red-500/10 transition">Retry</button>
        </div>
      )}

      {/* Paused banner */}
      {isPaused && (
        <div className="flex items-start gap-3 rounded-[28px] border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-300">
          <Pause className="h-5 w-5 mt-0.5 shrink-0 text-blue-400" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-blue-200">Your subscription is paused</p>
            <p>
              You have <strong>{pauseDays ?? '?'} day{pauseDays !== 1 ? 's' : ''}</strong> remaining —
              they are frozen and will resume exactly where you left off when you hit Resume.
              {pausedAt && (
                <span className="ml-1 text-blue-400/70 text-xs">
                  (Paused {new Date(pausedAt).toLocaleDateString()})
                </span>
              )}
            </p>
            <button
              onClick={resume}
              disabled={loading}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition"
            >
              <Play className="h-3 w-3" /> {loading ? 'Resuming...' : 'Resume Subscription'}
            </button>
          </div>
        </div>
      )}

      {/* Info: All plan changes (Upgrade/Downgrade) are now immediate */}

      {/* Header */}
      <div className="rounded-[34px] border border-[var(--border-strong)] bg-[var(--hero-glow)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">Plans</p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
          Manage your listening plan
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
          Upgrade for full catalog search and saved songs. Premium subscribers can also{' '}
          <strong className="text-[var(--text-primary)]">pause their plan</strong> to freeze
          the remaining days — no time wasted when life gets busy.
        </p>
        {isPremium && isActive && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-1.5 text-xs font-semibold text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Premium active · {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrent = subscription?.plan === plan.id;
          const isCurrentAndPaused = isCurrent && isPaused;

          const cardBg = isCurrent
            ? 'border-transparent text-white shadow-[var(--shadow-card)]'
            : plan.highlight
              ? 'border-[var(--accent-strong)]/30 bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]'
              : 'border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-soft)]';

          return (
            <div
              key={plan.id}
              className={`flex min-h-[340px] flex-col gap-5 rounded-[30px] border p-7 transition ${cardBg}`}
              style={{ background: isCurrent ? 'var(--brand-tile-bg)' : undefined }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${isCurrent ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                    {isCurrent ? 'Your Plan' : 'Plan'}
                  </p>
                  <h2 className={`mt-3 text-3xl font-semibold ${isCurrent ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {plan.name}
                  </h2>
                </div>
                {isCurrent && isPaused ? (
                  <span className="rounded-full bg-blue-400/20 px-3 py-1 text-xs font-semibold text-blue-200 backdrop-blur-md">Paused</span>
                ) : isCurrent ? (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">Current</span>
                ) : plan.highlight ? (
                  <span className="rounded-full bg-[var(--accent-strong)] px-3 py-1 text-xs font-semibold text-white">Popular</span>
                ) : null}
              </div>

              <div>
                <p className={`text-4xl font-semibold ${isCurrent ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  ₹{plan.price}
                </p>
                <p className={`mt-1 text-sm ${isCurrent ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>per month</p>
              </div>

              <ul className="space-y-3">
                {(plan.features || []).map((feature) => (
                  <li key={feature} className={`flex items-center gap-2 text-sm ${isCurrent ? 'text-white/90' : 'text-[var(--text-secondary)]'}`}>
                    <Check className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-white' : 'text-[var(--accent-strong)]'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action buttons */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                {plan.id === 'premium' && isCurrent && isPaused ? (
                  <button
                    onClick={resume}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60 transition"
                  >
                    <Play className="h-4 w-4" /> {loading ? 'Resuming...' : 'Resume Subscription'}
                  </button>
                ) : plan.id === 'premium' && isCurrent && isActive && !isCancelPending ? (
                  <button
                    onClick={pause}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/30 disabled:opacity-60 transition"
                  >
                    <Pause className="h-4 w-4" /> {loading ? 'Pausing...' : 'Pause Subscription'}
                  </button>
                ) : plan.id === 'premium' && !isCurrent && !isCancelPending ? (
                  <button
                    onClick={upgrade}
                    disabled={loading}
                    className="rounded-full bg-[var(--accent-strong)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent)] disabled:opacity-60 transition"
                  >
                    {loading ? 'Upgrading...' : 'Upgrade to Premium'}
                  </button>
                ) : plan.id === 'premium' && isCurrent && isCancelPending ? (
                  <span className="inline-block rounded-full bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-300 text-center">
                    Cancellation Scheduled
                  </span>
                ) : plan.id === 'free' && isCurrent ? (
                  <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md text-center">Active</span>
                ) : plan.id === 'free' && !isCurrent && !isCancelPending ? (
                  <button
                    onClick={() => setShowDowngradeModal(true)}
                    disabled={loading || isPaused}
                    className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-amber-500/50 disabled:opacity-60 transition"
                  >
                    Switch to Free
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box: Pause vs Downgrade */}
      {isPremium && (
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Info className="h-4 w-4 text-blue-400" />
            Pause vs Downgrade — what's the difference?
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--text-secondary)]">
            <div className="space-y-1.5 rounded-[20px] border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="font-semibold text-blue-300 flex items-center gap-2"><Pause className="h-3.5 w-3.5" /> Pause</p>
              <p>Time stops. Your remaining days are frozen. Resume anytime and pick up with the exact same days left — no credit lost, no charge adjustment.</p>
            </div>
            <div className="space-y-1.5 rounded-[20px] border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="font-semibold text-amber-300 flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Downgrade</p>
              <p>
                You are charged for the days used in the current cycle.{' '}
                <ProRataEstimate subscription={subscription} />
                . Your plan changes to Free immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade confirmation modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-[30px] border border-amber-500/20 bg-[var(--surface-elevated)] p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Confirm Downgrade</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-6">
              You will be charged for the days you've used this billing cycle
              (<ProRataEstimate subscription={subscription} />).
              Your plan will switch to <strong className="text-[var(--text-primary)]">Free immediately</strong>.
            </p>
            <p className="text-xs text-blue-400 bg-blue-500/10 rounded-[14px] px-4 py-2 border border-blue-500/20">
              💡 Tip: Use <strong>Pause</strong> instead if you just need a break — your days are frozen and no pro-rata charge is applied.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDowngrade}
                disabled={loading}
                className="flex-1 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-60 transition"
              >
                {loading ? 'Downgrading...' : 'Yes, Switch to Free'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPage;
