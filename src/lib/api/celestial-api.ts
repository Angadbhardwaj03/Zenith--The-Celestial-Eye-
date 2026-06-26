/**
 * Celestial API Integration
 * Handles fetching data from OpenNotify (ISS), and generating satellite/planet data
 */

import { CelestialBody } from '../../store/useAppStore';
import {
  geoToAltAz,
  getPlanetPositions,
  getVisibleConstellations,
  getZenithRADec,
  angularSeparation,
  formatAltitude,
} from '../math/orbital-math';
import * as satellite from 'satellite.js';

export interface SatRecord {
  satrec: satellite.SatRec;
  name: string;
  noradId: number;
}

// ISS Position from OpenNotify API
export async function fetchISSPosition(): Promise<{
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  timestamp: number;
} | null> {
  try {
    // Use a CORS proxy or direct fetch
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!response.ok) throw new Error('Failed to fetch ISS position');
    const data = await response.json();
    return {
      lat: data.latitude,
      lng: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.warn('ISS API fallback - using simulated data:', error);
    // Simulate ISS position if API fails
    return simulateISSPosition();
  }
}

// Simulate ISS position (realistic orbit)
function simulateISSPosition(): {
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  timestamp: number;
} {
  const now = Date.now() / 1000;
  const period = 92.65 * 60; // ISS orbital period in seconds
  const phase = (now % period) / period;

  // ISS has ~51.6 degree inclination
  const inclination = 51.6;
  const lng = ((phase * 360 - 180 + (now / 240)) % 360) - 180;
  const lat = inclination * Math.sin(phase * 2 * Math.PI);

  return {
    lat,
    lng,
    altitude: 408 + Math.sin(now / 100) * 5,
    velocity: 7.66 + Math.random() * 0.1,
    timestamp: now,
  };
}

// Fetch active satellites TLE from CelesTrak
export async function fetchActiveSatellitesTLE(): Promise<SatRecord[]> {
  try {
    // using a CORS proxy (allorigins raw) because CelesTrak sometimes rejects localhost Origins outright
    const targetUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle';
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Failed to fetch TLEs');

    const text = await response.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const records: SatRecord[] = [];

    // We only take the first ~250 for performance if we don't have clustering setup, 
    // but the file has ~8000. Let's take up to 200 random/active prominent ones.
    // Parse up to 1500 to ensure global coverage
    const limit = Math.min(lines.length, 1500 * 3);
    for (let i = 0; i < limit; i += 3) {
      const name = lines[i];
      const tleLine1 = lines[i + 1];
      const tleLine2 = lines[i + 2];

      if (tleLine1 && tleLine2) {
        const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        records.push({
          satrec: satrec,
          name: name,
          noradId: parseInt(tleLine1.substring(2, 7).trim(), 10)
        });
      }
    }
    return records;
  } catch (error) {
    console.warn('Failed to fetch real TLEs:', error);
    return [];
  }
}

// Compute live positions from SatRecords
export function computeSatellitePositions(records: SatRecord[]): CelestialBody[] {
  const bodies: CelestialBody[] = [];
  const now = new Date();

  for (const record of records) {
    const positionAndVelocity = satellite.propagate(record.satrec, now);
    if (!positionAndVelocity || !positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') continue;

    const gmst = satellite.gstime(now);
    const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

    const lat = satellite.degreesLat(positionGd.latitude);
    const lng = satellite.degreesLong(positionGd.longitude);
    const altitude = positionGd.height;

    // Calculate velocity mag in km/s roughly
    let velocity = 7.6;
    if (positionAndVelocity.velocity && typeof positionAndVelocity.velocity !== 'boolean') {
      const v = positionAndVelocity.velocity;
      velocity = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    bodies.push({
      id: `sat-${record.noradId}`,
      name: record.name,
      type: 'satellite',
      lat,
      lng,
      altitude,
      velocity,
      description: `Active satellite at ${formatAltitude(altitude)}`,
      color: altitude > 30000 ? '#F59E0B' : altitude > 1000 ? '#A855F7' : '#38BDF8',
      noradId: record.noradId,
      category: 'Satellite', // Can parse further from name if needed
    });
  }

  return bodies;
}

// Get celestial bodies visible from a location
export function getCelestialBodiesAtLocation(
  lat: number,
  lng: number,
  allSatellites: CelestialBody[],
  issPos: { lat: number; lng: number; altitude: number; velocity: number } | null
): CelestialBody[] {
  const bodies: CelestialBody[] = [];
  const now = new Date();

  // Always add ISS so users can select it to see future pass predictions
  if (issPos) {
    const issAltAz = geoToAltAz(issPos.lat, issPos.lng, issPos.altitude, lat, lng);
    bodies.push({
      id: 'iss',
      name: 'International Space Station',
      type: 'iss',
      lat: issPos.lat,
      lng: issPos.lng,
      altitude: issPos.altitude,
      velocity: issPos.velocity,
      azimuth: issAltAz.azimuth,
      elevation: issAltAz.elevation,
      distance: issAltAz.distance,
      description: 'The largest modular space station in low Earth orbit',
      color: '#38BDF8',
      icon: '🛰️',
      noradId: 25544,
    });
  }

  // Filter satellites that are above horizon
  allSatellites.forEach(sat => {
    if (sat.altitude) {
      const altAz = geoToAltAz(sat.lat, sat.lng, sat.altitude, lat, lng);
      if (altAz.elevation > 0) {
        bodies.push({
          ...sat,
          azimuth: altAz.azimuth,
          elevation: altAz.elevation,
          distance: altAz.distance,
        });
      }
    }
  });

  // Add planets
  const zenith = getZenithRADec(lat, lng, now);
  const planets = getPlanetPositions(now);

  planets.forEach(planet => {
    const sep = angularSeparation(zenith.ra, zenith.dec, planet.ra, planet.dec);
    if (sep < 90) { // Above horizon approximation
      const elevation = 90 - sep;
      const azimuth = ((planet.ra - zenith.ra + 360) % 360);
      bodies.push({
        id: `planet-${planet.name}`,
        name: planet.name,
        type: 'planet',
        lat: planet.dec,
        lng: ((planet.ra - getGMSTDeg(now) + 540) % 360) - 180,
        altitude: planet.distance,
        elevation,
        azimuth,
        distance: planet.distance,
        magnitude: planet.magnitude,
        description: planet.description,
        color: planet.color,
        icon: planet.icon,
      });
    }
  });

  // Add constellations
  const visibleConstellations = getVisibleConstellations(lat, lng, 70, now);
  visibleConstellations.forEach(c => {
    const sep = angularSeparation(zenith.ra, zenith.dec, c.ra, c.dec);
    bodies.push({
      id: `const-${c.abbreviation}`,
      name: c.name,
      type: 'constellation',
      lat: c.dec,
      lng: ((c.ra - getGMSTDeg(now) + 540) % 360) - 180,
      elevation: 90 - sep,
      azimuth: ((c.ra - zenith.ra + 360) % 360),
      description: c.description,
      color: '#E2E8F0',
      icon: '⭐',
    });
  });

  return bodies;
}

function getGMSTDeg(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

// Reverse geocode (simplified city lookup)
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  } catch {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  }
}

// Forward geocode
export async function forwardGeocode(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    );
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        name: data[0].display_name?.split(',').slice(0, 2).join(','),
      };
    }
    return null;
  } catch {
    return null;
  }
}
