import { useContext } from 'react';
import { SubscriptionContext } from './SubscriptionContextValue';

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used inside SubscriptionProvider');
  }
  return ctx;
}
