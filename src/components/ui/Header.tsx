import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import SearchBar from './SearchBar';

export default function Header() {
  const { userLocation, issPosition, celestialBodies, viewMode, setViewMode } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const aboveHorizonCount = celestialBodies.filter(b => b.elevation && b.elevation > 0).length;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', damping: 20 }}
      className="fixed top-0 left-0 right-0 z-40 p-3 sm:p-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-cosmic-cyan via-cosmic-blue to-cosmic-purple rounded-xl opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl">🔭</div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wide text-starlight leading-tight">
                PROJECT ZENITH
              </h1>
              <p className="text-[9px] uppercase tracking-[0.25em] text-cosmic-cyan/70 font-mono">
                The Celestial Eye
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-0 max-w-md">
            <SearchBar />
          </div>

          {/* Time display */}
          <div className="hidden md:flex items-center gap-3 glass rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono">Live</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="font-mono text-xs text-stardust">
              <span className="text-starlight">{currentTime.toLocaleTimeString('en-US', { hour12: false })}</span>
              <span className="text-stardust/40 ml-1">UTC{currentTime.getTimezoneOffset() > 0 ? '-' : '+'}{Math.abs(currentTime.getTimezoneOffset() / 60)}</span>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
          {/* View toggle */}
          <div className="glass rounded-lg p-0.5 flex gap-0.5">
            {(['globe', 'radar'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-mono transition-all ${
                  viewMode === mode
                    ? 'bg-cosmic-cyan/20 text-cosmic-cyan shadow-lg shadow-cosmic-cyan/10'
                    : 'text-stardust/60 hover:text-stardust'
                }`}
              >
                {mode === 'globe' ? '🗺️' : '📡'} {mode}
              </button>
            ))}
          </div>

          {/* Stats */}
          {userLocation && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
                <span className="text-[10px] text-stardust/60 uppercase tracking-wider font-mono">Bodies</span>
                <span className="font-mono text-xs text-cosmic-cyan font-bold">{aboveHorizonCount}</span>
              </div>
              
              {issPosition && (
                <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-sm">🛰️</span>
                  <div className="font-mono text-[10px] text-stardust">
                    <span className="text-cosmic-cyan">{issPosition.altitude.toFixed(0)}</span>
                    <span className="text-stardust/40"> km</span>
                  </div>
                </div>
              )}

              <div className="hidden sm:flex glass rounded-lg px-3 py-1.5 items-center gap-2">
                <span className="text-[10px]">📍</span>
                <span className="font-mono text-[10px] text-stardust truncate max-w-[150px]">
                  {userLocation.name || `${userLocation.lat.toFixed(2)}°, ${userLocation.lng.toFixed(2)}°`}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
