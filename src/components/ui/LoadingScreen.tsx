import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-void flex flex-col items-center justify-center"
        >
          {/* Orbital animation */}
          <div className="relative w-24 h-24 mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-cosmic-cyan/30"
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cosmic-cyan shadow-lg shadow-cosmic-cyan/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-3 rounded-full border border-cosmic-purple/20"
            >
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cosmic-purple shadow-lg shadow-cosmic-purple/50" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cosmic-cyan to-cosmic-blue shadow-lg shadow-cosmic-cyan/30" />
            </div>
          </div>

          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-starlight mb-2"
          >
            Initializing Zenith
          </motion.h2>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-stardust/60 font-mono tracking-widest uppercase"
          >
            Syncing celestial telemetry...
          </motion.p>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
