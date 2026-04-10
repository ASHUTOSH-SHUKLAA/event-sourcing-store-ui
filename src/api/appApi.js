import { apiClient } from './authApi';

export const getLikedSongs = async () => {
  const response = await apiClient.get('/api/v1/liked-songs');
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

export const getPlaylists = async () => {
  const response = await apiClient.get('/api/v1/playlists');
  return response.data.data.items || [];
};

export const getPlaylistById = async (id) => {
  const response = await apiClient.get(`/api/v1/playlists/${id}`);
  return response.data.data;
};

export const createPlaylist = async (name, songIds = []) => {
  const response = await apiClient.post('/api/v1/playlists', {
    name,
    song_ids: songIds,
  });
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

export const getAdminUsers = async () => {
  const response = await apiClient.get('/api/v1/admin/users');
  return response.data.data.items || [];
};

export const getAdminSongs = async () => {
  const response = await apiClient.get('/api/v1/admin/songs');
  return response.data.data.items || [];
};

export const getAdminSubscriptions = async () => {
  const response = await apiClient.get('/api/v1/admin/subscriptions');
  return response.data.data.items || [];
};

export const getAdminHealth = async () => {
  const response = await apiClient.get('/api/v1/admin/health');
  return response.data.data;
};

export const uploadProviderSong = async (payload) => {
  const response = await apiClient.post('/api/v1/provider/upload', payload);
  return response.data.data;
};

export const getProviderSongs = async () => {
  const response = await apiClient.get('/api/v1/provider/songs');
  return response.data.data.items || [];
};
