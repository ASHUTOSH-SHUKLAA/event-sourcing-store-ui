import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const FALLBACK = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80';

export default function MusicPlayer() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, closePlayer } = usePlayer();
  const location = useLocation();

  // Hide player when navigating outside of the app dashboard
  useEffect(() => {
    if (!location.pathname.startsWith('/app')) {
      closePlayer();
    }
  }, [location.pathname, closePlayer]);

  if (!currentTrack) return null;

  return (
    <div className={`fixed bottom-4 left-0 right-0 z-50 px-6 animate-in slide-in-from-bottom-8 duration-700 lg:left-[310px] ${isPlaying ? 'animate-disco-pulse' : ''}`}>
      <div className={`relative overflow-hidden rounded-[40px] border-2 border-white/30 p-3 shadow-[0_20px_60px_rgba(37,99,235,0.5)] backdrop-blur-2xl transition-all duration-700 ${
        isPlaying 
          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 animate-disco-bg' 
          : 'bg-gradient-to-r from-blue-800 to-indigo-900'
      }`}>
        {/* Animated Disco Glows */}
        <div className={`absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400 opacity-20 blur-[100px] transition-all duration-1000 ${isPlaying ? 'animate-pulse scale-150' : 'scale-100'}`} />
        
        <div className="relative flex items-center">
          {/* Left Corner: Banner + Name */}
          <div className="flex items-center gap-4 pl-4 shrink-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl shadow-xl ring-2 ring-white/20">
              <img 
                src={currentTrack.artwork || FALLBACK} 
                alt={currentTrack.title} 
                onError={(e) => { e.currentTarget.src = FALLBACK; }}
                className={`h-full w-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-110' : 'scale-100'}`}
              />
            </div>
            <div className="min-w-0 pr-8">
              <h4 className="truncate text-lg font-black text-white">{currentTrack.title}</h4>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Middle Portion: Centered Controls */}
          <div className="flex flex-1 items-center justify-center gap-6 sm:gap-10">
            <button 
              onClick={prevTrack}
              className="rounded-full p-2 text-white/80 transition-all hover:scale-125 hover:text-white active:scale-90"
            >
              <SkipBack className="h-6 w-6 fill-current" />
            </button>

            <button 
              onClick={togglePlay}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
            >
              {isPlaying ? <Pause className="relative z-10 h-7 w-7 fill-current" /> : <Play className="relative z-10 h-7 w-7 fill-current translate-x-1" />}
            </button>

            <button 
              onClick={nextTrack}
              className="rounded-full p-2 text-white/80 transition-all hover:scale-125 hover:text-white active:scale-90"
            >
              <SkipForward className="h-6 w-6 fill-current" />
            </button>
          </div>

          {/* Right Corner: Close Button */}
          <div className="flex shrink-0 items-center pl-4 pr-4">
            <div className="mr-6 h-8 w-px bg-white/20" />
            <button 
              onClick={closePlayer}
              className="rounded-full border border-white/20 p-2.5 text-white/60 transition-all hover:rotate-90 hover:border-white hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
