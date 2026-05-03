import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

function PremiumGate({ variant = 'fullscreen', message }) {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-soft)]">
        <Lock className="h-3.5 w-3.5 text-[var(--accent-strong)]" />
        <Link to="/app/subscription" className="text-[var(--accent-strong)] underline underline-offset-2 transition hover:text-[var(--text-primary)]">
          Upgrade to Premium
        </Link>
      </span>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="w-full max-w-md rounded-[34px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-10 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--surface-highlight)] text-[var(--accent-strong)]">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">Premium Feature</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {message || 'This feature requires a Premium subscription.'}
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Rs.199 / month</p>
        <Link
          to="/app/subscription"
          className="mt-7 inline-block rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--accent)]"
        >
          Upgrade to Premium
        </Link>
      </div>
    </div>
  );
}

export default PremiumGate;
