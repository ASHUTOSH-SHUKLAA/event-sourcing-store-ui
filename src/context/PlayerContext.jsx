import { createContext, useContext, useState, useCallback } from 'react';
import { recordPlay } from '../api/subscriptionApi';
import { apiClient } from '../api/authApi';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const recordEvent = useCallback(async (eventType, trackId) => {
    try {
      await apiClient.post('/api/v1/player/events', { 
        event_type: eventType, 
        song_id: String(trackId) 
      });
    } catch (err) {
      console.error('Failed to record player event:', err);
    }
  }, []);

  const playTrack = useCallback((track, currentPlaylist = []) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setPlaylist(currentPlaylist);
    
    const index = currentPlaylist.findIndex(t => t.id === track.id);
    setCurrentIndex(index);
    
    recordPlay(track);
  }, []);

  const togglePlay = useCallback(() => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (currentTrack) {
      recordEvent(nextState ? 'SongPlayed' : 'SongPaused', currentTrack.id);
    }
  }, [isPlaying, currentTrack, recordEvent]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0 || currentIndex === -1) return;
    
    const nextIdx = (currentIndex + 1) % playlist.length;
    const track = playlist[nextIdx];
    
    setCurrentTrack(track);
    setCurrentIndex(nextIdx);
    setIsPlaying(true);
    
    recordEvent('SongNext', track.id);
  }, [playlist, currentIndex, recordEvent]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0 || currentIndex === -1) return;
    
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    const track = playlist[prevIdx];
    
    setCurrentTrack(track);
    setCurrentIndex(prevIdx);
    setIsPlaying(true);
    
    recordEvent('SongPrevious', track.id);
  }, [playlist, currentIndex, recordEvent]);

  const closePlayer = useCallback(() => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setPlaylist([]);
    setCurrentIndex(-1);
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      playlist,
      playTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      closePlayer
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
