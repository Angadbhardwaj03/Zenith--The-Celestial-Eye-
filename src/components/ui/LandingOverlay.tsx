import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

export default function LandingOverlay() {
  const { userLocation, setUserLocation, setMapCenter, setMapZoom } = useAppStore();

  const quickLocations = [
    { name: 'New York', lat: 40.7128, lng: -74.006, emoji: '🗽' },
    { name: 'London', lat: 51.5074, lng: -0.1278, emoji: '🏰' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, emoji: '⛩️' },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, emoji: '🦘' },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, emoji: '🕌' },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, emoji: '🌴' },
  ];

  const handleQuickSelect = (loc: { name: string; lat: number; lng: number }) => {
    setUserLocation({ lat: loc.lat, lng: loc.lng, name: loc.name });
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(6);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude, name: 'My Location' });
          setMapCenter([latitude, longitude]);
          setMapZoom(8);
        },
        () => {
          // Fallback to a default location
          handleQuickSelect({ name: 'Greenwich, London', lat: 51.4769, lng: -0.0005 });
        }
      );
    }
  };

  return (
    <AnimatePresence>
      {!userLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <div className="pointer-events-auto text-center max-w-lg mx-auto px-6">
            {/* Animated orbital rings */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 15 }}
              className="relative w-32 h-32 mx-auto mb-8"
            >
              <div className="absolute inset-0 rounded-full border border-cosmic-cyan/20 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-2 rounded-full border border-cosmic-purple/15 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 rounded-full border border-cosmic-cyan/10 animate-spin" style={{ animationDuration: '10s' }} />
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                🔭
              </div>
              {/* Orbiting dot */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cosmic-cyan shadow-lg shadow-cosmic-cyan/50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cosmic-cyan via-cosmic-blue to-cosmic-purple bg-clip-text text-transparent">
                  Project Zenith
                </span>
              </h1>
              <p className="text-stardust/60 text-sm mb-1 font-mono tracking-[0.3em] uppercase">
                The Celestial Eye
              </p>
              <p className="text-stardust/80 text-sm mt-4 mb-8 max-w-sm mx-auto leading-relaxed">
                Select any point on Earth to discover what celestial bodies are passing through your zenith right now.
              </p>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col gap-3 items-center"
            >
              <button
                onClick={handleUseMyLocation}
                className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-cosmic-cyan/20 to-cosmic-blue/20 border border-cosmic-cyan/30 hover:border-cosmic-cyan/60 transition-all duration-300 flex items-center gap-2 w-full max-w-xs justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cosmic-cyan/5 to-cosmic-blue/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg className="w-5 h-5 text-cosmic-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-cosmic-cyan font-medium text-sm">Use My Location</span>
              </button>

              <p className="text-stardust/40 text-xs">or click anywhere on the map</p>

              {/* Quick locations */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {quickLocations.map(loc => (
                  <button
                    key={loc.name}
                    onClick={() => handleQuickSelect(loc)}
                    className="glass-light rounded-lg px-3 py-1.5 text-xs text-stardust/70 hover:text-starlight hover:bg-white/5 transition-all flex items-center gap-1"
                  >
                    <span>{loc.emoji}</span>
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 text-stardust/30 text-[10px] uppercase tracking-widest font-mono"
            >
              Real-time celestial tracking
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
