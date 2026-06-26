import { create } from 'zustand';

export interface CelestialBody {
  id: string;
  name: string;
  type: 'iss' | 'satellite' | 'planet' | 'constellation' | 'star';
  lat: number;
  lng: number;
  altitude?: number; // km
  velocity?: number; // km/s
  azimuth?: number; // degrees
  elevation?: number; // degrees above horizon
  distance?: number; // km from observer
  magnitude?: number; // apparent magnitude
  description?: string;
  icon?: string;
  color?: string;
  orbitPath?: [number, number][];
  noradId?: number;
  category?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface AppState {
  // User location
  userLocation: UserLocation | null;
  setUserLocation: (loc: UserLocation | null) => void;

  // Active target (selected celestial body)
  activeTarget: CelestialBody | null;
  setActiveTarget: (target: CelestialBody | null) => void;

  // Celestial bodies (visible from selected location)
  celestialBodies: CelestialBody[];
  setCelestialBodies: (bodies: CelestialBody[]) => void;

  // All satellites for global map view
  allSatellites: CelestialBody[];
  setAllSatellites: (sats: CelestialBody[]) => void;

  satRecords: Record<number, any>;
  setSatRecords: (records: Record<number, any>) => void;

  // ISS data
  issPosition: { lat: number; lng: number; altitude: number; velocity: number } | null;
  setIssPosition: (pos: { lat: number; lng: number; altitude: number; velocity: number } | null) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  showZenithView: boolean;
  setShowZenithView: (show: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Map view
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;

  mapZoom: number;
  setMapZoom: (zoom: number) => void;

  // Time
  timeScale: number;
  setTimeScale: (scale: number) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // View mode
  viewMode: 'globe' | 'zenith' | 'radar';
  setViewMode: (mode: 'globe' | 'zenith' | 'radar') => void;
}

export const useAppStore = create<AppState>((set) => ({
  userLocation: null,
  setUserLocation: (loc) => set({ userLocation: loc }),

  activeTarget: null,
  setActiveTarget: (target) => set({ activeTarget: target, sidebarOpen: target !== null }),

  celestialBodies: [],
  setCelestialBodies: (bodies) => set({ celestialBodies: bodies }),

  allSatellites: [],
  setAllSatellites: (sats) => set({ allSatellites: sats }),

  satRecords: {},
  setSatRecords: (records) => set({ satRecords: records }),

  issPosition: null,
  setIssPosition: (pos) => set({ issPosition: pos }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  showZenithView: false,
  setShowZenithView: (show) => set({ showZenithView: show }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  mapCenter: [20, 0],
  setMapCenter: (center) => set({ mapCenter: center }),

  mapZoom: 3,
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  timeScale: 1,
  setTimeScale: (scale) => set({ timeScale: scale }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  viewMode: 'globe',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
