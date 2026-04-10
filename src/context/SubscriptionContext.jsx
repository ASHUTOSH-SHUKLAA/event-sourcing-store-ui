import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { downgradeSubscription, getCurrentSubscription, upgradeSubscription } from '../api/subscriptionApi';

const SubscriptionContext = createContext(null);

const INITIAL = { plan: 'free', status: 'active', price: 0, version: 0 };

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCurrentSubscription();
      setSubscription(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upgrade = useCallback(async (fireToast) => {
    const previousState = subscription;
    // Optimistic update
    setSubscription({ plan: 'premium', status: 'active', price: 199, version: previousState.version + 1 });
    setError(null);
    try {
      await upgradeSubscription();
      if (fireToast) fireToast('Event fired: PlanUpgraded');
      await refresh();
    } catch (err) {
      // Rollback
      setSubscription(previousState);
      setError(err.message || 'Upgrade failed. Please try again.');
    }
  }, [subscription, refresh]);

  const downgrade = useCallback(async (fireToast) => {
    const previousState = subscription;
    setSubscription({ plan: 'free', status: 'active', price: 0, version: previousState.version + 1 });
    setError(null);
    try {
      await downgradeSubscription();
      if (fireToast) fireToast('Event fired: PlanDowngraded');
      await refresh();
    } catch (err) {
      setSubscription(previousState);
      setError(err.message || 'Downgrade failed. Please try again.');
    }
  }, [subscription, refresh]);

  const isPremium = subscription.plan === 'premium';

  return (
    <SubscriptionContext.Provider value={{ subscription, isPremium, loading, error, upgrade, downgrade, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}

export default SubscriptionContext;
