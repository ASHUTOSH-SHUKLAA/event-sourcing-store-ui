/**
 * Subscription API abstraction layer.
 * Delegates to mock layer when VITE_USE_MOCK_SUBSCRIPTIONS=true
 * or when the real backend returns a network error.
 * Swapping to the real backend requires only changing this file.
 */

import { apiClient } from './authApi';
import {
  mockGetCurrentSubscription,
  mockGetPlans,
  mockUpgradeSubscription,
  mockDowngradeSubscription,
  mockGetSubscriptionEvents,
  mockGetAdminSubscriptions,
  mockGetAdminUserEvents,
  mockGetAdminMetrics,
  mockAdminUpgradeSubscription,
  mockAdminDowngradeSubscription,
  mockRecordPlay,
  mockGetPlayCounts,
} from '../data/mockSubscriptions';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_SUBSCRIPTIONS === 'true' || import.meta.env.VITE_USE_MOCK_SUBSCRIPTIONS === true;

/** Wrap a real API call with mock fallback on network error */
async function withFallback(realCall, mockCall) {
  if (USE_MOCK) return mockCall();
  try {
    return await realCall();
  } catch {
    return mockCall();
  }
}

export const getCurrentSubscription = () =>
  withFallback(
    () => apiClient.get('/api/v1/subscriptions/current').then((r) => ({ data: r.data.data })),
    mockGetCurrentSubscription,
  );

export const getPlans = () =>
  withFallback(
    () => apiClient.get('/api/v1/subscriptions/plans').then((r) => ({ data: r.data.data })),
    mockGetPlans,
  );

export const upgradeSubscription = () =>
  withFallback(
    () => apiClient.post('/api/v1/subscriptions/upgrade').then((r) => ({ data: r.data.data })),
    mockUpgradeSubscription,
  );

export const getSubscriptionEvents = () =>
  withFallback(
    () => apiClient.get('/api/v1/subscriptions/events').then((r) => ({ data: r.data.data })),
    mockGetSubscriptionEvents,
  );

export const downgradeSubscription = () =>
  withFallback(
    () => apiClient.post('/api/v1/subscriptions/downgrade').then((r) => ({ data: r.data.data })),
    mockDowngradeSubscription,
  );

export const getAdminSubscriptions = () =>
  withFallback(
    () => apiClient.get('/api/v1/admin/subscriptions').then((r) => ({ data: r.data.data.items || r.data.data })),
    mockGetAdminSubscriptions,
  );

export const getAdminUserEvents = (aggregateId) =>
  withFallback(
    () => apiClient.get(`/api/v1/admin/subscriptions/${aggregateId}/events`).then((r) => ({ data: r.data.data })),
    () => mockGetAdminUserEvents(aggregateId),
  );

export const getAdminMetrics = () =>
  withFallback(
    () => apiClient.get('/api/v1/admin/metrics').then((r) => ({ data: r.data.data })),
    mockGetAdminMetrics,
  );

export const adminUpgradeSubscription = (aggregateId) =>
  withFallback(
    () => apiClient.post(`/api/v1/admin/subscriptions/${aggregateId}/upgrade`).then((r) => ({ data: r.data.data })),
    () => mockAdminUpgradeSubscription(aggregateId),
  );

export const adminDowngradeSubscription = (aggregateId) =>
  withFallback(
    () => apiClient.post(`/api/v1/admin/subscriptions/${aggregateId}/downgrade`).then((r) => ({ data: r.data.data })),
    () => mockAdminDowngradeSubscription(aggregateId),
  );

export const recordPlay = (trackId) =>
  withFallback(
    () =>
      apiClient
        .post('/api/v1/player/events', { event_type: 'SongPlayed', song_id: String(trackId) })
        .then((r) => ({ data: r.data.data })),
    () => mockRecordPlay(trackId),
  );

export const getPlayCounts = () =>
  withFallback(
    () => apiClient.get('/api/v1/player/play-counts').then((r) => ({ data: r.data.data })),
    mockGetPlayCounts,
  );
