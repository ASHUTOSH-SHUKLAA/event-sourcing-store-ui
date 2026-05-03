/**
 * Pure event sourcing reducer for subscription state.
 * Used by EventLogPage to replay subscription history.
 *
 * @typedef {'free'|'premium'} Plan
 * @typedef {'active'|'paused'|'cancelled'|'payment_failed'} SubscriptionStatus
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

    case 'PlanDowngraded':
      // Downgrade is now immediate (pro-rata charge collected on backend)
      return { plan: 'free', status: 'active', price: 0, version: event.version };

    case 'SubscriptionPaused':
      return { ...state, status: 'paused', version: event.version };

    case 'SubscriptionResumed':
      return { ...state, status: 'active', version: event.version };

    case 'PaymentSucceeded':
      return { ...state, status: 'active', version: event.version };

    case 'PaymentFailed':
      return { ...state, status: 'payment_failed', version: event.version };

    default:
      // Silently pass through unknown events (song plays, etc.) without warning
      return state;
  }
}
