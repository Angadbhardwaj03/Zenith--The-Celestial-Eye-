import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { forwardGeocode } from '../../lib/api/celestial-api';

export default function SearchBar() {
  const { setUserLocation, setMapCenter, setMapZoom, setIsLoading } = useAppStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions] = useState([
    { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
    { name: 'Mumbai, India', lat: 19.076, lng: 72.8777 },
    { name: 'Cape Town, SA', lat: -33.9249, lng: 18.4241 },
    { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333 },
    { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  ]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    // Check if coordinates are entered directly
    const coordMatch = query.match(/^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      setUserLocation({ lat, lng, name: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` });
      setMapCenter([lat, lng]);
      setMapZoom(6);
      setIsLoading(false);
      return;
    }

    const result = await forwardGeocode(query);
    if (result) {
      setUserLocation({ lat: result.lat, lng: result.lng, name: result.name });
      setMapCenter([result.lat, result.lng]);
      setMapZoom(6);
    }
    setIsLoading(false);
  }, [query, setUserLocation, setMapCenter, setMapZoom, setIsLoading]);

  const handleSuggestionClick = (s: { name: string; lat: number; lng: number }) => {
    setQuery(s.name);
    setUserLocation({ lat: s.lat, lng: s.lng, name: s.name });
    setMapCenter([s.lat, s.lng]);
    setMapZoom(6);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <motion.div
        className={`glass rounded-xl flex items-center gap-2 px-4 py-3 transition-all duration-300 ${
          isFocused ? 'ring-1 ring-cosmic-cyan/40 shadow-[0_0_20px_rgba(56,189,248,0.15)]' : ''
        }`}
        layout
      >
        {/* Search icon */}
        <svg className="w-5 h-5 text-cosmic-cyan flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search location or enter coordinates..."
          className="bg-transparent outline-none text-starlight placeholder-stardust/50 w-full text-sm font-light"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-stardust hover:text-starlight transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={handleSearch}
          className="bg-cosmic-cyan/20 hover:bg-cosmic-cyan/30 text-cosmic-cyan px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
        >
          Search
        </button>
      </motion.div>

      {/* Suggestions dropdown */}
      {isFocused && !query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-50"
        >
          <div className="p-2">
            <p className="text-[10px] uppercase tracking-widest text-stardust/60 px-3 py-1.5 font-medium">
              Popular Locations
            </p>
            {suggestions.map((s) => (
              <button
                key={s.name}
                onMouseDown={() => handleSuggestionClick(s)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-cosmic-cyan/10 text-sm text-starlight/80 hover:text-starlight transition-colors flex items-center gap-2"
              >
                <span className="text-cosmic-cyan text-xs">📍</span>
                <span>{s.name}</span>
                <span className="text-[10px] text-stardust/40 ml-auto font-mono">
                  {s.lat.toFixed(1)}°, {s.lng.toFixed(1)}°
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
