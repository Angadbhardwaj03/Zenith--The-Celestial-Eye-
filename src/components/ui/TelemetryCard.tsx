import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, CelestialBody } from '../../store/useAppStore';
import { formatAltitude, formatDistance, formatVelocity, getCardinalDirection } from '../../lib/math/orbital-math';
import { predictPasses, PassPrediction } from '../../lib/api/pass-predictions';

function TelemetryRow({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-stardust/70 text-xs uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-sm font-medium ${color || 'text-starlight'}`}>{value}</span>
        {unit && <span className="text-stardust/40 text-[10px]">{unit}</span>}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: CelestialBody['type'] }) {
  const config = {
    iss: { label: 'SPACE STATION', bg: 'bg-cosmic-cyan/20', text: 'text-cosmic-cyan', glow: 'shadow-cosmic-cyan/20' },
    satellite: { label: 'SATELLITE', bg: 'bg-cosmic-purple/20', text: 'text-cosmic-purple', glow: 'shadow-cosmic-purple/20' },
    planet: { label: 'PLANET', bg: 'bg-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    constellation: { label: 'CONSTELLATION', bg: 'bg-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    star: { label: 'STAR', bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  };
  const c = config[type];
  return (
    <span className={`${c.bg} ${c.text} text-[9px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-lg ${c.glow}`}>
      {c.label}
    </span>
  );
}

function ElevationGauge({ elevation }: { elevation: number }) {
  const clampedEl = Math.max(0, Math.min(90, elevation));
  const percentage = (clampedEl / 90) * 100;
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="3" />
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="none"
          stroke="url(#elevGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="elevGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold text-starlight">{clampedEl.toFixed(1)}°</span>
        <span className="text-[9px] text-stardust/60 uppercase tracking-wider">Elevation</span>
      </div>
    </div>
  );
}

export default function TelemetryCard() {
  const { activeTarget, setActiveTarget, setSidebarOpen, satRecords, userLocation } = useAppStore();
  const [predictions, setPredictions] = useState<PassPrediction[]>([]);

  useEffect(() => {
    const noradId = activeTarget?.noradId;
    if (typeof noradId === 'number' && satRecords[noradId] && userLocation) {
      setTimeout(() => {
        const passes = predictPasses(satRecords[noradId], userLocation.lat, userLocation.lng);
        setPredictions(passes);
      }, 50);
    } else {
      setPredictions([]);
    }
  }, [activeTarget, satRecords, userLocation]);

  const handleClose = () => {
    setActiveTarget(null);
    setSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {activeTarget && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] z-50 flex flex-col"
        >
          {/* Backdrop on mobile */}
          <div className="absolute inset-0 bg-void/80 backdrop-blur-xl sm:bg-transparent sm:backdrop-blur-none" />

          <div className="relative flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 sm:pt-20">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-20 sm:right-5 w-8 h-8 rounded-full glass flex items-center justify-center text-stardust hover:text-starlight transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: `${activeTarget.color}20` }}
                >
                  {activeTarget.type === 'iss' ? '🛰️' :
                    activeTarget.type === 'satellite' ? '📡' :
                      activeTarget.type === 'planet' ? activeTarget.icon || '🪐' :
                        activeTarget.type === 'constellation' ? '⭐' : '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-starlight truncate">{activeTarget.name}</h3>
                  <TypeBadge type={activeTarget.type} />
                </div>
              </div>
              <p className="text-sm text-stardust/70 leading-relaxed">
                {activeTarget.description}
              </p>
            </motion.div>

            {/* Elevation Gauge */}
            {activeTarget.elevation !== undefined && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-5"
              >
                <h4 className="text-xs uppercase tracking-widest text-stardust/60 mb-3 font-medium">Position</h4>
                <ElevationGauge elevation={activeTarget.elevation} />
                {activeTarget.azimuth !== undefined && (
                  <div className="text-center mt-3">
                    <span className="font-mono text-sm text-stardust">
                      {getCardinalDirection(activeTarget.azimuth)} ({activeTarget.azimuth.toFixed(1)}°)
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Telemetry Data */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5"
            >
              <h4 className="text-xs uppercase tracking-widest text-stardust/60 mb-3 font-medium">Live Telemetry</h4>
              <div>
                {activeTarget.altitude !== undefined && (
                  <TelemetryRow
                    label="Altitude"
                    value={formatAltitude(activeTarget.altitude)}
                    color="text-cosmic-cyan"
                  />
                )}
                {activeTarget.velocity !== undefined && (
                  <TelemetryRow
                    label="Velocity"
                    value={formatVelocity(activeTarget.velocity)}
                    color="text-cosmic-green"
                  />
                )}
                {activeTarget.distance !== undefined && (
                  <TelemetryRow
                    label="Distance"
                    value={formatDistance(activeTarget.distance)}
                    color="text-cosmic-purple"
                  />
                )}
                {activeTarget.magnitude !== undefined && (
                  <TelemetryRow
                    label="Magnitude"
                    value={activeTarget.magnitude.toFixed(1)}
                    color="text-amber-400"
                  />
                )}
                <TelemetryRow
                  label="Latitude"
                  value={`${activeTarget.lat.toFixed(4)}°`}
                />
                <TelemetryRow
                  label="Longitude"
                  value={`${activeTarget.lng.toFixed(4)}°`}
                />
                {activeTarget.noradId && (
                  <TelemetryRow
                    label="NORAD ID"
                    value={`#${activeTarget.noradId}`}
                    color="text-stardust"
                  />
                )}
              </div>
            </motion.div>

            {/* Pass Predictions */}
            {predictions.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="glass rounded-2xl p-5"
              >
                <h4 className="text-xs uppercase tracking-widest text-stardust/60 mb-3 font-medium">Visible Passes</h4>
                <div className="flex flex-col gap-3">
                  {predictions.map((pass, i) => (
                    <div key={i} className="flex flex-col p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-cosmic-cyan font-semibold block">{pass.riseTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="text-[10px] text-amber-400 font-mono tracking-wider ml-auto">PEAK {pass.maxElevation.toFixed(0)}°</span>
                      </div>
                      <div className="flex justify-between mt-1 text-sm font-mono text-starlight">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stardust/70">Rise</span>
                          <span>{pass.riseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-stardust/70">Set</span>
                          <span>{pass.setTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Category */}
            {activeTarget.category && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-5"
              >
                <h4 className="text-xs uppercase tracking-widest text-stardust/60 mb-3 font-medium">Classification</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTarget.color }} />
                  <span className="text-sm text-starlight">{activeTarget.category}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
