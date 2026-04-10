/**
 * Pure event sourcing reducer for subscription state.
 * Used by EventLogPage, EventDebuggerPage, and StateReplayViewer.
 *
 * @typedef {'free'|'premium'} Plan
 * @typedef {'active'|'cancelled'|'payment_failed'} SubscriptionStatus
 *
 * @typedef {Object} SubscriptionState
 * @property {Plan} plan
 * @property {SubscriptionStatus} status
 * @property {number} price - 0 for free, 199 for premium (INR)
 * @property {number} version - monotonically increasing event version
 */

/** @type {SubscriptionState} */
export const INITIAL_STATE = {
  plan: 'free',
  status: 'active',
  price: 0,
  version: 0,
};

/**
 * Apply a single domain event to the current subscription state.
 * Pure function — no side effects.
 *
 * @param {SubscriptionState} state
 * @param {{ event_type: string, version: number }} event
 * @returns {SubscriptionState}
 */
export function applyEvent(state, event) {
  switch (event.event_type) {
    case 'SubscriptionCreated':
      return { plan: 'free', status: 'active', price: 0, version: event.version };

    case 'PlanUpgraded':
      return { plan: 'premium', status: 'active', price: 199, version: event.version };

    case 'PaymentSucceeded':
      return { ...state, status: 'active', version: event.version };

    case 'PaymentFailed':
      return { ...state, status: 'payment_failed', version: event.version };

    default:
      console.warn('[subscriptionReducer] Unknown event type:', event.event_type);
      return state;
  }
}
