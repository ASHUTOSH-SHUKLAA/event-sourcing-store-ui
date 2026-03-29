import { apiClient } from './authApi';

/**
 * Fetch the authenticated user's profile.
 * Returns { data: { id, email, display_name, created_at } }
 * Requirement 4.1
 */
export const getProfile = () =>
  apiClient.get('/api/v1/users/me');

/**
 * Update the authenticated user's display name.
 * @param {string} displayName
 * Returns { data: { id, email, display_name, created_at } }
 * Requirement 4.2
 */
export const updateProfile = (displayName) =>
  apiClient.put('/api/v1/users/me', { display_name: displayName });
