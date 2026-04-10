/**
 * iTunes Search API client.
 * No authentication required. No audio playback.
 * Uses native fetch — no dependency on authApi.js.
 *
 * @typedef {Object} Track
 * @property {number} id       - iTunes trackId
 * @property {string} title    - trackName
 * @property {string} artist   - artistName
 * @property {string} album    - collectionName
 * @property {string} artwork  - artworkUrl100
 * @property {number} duration - trackTimeMillis / 1000 (seconds)
 */

const BASE_URL = 'https://itunes.apple.com/search';
const TIMEOUT_MS = 5000;

/**
 * Normalise a raw iTunes result object into a Track.
 * @param {Object} item
 * @returns {Track}
 */
function enhanceArtworkUrl(url) {
  if (!url) {
    return '';
  }

  return url.replace(/\/\d+x\d+bb\.(jpg|png)$/, '/600x600bb.$1');
}

function normalise(item) {
  return {
    id: item.trackId,
    title: item.trackName || 'Unknown Title',
    artist: item.artistName || 'Unknown Artist',
    album: item.collectionName || '',
    artwork: enhanceArtworkUrl(item.artworkUrl100 || ''),
    duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 0,
  };
}

/**
 * Fetch from iTunes with a 5-second timeout.
 * @param {URLSearchParams} params
 * @returns {Promise<Track[]>}
 */
async function fetchTracks(params) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`iTunes API error: ${res.status}`);
    }

    const json = await res.json();
    return (json.results || [])
      .filter((item) => item.kind === 'song' && item.trackId)
      .map(normalise);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Search for tracks by query string.
 * @param {string} query
 * @param {number} [limit=20]
 * @returns {Promise<Track[]>}
 */
export async function searchTracks(query, limit = 20) {
  const params = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'song',
    limit: String(limit),
  });
  return fetchTracks(params);
}

/**
 * Get top tracks for a genre.
 * @param {string} [genre='pop']
 * @param {number} [limit=12]
 * @returns {Promise<Track[]>}
 */
export async function getTopTracks(genre = 'pop', limit = 12) {
  const params = new URLSearchParams({
    term: genre,
    media: 'music',
    entity: 'song',
    limit: String(limit),
  });
  return fetchTracks(params);
}
