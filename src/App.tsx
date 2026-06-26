import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import {
  fetchISSPosition,
  fetchActiveSatellitesTLE,
  computeSatellitePositions,
  getCelestialBodiesAtLocation,
} from './lib/api/celestial-api';
import type { SatRecord } from './lib/api/celestial-api';

// Components
import StarField from './components/ui/StarField';
import Header from './components/ui/Header';
import LeafletMap from './components/map/LeafletMap';
import LandingOverlay from './components/ui/LandingOverlay';
import TelemetryCard from './components/ui/TelemetryCard';
import ZenithInfo from './components/ui/ZenithInfo';
import ZenithRadar from './components/ui/ZenithRadar';
import SatelliteList from './components/ui/SatelliteList';
import LoadingScreen from './components/ui/LoadingScreen';
import MiniStats from './components/ui/MiniStats';
import ZenithSkyView from './components/ui/ZenithSkyView';
import WeatherOverlay from './components/ui/WeatherOverlay';
import LaunchesPanel from './components/ui/LaunchesPanel';

function App() {
  const {
    userLocation,
    setIssPosition,
    issPosition,
    setCelestialBodies,
    setAllSatellites,
    setSatRecords,
    allSatellites,
    isLoading,
    setIsLoading,
  } = useAppStore();

  const [initialLoading, setInitialLoading] = useState(true);
  const tlesRef = useRef<SatRecord[]>([]);

  // Fetch TLEs on mount
  useEffect(() => {
    async function loadTLEs() {
      const records = await fetchActiveSatellitesTLE();
      tlesRef.current = records;

      const recordMap: Record<number, any> = {};
      for (const r of records) {
        recordMap[r.noradId] = r.satrec;
      }
      setSatRecords(recordMap);

      setAllSatellites(computeSatellitePositions(records));
      setTimeout(() => setInitialLoading(false), 2000);
    }
    loadTLEs();
  }, [setAllSatellites, setSatRecords]);

  // Fetch ISS position periodically
  const fetchISS = useCallback(async () => {
    const pos = await fetchISSPosition();
    if (pos) {
      setIssPosition(pos);
    }
  }, [setIssPosition]);

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, [fetchISS]);

  // Regenerate satellite positions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (tlesRef.current.length > 0) {
        setAllSatellites(computeSatellitePositions(tlesRef.current));
      }
    }, 5000); // Compute real positions faster (5s) for smooth visual
    return () => clearInterval(interval);
  }, [setAllSatellites]);

  // Calculate celestial bodies when user location changes or ISS updates
  useEffect(() => {
    if (!userLocation) {
      setCelestialBodies([]);
      return;
    }

    setIsLoading(true);

    // Small delay for smooth animation
    const timer = setTimeout(() => {
      const bodies = getCelestialBodiesAtLocation(
        userLocation.lat,
        userLocation.lng,
        allSatellites,
        issPosition
      );
      setCelestialBodies(bodies);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userLocation, issPosition, allSatellites, setCelestialBodies, setIsLoading]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-void">
      {/* Loading Screen */}
      <LoadingScreen show={initialLoading} />

      {/* Background */}
      <StarField />

      {/* Map Layer */}
      <LeafletMap />

      {/* Zenith Radar Overlay */}
      <ZenithRadar />

      {/* UI Overlays */}
      <Header />
      <LandingOverlay />
      <WeatherOverlay />

      {/* Satellite List (Left Panel) */}
      <SatelliteList />
      <LaunchesPanel />

      {/* Right Stats Panel */}
      <MiniStats />

      {/* Bottom Zenith Info */}
      <ZenithInfo />

      {/* Zenith Sky View (Radar mode) */}
      <ZenithSkyView />

      {/* Right Telemetry Card */}
      <TelemetryCard />

      {/* Loading indicator */}
      {isLoading && userLocation && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
          <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-cosmic-cyan border-t-transparent animate-spin" />
            <span className="text-xs text-stardust/70 font-mono">Scanning sky...</span>
          </div>
        </div>
      )}

      {/* Grid lines overlay for aesthetic */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 z-[3] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(5,5,16,0.4) 100%)',
        }}
      />
    </div>
  );
}

export default App;
