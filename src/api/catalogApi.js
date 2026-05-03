import { apiClient } from './authApi';

export const getCatalogSongs = async () => {
  const response = await apiClient.get('/api/v1/catalog/songs', {
    params: { _t: Date.now() }
  });
  return response.data.data.items || [];
};

export const getCatalogPlaylists = async () => {
  const response = await apiClient.get('/api/v1/catalog/playlists');
  return response.data.data.items || [];
};

export const getBanners = async () => {
  const response = await apiClient.get('/api/v1/catalog/banners');
  return response.data.data.items || [];
};

export const searchTracks = async (query) => {
  const response = await apiClient.get('/api/v1/catalog/search', {
    params: { q: query?.trim() || '' },
  });
  return response.data.data.tracks || [];
};
