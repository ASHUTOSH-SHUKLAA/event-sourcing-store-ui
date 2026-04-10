import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

function PremiumGate({ variant = 'fullscreen', message }) {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
        <Lock className="h-3 w-3 text-[var(--green-500)]" />
        <Link to="/app/subscription" className="text-[var(--green-500)] hover:text-[var(--text-primary)] underline underline-offset-2">
          Upgrade to Premium
        </Link>
      </span>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-[var(--shadow-card)] max-w-sm w-full">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-alt)] text-[var(--green-500)]">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Premium Feature</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          {message || 'This feature requires a Premium subscription.'}
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)] font-medium">₹199/month</p>
        <Link
          to="/app/subscription"
          className="mt-6 inline-block rounded-3xl bg-[var(--green-500)] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[var(--green-600)] transition"
        >
          Upgrade to Premium
        </Link>
      </div>
    </div>
  );
}

export default PremiumGate;
