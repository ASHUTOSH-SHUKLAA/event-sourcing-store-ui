import { apiClient } from './authApi';

export const getCurrentSubscription = () =>
  apiClient.get('/api/v1/subscriptions/current').then((r) => ({ data: r.data.data }));

export const getPlans = () =>
  apiClient.get('/api/v1/subscriptions/plans').then((r) => ({ data: r.data.data }));

export const upgradeSubscription = () =>
  apiClient.post('/api/v1/subscriptions/upgrade').then((r) => ({ data: r.data.data }));

export const getSubscriptionEvents = () =>
  apiClient.get('/api/v1/subscriptions/events').then((r) => ({ data: r.data.data }));

export const downgradeSubscription = () =>
  apiClient.post('/api/v1/subscriptions/downgrade').then((r) => ({ data: r.data.data }));

export const pauseSubscription = () =>
  apiClient.post('/api/v1/subscriptions/pause').then((r) => ({ data: r.data.data }));

export const resumeSubscription = () =>
  apiClient.post('/api/v1/subscriptions/resume').then((r) => ({ data: r.data.data }));

export const getAdminSubscriptions = (page = 1, limit = 50) =>
  apiClient.get(`/api/v1/admin/subscriptions?page=${page}&limit=${limit}`).then((r) => ({ data: r.data.data.items || r.data.data }));

export const getAdminUserEvents = (aggregateId, page = 1, limit = 50) =>
  apiClient.get(`/api/v1/admin/subscriptions/${aggregateId}/events?page=${page}&limit=${limit}`).then((r) => ({ data: r.data.data }));

export const getAdminMetrics = () =>
  apiClient.get('/api/v1/admin/metrics').then((r) => ({ data: r.data.data }));

export const adminUpgradeSubscription = (aggregateId) =>
  apiClient.post(`/api/v1/admin/subscriptions/${aggregateId}/upgrade`).then((r) => ({ data: r.data.data }));

export const adminDowngradeSubscription = (aggregateId) =>
  apiClient.post(`/api/v1/admin/subscriptions/${aggregateId}/downgrade`).then((r) => ({ data: r.data.data }));

export const recordPlay = (track) =>
  apiClient
    .post('/api/v1/player/events', { 
      event_type: 'SongPlayed', 
      song_id: String(track.id),
      payload: {
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: String(track.duration),
        artwork: track.artwork
      }
    })
    .then((r) => ({ data: r.data.data }));

export const getPlayCounts = () =>
  apiClient.get('/api/v1/player/play-counts').then((r) => ({ data: r.data.data }));
