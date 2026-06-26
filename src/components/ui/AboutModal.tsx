import { motion, AnimatePresence } from 'framer-motion';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative glass rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass-light flex items-center justify-center text-stardust hover:text-starlight transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔭</div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cosmic-cyan to-cosmic-purple bg-clip-text text-transparent">
                Project Zenith
              </h2>
              <p className="text-stardust/60 text-xs font-mono tracking-[0.3em] uppercase mt-1">
                The Celestial Eye
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm text-stardust/80 leading-relaxed">
              <p>
                Project Zenith is a real-time cosmic radar that transforms your browser into a 
                localized space observatory. Select any point on Earth to discover what celestial 
                bodies are passing through your zenith — the point directly overhead.
              </p>

              <div className="glass-light rounded-xl p-4">
                <h3 className="text-xs uppercase tracking-widest text-cosmic-cyan/80 font-mono mb-3">How to Use</h3>
                <ul className="space-y-2 text-xs">
                  <li className="flex gap-2">
                    <span className="text-cosmic-cyan flex-shrink-0">01.</span>
                    <span>Click anywhere on the map or search for a location</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cosmic-cyan flex-shrink-0">02.</span>
                    <span>View the ISS, satellites, planets & constellations overhead</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cosmic-cyan flex-shrink-0">03.</span>
                    <span>Click any celestial body to view its live telemetry data</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cosmic-cyan flex-shrink-0">04.</span>
                    <span>Switch to Radar view for a sky dome visualization</span>
                  </li>
                </ul>
              </div>

              <div className="glass-light rounded-xl p-4">
                <h3 className="text-xs uppercase tracking-widest text-cosmic-cyan/80 font-mono mb-3">Data Sources</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan" />
                    <span>ISS Live Tracking API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cosmic-purple" />
                    <span>Satellite TLE Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Planetary Ephemeris</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Constellation Catalog</span>
                  </div>
                </div>
              </div>

              <div className="glass-light rounded-xl p-4">
                <h3 className="text-xs uppercase tracking-widest text-cosmic-cyan/80 font-mono mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Leaflet', 'Zustand', 'Framer Motion', 'satellite.js'].map(tech => (
                    <span key={tech} className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-stardust/60">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-light rounded-xl p-4">
                <h3 className="text-xs uppercase tracking-widest text-cosmic-cyan/80 font-mono mb-3">Key Concepts</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-starlight font-medium">Zenith:</span>{' '}
                    <span className="text-stardust/70">The point in the sky directly above an observer</span>
                  </div>
                  <div>
                    <span className="text-starlight font-medium">Right Ascension (RA):</span>{' '}
                    <span className="text-stardust/70">Celestial equivalent of longitude, measured in hours</span>
                  </div>
                  <div>
                    <span className="text-starlight font-medium">Declination (DEC):</span>{' '}
                    <span className="text-stardust/70">Celestial equivalent of latitude, measured in degrees</span>
                  </div>
                  <div>
                    <span className="text-starlight font-medium">Elevation:</span>{' '}
                    <span className="text-stardust/70">Angle above the horizon (90° = directly overhead)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-[10px] text-stardust/30 font-mono tracking-wider">
                BUILT FOR HACKATHON 2026 · REAL-TIME COSMIC RADAR
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
