import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

/**
 * ZenithSkyView - A beautiful circular sky map showing objects overhead
 * Appears when user switches to 'zenith' view mode (if we had one)
 * For now, this is a compact inline sky dome in the bottom panel
 */
export default function ZenithSkyView() {
  const { celestialBodies, userLocation, setActiveTarget, viewMode } = useAppStore();

  const overhead = useMemo(() => {
    if (!userLocation) return [];
    return celestialBodies
      .filter(b => b.elevation !== undefined && b.elevation > 0)
      .sort((a, b) => (b.elevation || 0) - (a.elevation || 0));
  }, [celestialBodies, userLocation]);

  if (viewMode !== 'radar' || !userLocation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="glass rounded-2xl p-4 max-w-lg">
          <div className="text-center mb-3">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-cosmic-cyan/70 font-mono">
              Overhead Objects ({overhead.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {overhead.slice(0, 12).map((body, i) => (
              <motion.button
                key={body.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                onClick={() => setActiveTarget(body)}
                className="glass-light rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: body.color || '#fff',
                    boxShadow: `0 0 8px ${body.color || '#fff'}60`,
                  }}
                />
                <span className="text-[10px] text-stardust/80 group-hover:text-starlight transition-colors font-medium truncate max-w-[80px]">
                  {body.name}
                </span>
                <span className="text-[8px] font-mono text-stardust/40">
                  {body.elevation?.toFixed(0)}°
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
