import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { getZenithRADec } from '../../lib/math/orbital-math';

export default function MiniStats() {
  const { userLocation, celestialBodies, issPosition, activeTarget } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    if (!userLocation) return null;
    const zenith = getZenithRADec(userLocation.lat, userLocation.lng, time);
    const visible = celestialBodies.filter(b => b.elevation && b.elevation > 0);
    const satellites = visible.filter(b => b.type === 'satellite');
    const planets = visible.filter(b => b.type === 'planet');
    const constellations = visible.filter(b => b.type === 'constellation');
    
    return { zenith, satellites: satellites.length, planets: planets.length, constellations: constellations.length };
  }, [userLocation, celestialBodies, time]);

  if (!userLocation || !stats) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', damping: 25, delay: 0.4 }}
        className={`fixed right-3 sm:right-4 top-28 sm:top-32 z-30 w-[200px] sm:w-[220px] ${activeTarget ? 'hidden lg:block' : ''}`}
      >
        <div className="glass rounded-2xl p-4 space-y-3">
          <h4 className="text-[9px] uppercase tracking-[0.25em] text-cosmic-cyan/70 font-mono flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-cosmic-cyan animate-pulse" />
            Sky Overview
          </h4>

          {/* ISS Status */}
          {issPosition && (
            <div className="glass-light rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">🛰️</span>
                <span className="text-[10px] font-mono text-cosmic-cyan uppercase tracking-wider">ISS Live</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[8px] text-stardust/40 uppercase font-mono">Alt</p>
                  <p className="font-mono text-xs text-starlight">{issPosition.altitude.toFixed(0)} km</p>
                </div>
                <div>
                  <p className="text-[8px] text-stardust/40 uppercase font-mono">Vel</p>
                  <p className="font-mono text-xs text-starlight">{issPosition.velocity.toFixed(2)} km/s</p>
                </div>
              </div>
            </div>
          )}

          {/* Object counts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cosmic-purple" />
                <span className="text-xs text-stardust/70">Satellites</span>
              </div>
              <span className="font-mono text-xs text-starlight font-bold">{stats.satellites}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-stardust/70">Planets</span>
              </div>
              <span className="font-mono text-xs text-starlight font-bold">{stats.planets}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-stardust/70">Constellations</span>
              </div>
              <span className="font-mono text-xs text-starlight font-bold">{stats.constellations}</span>
            </div>
          </div>

          {/* Zenith coords */}
          <div className="border-t border-white/5 pt-3">
            <div className="flex justify-between">
              <div>
                <p className="text-[8px] text-stardust/40 uppercase font-mono tracking-wider">RA</p>
                <p className="font-mono text-[11px] text-cosmic-cyan">{(stats.zenith.ra / 15).toFixed(3)}h</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-stardust/40 uppercase font-mono tracking-wider">DEC</p>
                <p className="font-mono text-[11px] text-cosmic-purple">{stats.zenith.dec.toFixed(3)}°</p>
              </div>
            </div>
          </div>

          {/* UTC Time */}
          <div className="border-t border-white/5 pt-2 text-center">
            <p className="font-mono text-[10px] text-stardust/50">
              {time.toISOString().split('T')[1].split('.')[0]} UTC
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
