import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { getZenithRADec, getLST } from '../../lib/math/orbital-math';

export default function ZenithInfo() {
  const { userLocation, celestialBodies, setActiveTarget } = useAppStore();

  const zenithData = useMemo(() => {
    if (!userLocation) return null;
    const now = new Date();
    const zenith = getZenithRADec(userLocation.lat, userLocation.lng, now);
    const lst = getLST(userLocation.lng, now);
    return { zenith, lst };
  }, [userLocation]);

  const overhead = useMemo(() => {
    return celestialBodies
      .filter(b => b.elevation !== undefined && b.elevation > 30)
      .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
      .slice(0, 8);
  }, [celestialBodies]);

  if (!userLocation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4"
      >
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl p-4 sm:p-5">
            {/* Zenith coordinates */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mb-4">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-cosmic-cyan/80 font-mono mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan animate-pulse" />
                  Zenith Point
                </h3>
                <p className="text-sm text-stardust/80">
                  What's directly above <span className="text-starlight font-medium">{userLocation.name || 'your location'}</span>
                </p>
              </div>
              {zenithData && (
                <div className="flex gap-4 sm:ml-auto">
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-widest text-stardust/50 font-mono">RA</p>
                    <p className="font-mono text-sm text-cosmic-cyan">{(zenithData.zenith.ra / 15).toFixed(2)}h</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-widest text-stardust/50 font-mono">DEC</p>
                    <p className="font-mono text-sm text-cosmic-purple">{zenithData.zenith.dec.toFixed(2)}°</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-widest text-stardust/50 font-mono">LST</p>
                    <p className="font-mono text-sm text-stardust">{(zenithData.lst / 15).toFixed(2)}h</p>
                  </div>
                </div>
              )}
            </div>

            {/* Overhead objects carousel */}
            {overhead.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {overhead.map((body, i) => (
                  <motion.button
                    key={body.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveTarget(body)}
                    className="flex-shrink-0 glass-light rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-all group cursor-pointer min-w-fit"
                  >
                    <span className="text-sm">
                      {body.type === 'iss' ? '🛰️' :
                       body.type === 'satellite' ? '📡' :
                       body.type === 'planet' ? (body.icon || '🪐') :
                       body.type === 'constellation' ? '⭐' : '✨'}
                    </span>
                    <div className="text-left">
                      <p className="text-xs text-starlight font-medium truncate max-w-[100px] group-hover:text-cosmic-cyan transition-colors">
                        {body.name}
                      </p>
                      <p className="text-[9px] font-mono text-stardust/50">
                        {body.elevation?.toFixed(1)}° el
                      </p>
                    </div>
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: body.color || '#fff' }}
                    />
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-stardust/50 italic">Calculating celestial objects overhead...</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
