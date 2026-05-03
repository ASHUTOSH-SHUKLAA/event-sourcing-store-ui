import { useCallback, useEffect, useState } from 'react';
import {
  downgradeSubscription,
  getCurrentSubscription,
  upgradeSubscription,
  pauseSubscription,
  resumeSubscription,
} from '../api/subscriptionApi';
import { SubscriptionContext } from './SubscriptionContextValue';
import { useAuth } from './useAuth';

const INITIAL = { plan: 'free', status: 'active', price: 0, version: 0 };

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isBootstrapping } = useAuth();

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await getCurrentSubscription();
      setSubscription(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load subscription');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isBootstrapping) {
      refresh();
    } else if (!isBootstrapping) {
      setLoading(false);
      setSubscription(INITIAL);
    }
  }, [isAuthenticated, isBootstrapping, refresh]);

  const upgrade = useCallback(async () => {
    const previousState = subscription;
    setSubscription({ ...previousState, plan: 'premium', status: 'active', price: 199 });
    setError(null);
    try {
      await upgradeSubscription();
      // Give the background processor a moment to update the DB
      setTimeout(() => refresh(true), 500);
    } catch (err) {
      setSubscription(previousState);
      setError(err.message || 'Upgrade failed. Please try again.');
    }
  }, [subscription, refresh]);

  const downgrade = useCallback(async () => {
    const previousState = subscription;
    setSubscription({ ...previousState, plan: 'free', status: 'active' });
    setError(null);
    try {
      await downgradeSubscription();
      // Give the background processor a moment to update the DB
      setTimeout(() => refresh(true), 500);
    } catch (err) {
      setSubscription(previousState);
      setError(err.message || 'Downgrade failed. Please try again.');
    }
  }, [subscription, refresh]);

  const pause = useCallback(async () => {
    const previousState = subscription;
    setSubscription({ ...previousState, status: 'paused' });
    setError(null);
    try {
      await pauseSubscription();
      // Give the background processor a moment to update the DB
      setTimeout(() => refresh(true), 500);
    } catch (err) {
      setSubscription(previousState);
      setError(err.message || 'Could not pause subscription. Please try again.');
    }
  }, [subscription, refresh]);

  const resume = useCallback(async () => {
    const previousState = subscription;
    setSubscription({ ...previousState, status: 'active' });
    setError(null);
    try {
      await resumeSubscription();
      // Give the background processor a moment to update the DB
      setTimeout(() => refresh(true), 500);
    } catch (err) {
      setSubscription(previousState);
      setError(err.message || 'Could not resume subscription. Please try again.');
    }
  }, [subscription, refresh]);

  const isPremium = subscription.plan === 'premium' && subscription.status === 'active';

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isPremium, loading, error, upgrade, downgrade, pause, resume, refresh }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
