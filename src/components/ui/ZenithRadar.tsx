import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

export default function ZenithRadar() {
  const { celestialBodies, userLocation, setActiveTarget, viewMode } = useAppStore();

  // Filter bodies that are above horizon and map to radar coordinates
  const radarBodies = useMemo(() => {
    if (!userLocation) return [];
    
    return celestialBodies
      .filter(b => b.elevation !== undefined && b.elevation > 0)
      .map(body => {
        const el = body.elevation || 0;
        const az = body.azimuth || 0;
        
        // Convert elevation/azimuth to radar x,y (0,0 = center = zenith)
        // elevation 90° = center, 0° = edge
        const r = (1 - el / 90) * 45; // radius as percentage (max 45%)
        const azRad = (az - 90) * (Math.PI / 180); // -90 to start from top
        const x = 50 + r * Math.cos(azRad);
        const y = 50 + r * Math.sin(azRad);
        
        return { ...body, x, y, r };
      });
  }, [celestialBodies, userLocation]);

  if (viewMode !== 'radar' || !userLocation) return null;

  const typeColors: Record<string, string> = {
    iss: '#38BDF8',
    satellite: '#A855F7',
    planet: '#F59E0B',
    constellation: '#22D3EE',
    star: '#FDE047',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="relative w-[min(90vw,600px)] h-[min(90vw,600px)] pointer-events-auto">
          {/* Radar background */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background */}
            <defs>
              <radialGradient id="radarBg" cx="50%" cy="50%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.05)" />
                <stop offset="100%" stopColor="rgba(5,5,16,0.95)" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            <circle cx="50" cy="50" r="48" fill="url(#radarBg)" stroke="rgba(56,189,248,0.15)" strokeWidth="0.3" />
            
            {/* Concentric rings (elevation markers) */}
            {[15, 30, 45].map((r, i) => (
              <circle
                key={r}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="rgba(56,189,248,0.08)"
                strokeWidth="0.2"
                strokeDasharray={i === 2 ? "1 1" : "none"}
              />
            ))}
            
            {/* Cross hairs */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(56,189,248,0.06)" strokeWidth="0.15" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(56,189,248,0.06)" strokeWidth="0.15" />
            <line x1="16" y1="16" x2="84" y2="84" stroke="rgba(56,189,248,0.04)" strokeWidth="0.15" />
            <line x1="84" y1="16" x2="16" y2="84" stroke="rgba(56,189,248,0.04)" strokeWidth="0.15" />
            
            {/* Cardinal direction labels */}
            <text x="50" y="4" textAnchor="middle" fill="rgba(56,189,248,0.5)" fontSize="2.5" fontFamily="JetBrains Mono, monospace">N</text>
            <text x="50" y="99" textAnchor="middle" fill="rgba(56,189,248,0.5)" fontSize="2.5" fontFamily="JetBrains Mono, monospace">S</text>
            <text x="97" y="51" textAnchor="middle" fill="rgba(56,189,248,0.5)" fontSize="2.5" fontFamily="JetBrains Mono, monospace">E</text>
            <text x="3" y="51" textAnchor="middle" fill="rgba(56,189,248,0.5)" fontSize="2.5" fontFamily="JetBrains Mono, monospace">W</text>
            
            {/* Elevation labels */}
            <text x="50" y="37.5" textAnchor="middle" fill="rgba(148,163,184,0.3)" fontSize="1.5" fontFamily="JetBrains Mono, monospace">60°</text>
            <text x="50" y="22" textAnchor="middle" fill="rgba(148,163,184,0.3)" fontSize="1.5" fontFamily="JetBrains Mono, monospace">30°</text>
            
            {/* Zenith marker */}
            <circle cx="50" cy="50" r="1" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="0.4" fill="rgba(56,189,248,0.8)" />
            <text x="50" y="47" textAnchor="middle" fill="rgba(56,189,248,0.6)" fontSize="1.5" fontFamily="JetBrains Mono, monospace">ZENITH</text>
            
            {/* Scan line animation */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="5"
              stroke="rgba(56,189,248,0.15)"
              strokeWidth="0.3"
              className="origin-center"
              style={{
                animation: 'spin 6s linear infinite',
                transformOrigin: '50px 50px',
              }}
            />

            {/* Celestial bodies */}
            {radarBodies.map((body, i) => (
              <g
                key={body.id}
                onClick={() => setActiveTarget(body)}
                className="cursor-pointer"
                filter="url(#glow)"
              >
                {/* Pulse ring for ISS */}
                {body.type === 'iss' && (
                  <circle
                    cx={body.x}
                    cy={body.y}
                    r="2"
                    fill="none"
                    stroke={typeColors[body.type]}
                    strokeWidth="0.15"
                    opacity="0.5"
                  >
                    <animate attributeName="r" from="1" to="3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                
                {/* Body dot */}
                <circle
                  cx={body.x}
                  cy={body.y}
                  r={body.type === 'iss' ? 1.2 : body.type === 'planet' ? 1 : body.type === 'constellation' ? 0.8 : 0.5}
                  fill={typeColors[body.type] || body.color || '#fff'}
                  opacity={0.9}
                >
                  <animate
                    attributeName="opacity"
                    values="0.7;1;0.7"
                    dur={`${2 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                
                {/* Label */}
                {(body.type === 'iss' || body.type === 'planet' || body.type === 'constellation') && (
                  <text
                    x={body.x + 1.5}
                    y={body.y + 0.5}
                    fill={typeColors[body.type] || '#fff'}
                    fontSize="1.5"
                    fontFamily="JetBrains Mono, monospace"
                    opacity="0.7"
                  >
                    {body.type === 'iss' ? 'ISS' : body.name.length > 10 ? body.name.slice(0, 8) + '..' : body.name}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Scan line CSS */}
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>

          {/* Legend */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 glass rounded-xl px-4 py-2">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-stardust/70 uppercase tracking-wider font-mono">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
