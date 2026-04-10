/**
 * In-memory mock backend for subscription data.
 * Simulates realistic async latency. Maintains mutable state across the session.
 * Swap for real backend by setting VITE_USE_MOCK_SUBSCRIPTIONS=false.
 */

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 300));

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

// ── Shared aggregate ID for the current user's subscription ──────────────────
const AGGREGATE_ID = uuid();

// ── Mutable event log ────────────────────────────────────────────────────────
export let MOCK_EVENTS = [
  {
    id: uuid(),
    aggregate_id: AGGREGATE_ID,
    event_type: 'SubscriptionCreated',
    version: 1,
    payload: { plan: 'free', price: 0 },
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuid(),
    aggregate_id: AGGREGATE_ID,
    event_type: 'PaymentSucceeded',
    version: 2,
    payload: { amount: 0, currency: 'INR' },
    created_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuid(),
    aggregate_id: AGGREGATE_ID,
    event_type: 'PaymentFailed',
    version: 3,
    payload: { reason: 'Insufficient funds', amount: 199, currency: 'INR' },
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuid(),
    aggregate_id: AGGREGATE_ID,
    event_type: 'PlanUpgraded',
    version: 4,
    payload: { from: 'free', to: 'premium', price: 199, currency: 'INR' },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Mutable current state ────────────────────────────────────────────────────
export let CURRENT_STATE = { plan: 'free', status: 'active', price: 0, version: 4 };

// ── Mutable play counts map ──────────────────────────────────────────────────
export let MOCK_PLAY_COUNTS = {
  1440857781: 42,
  1440857782: 17,
  1440857783: 8,
};

// ── Admin mock data ──────────────────────────────────────────────────────────
export const MOCK_SUBSCRIPTIONS = [
  { aggregate_id: uuid(), user_email: 'alice@example.com', plan: 'premium', status: 'active', started_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
  { aggregate_id: uuid(), user_email: 'bob@example.com', plan: 'free', status: 'active', started_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { aggregate_id: uuid(), user_email: 'carol@example.com', plan: 'premium', status: 'active', started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { aggregate_id: uuid(), user_email: 'dave@example.com', plan: 'free', status: 'cancelled', started_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { aggregate_id: uuid(), user_email: 'eve@example.com', plan: 'free', status: 'active', started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

// ── Exported mock functions ──────────────────────────────────────────────────

export const mockGetCurrentSubscription = async () => {
  await delay();
  return { data: { ...CURRENT_STATE } };
};

export const mockGetPlans = async () => {
  await delay();
  return {
    data: [
      { id: 'free', name: 'Free', price: 0, currency: 'INR', features: ['Browse songs', 'Home page access'] },
      { id: 'premium', name: 'Premium', price: 199, currency: 'INR', features: ['Search songs', 'Like songs', 'All Free features'] },
    ],
  };
};

export const mockUpgradeSubscription = async () => {
  await delay();
  const newEvent = {
    id: uuid(),
    aggregate_id: AGGREGATE_ID,
    event_type: 'PlanUpgraded',
    version: MOCK_EVENTS.length + 1,
    payload: { from: CURRENT_STATE.plan, to: 'premium', price: 199, currency: 'INR' },
    created_at: new Date().toISOString(),
  };
  MOCK_EVENTS = [...MOCK_EVENTS, newEvent];
  CURRENT_STATE = { plan: 'premium', status: 'active', price: 199, version: newEvent.version };
  return { data: newEvent };
};

export const mockDowngradeSubscription = async () => {
  await delay();
  const newEvent = {
    id: uuid(),
    aggregate_id: AGGREGATE_ID,
    event_type: 'PlanDowngraded',
    version: MOCK_EVENTS.length + 1,
    payload: { from: CURRENT_STATE.plan, to: 'free', price: 0, currency: 'INR' },
    created_at: new Date().toISOString(),
  };
  MOCK_EVENTS = [...MOCK_EVENTS, newEvent];
  CURRENT_STATE = { plan: 'free', status: 'active', price: 0, version: newEvent.version };
  return { data: newEvent };
};

export const mockGetSubscriptionEvents = async () => {
  await delay();
  return { data: [...MOCK_EVENTS] };
};

export const mockGetAdminSubscriptions = async () => {
  await delay();
  return { data: [...MOCK_SUBSCRIPTIONS] };
};

export const mockGetAdminUserEvents = async (aggregateId) => {
  await delay();
  const sub = MOCK_SUBSCRIPTIONS.find((s) => s.aggregate_id === aggregateId);
  if (!sub) return { data: [] };
  // Return a small synthetic event log for the selected user
  return {
    data: [
      {
        id: uuid(),
        aggregate_id: aggregateId,
        event_type: 'SubscriptionCreated',
        version: 1,
        payload: { plan: sub.plan, price: sub.plan === 'premium' ? 199 : 0 },
        created_at: sub.started_at,
      },
    ],
  };
};

export const mockGetAdminMetrics = async () => {
  await delay();
  const premiumCount = MOCK_SUBSCRIPTIONS.filter((s) => s.plan === 'premium' && s.status === 'active').length;
  const activeCount = MOCK_SUBSCRIPTIONS.filter((s) => s.status === 'active').length;
  const cancelledCount = MOCK_SUBSCRIPTIONS.filter((s) => s.status === 'cancelled').length;
  return {
    data: {
      total_subscribers: MOCK_SUBSCRIPTIONS.length,
      mrr: premiumCount * 199,
      active_count: activeCount,
      cancelled_count: cancelledCount,
    },
  };
};

export const mockAdminUpgradeSubscription = async (aggregateId) => {
  await delay();
  const sub = MOCK_SUBSCRIPTIONS.find((item) => item.aggregate_id === aggregateId);
  if (!sub) {
    throw new Error('Subscription not found');
  }
  sub.plan = 'premium';
  sub.status = 'active';
  return { data: { ...sub } };
};

export const mockAdminDowngradeSubscription = async (aggregateId) => {
  await delay();
  const sub = MOCK_SUBSCRIPTIONS.find((item) => item.aggregate_id === aggregateId);
  if (!sub) {
    throw new Error('Subscription not found');
  }
  sub.plan = 'free';
  sub.status = 'active';
  return { data: { ...sub } };
};

export const mockRecordPlay = async (trackId) => {
  await delay();
  const newEvent = {
    id: uuid(),
    aggregate_id: AGGREGATE_ID,
    event_type: 'SongPlayed',
    version: MOCK_EVENTS.length + 1,
    payload: { track_id: String(trackId) },
    created_at: new Date().toISOString(),
  };
  MOCK_EVENTS = [...MOCK_EVENTS, newEvent];
  MOCK_PLAY_COUNTS = {
    ...MOCK_PLAY_COUNTS,
    [trackId]: (MOCK_PLAY_COUNTS[trackId] || 0) + 1,
  };
  return { data: newEvent };
};

export const mockGetPlayCounts = async () => {
  await delay();
  return { data: { ...MOCK_PLAY_COUNTS } };
};
