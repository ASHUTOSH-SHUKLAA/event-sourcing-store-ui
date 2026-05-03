import { apiClient } from './authApi';

export const getLikedSongs = async () => {
  const response = await apiClient.get(`/api/v1/liked-songs?_t=${Date.now()}`);
  return response.data.data.items || [];
};

export const likeSong = async (song) => {
  const response = await apiClient.post(`/api/v1/liked-songs/${song.id}`, {
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration,
    artwork: song.artwork,
  });
  return response.data.data;
};

export const unlikeSong = async (songId) => {
  const response = await apiClient.delete(`/api/v1/liked-songs/${songId}`);
  return response.data.data;
};



export const getPlayerState = async () => {
  const response = await apiClient.get('/api/v1/player/state');
  return response.data.data;
};

export const postPlayerEvent = async (eventType, songId) => {
  const response = await apiClient.post('/api/v1/player/events', {
    event_type: eventType,
    song_id: songId,
  });
  return response.data.data;
};

export const getAdminUsers = async (page = 1, limit = 50) => {
  const response = await apiClient.get(`/api/v1/admin/users?page=${page}&limit=${limit}`);
  const data = response.data?.data;
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
};

export const getAdminSongs = async (page = 1, limit = 50) => {
  const response = await apiClient.get(`/api/v1/admin/songs?page=${page}&limit=${limit}`);
  const data = response.data?.data;
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
};

export const getAdminSubscriptions = async (page = 1, limit = 50) => {
  const response = await apiClient.get(`/api/v1/admin/subscriptions?page=${page}&limit=${limit}`);
  const data = response.data?.data;
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
};

export const getAdminHealth = async () => {
  const response = await apiClient.get('/api/v1/admin/health');
  return response.data.data;
};

export const getAdminUserEvents = async (userId, page = 1, limit = 100) => {
  const response = await apiClient.get(`/api/v1/admin/users/${userId}/events?page=${page}&limit=${limit}`);
  return response.data?.data || [];
};


