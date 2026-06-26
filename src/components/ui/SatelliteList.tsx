import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { formatAltitude } from '../../lib/math/orbital-math';

type FilterType = 'all' | 'iss' | 'satellite' | 'planet' | 'constellation';

export default function SatelliteList() {
  const { celestialBodies, userLocation, setActiveTarget, activeTarget } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const visibleBodies = useMemo(() => {
    if (!userLocation) return [];
    let bodies = celestialBodies.filter(b => b.elevation !== undefined && b.elevation > 0);
    if (filter !== 'all') {
      bodies = bodies.filter(b => b.type === filter);
    }
    return bodies.sort((a, b) => (b.elevation || 0) - (a.elevation || 0));
  }, [celestialBodies, userLocation, filter]);

  const counts = useMemo(() => {
    const visible = celestialBodies.filter(b => b.elevation !== undefined && b.elevation > 0);
    return {
      all: visible.length,
      iss: visible.filter(b => b.type === 'iss').length,
      satellite: visible.filter(b => b.type === 'satellite').length,
      planet: visible.filter(b => b.type === 'planet').length,
      constellation: visible.filter(b => b.type === 'constellation').length,
    };
  }, [celestialBodies]);

  if (!userLocation) return null;

  const typeIcons: Record<string, string> = {
    iss: '🛰️',
    satellite: '📡',
    planet: '🪐',
    constellation: '⭐',
    star: '✨',
  };

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.2 }}
      className={`fixed left-3 sm:left-4 z-30 glass rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded ? 'top-28 sm:top-32 bottom-24 sm:bottom-28 w-[280px] sm:w-[320px]' : 'bottom-24 sm:bottom-28 w-[56px] sm:w-[60px]'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg glass-light flex items-center justify-center text-stardust hover:text-cosmic-cyan transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Collapsed view - just icons */}
      {!isExpanded && (
        <div className="flex flex-col items-center gap-1 p-2 pt-3">
          <div className="text-lg mb-2">📡</div>
          <div className="w-8 h-px bg-white/10 mb-1" />
          <span className="font-mono text-xs text-cosmic-cyan font-bold">{counts.all}</span>
          <span className="text-[8px] text-stardust/40 uppercase tracking-wider font-mono">above</span>
        </div>
      )}

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 pb-3 pr-12">
              <h3 className="text-sm font-semibold text-starlight">Celestial Objects</h3>
              <p className="text-[10px] text-stardust/50 font-mono uppercase tracking-wider mt-0.5">
                {counts.all} visible from your location
              </p>
            </div>

            {/* Filters */}
            <div className="px-3 pb-3 flex gap-1 flex-wrap">
              {(['all', 'satellite', 'planet', 'constellation'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 rounded-md text-[9px] uppercase tracking-wider font-mono transition-all ${
                    filter === f
                      ? 'bg-cosmic-cyan/20 text-cosmic-cyan'
                      : 'text-stardust/50 hover:text-stardust/80 hover:bg-white/5'
                  }`}
                >
                  {f} {counts[f] > 0 ? `(${counts[f]})` : ''}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {visibleBodies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-stardust/40 text-xs">No objects match filter</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {visibleBodies.map((body, i) => (
                    <motion.button
                      key={body.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setActiveTarget(body)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-2.5 group ${
                        activeTarget?.id === body.id
                          ? 'bg-cosmic-cyan/10 border border-cosmic-cyan/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-sm flex-shrink-0">
                        {typeIcons[body.type] || '✨'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-starlight truncate group-hover:text-cosmic-cyan transition-colors font-medium">
                          {body.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-stardust/50">
                            {body.elevation?.toFixed(1)}° el
                          </span>
                          {body.altitude && (
                            <span className="text-[9px] font-mono text-stardust/40">
                              {formatAltitude(body.altitude)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 opacity-60"
                        style={{ backgroundColor: body.color || '#fff' }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
