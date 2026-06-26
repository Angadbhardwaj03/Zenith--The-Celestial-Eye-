/**
 * Orbital Mathematics Library
 * Handles coordinate conversions, zenith calculations, and astronomical computations
 */

// Convert degrees to radians
export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Convert radians to degrees
export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

// Calculate Julian Date
export function getJulianDate(date: Date = new Date()): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// Calculate Greenwich Mean Sidereal Time in degrees
export function getGMST(date: Date = new Date()): number {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

// Calculate Local Sidereal Time in degrees
export function getLST(longitude: number, date: Date = new Date()): number {
  const gmst = getGMST(date);
  let lst = gmst + longitude;
  lst = ((lst % 360) + 360) % 360;
  return lst;
}

// Calculate Right Ascension and Declination of the Zenith
export function getZenithRADec(lat: number, lng: number, date: Date = new Date()): { ra: number; dec: number } {
  const lst = getLST(lng, date);
  return {
    ra: lst, // RA of zenith equals LST (in degrees)
    dec: lat  // Dec of zenith equals latitude
  };
}

// Calculate angular separation between two points on the celestial sphere (in degrees)
export function angularSeparation(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const ra1Rad = degToRad(ra1);
  const dec1Rad = degToRad(dec1);
  const ra2Rad = degToRad(ra2);
  const dec2Rad = degToRad(dec2);
  
  const cosAngle = Math.sin(dec1Rad) * Math.sin(dec2Rad) +
    Math.cos(dec1Rad) * Math.cos(dec2Rad) * Math.cos(ra1Rad - ra2Rad);
  
  return radToDeg(Math.acos(Math.max(-1, Math.min(1, cosAngle))));
}

// Check if a celestial body is near the zenith (within a given cone angle in degrees)
export function isNearZenith(
  bodyRA: number, 
  bodyDec: number, 
  observerLat: number, 
  observerLng: number, 
  coneAngle: number = 45,
  date: Date = new Date()
): boolean {
  const zenith = getZenithRADec(observerLat, observerLng, date);
  const sep = angularSeparation(zenith.ra, zenith.dec, bodyRA, bodyDec);
  return sep <= coneAngle;
}

// Convert geographic coordinates to Altitude/Azimuth for an observer
export function geoToAltAz(
  bodyLat: number,
  bodyLng: number,
  bodyAlt: number, // km
  obsLat: number,
  obsLng: number
): { azimuth: number; elevation: number; distance: number } {
  const R = 6371; // Earth radius in km
  
  const lat1 = degToRad(obsLat);
  const lat2 = degToRad(bodyLat);
  const dLng = degToRad(bodyLng - obsLng);
  
  // Ground distance using Haversine
  const a = Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const groundDist = R * c;
  
  // Elevation angle
  const elevation = radToDeg(Math.atan2(bodyAlt - 0, groundDist));
  
  // 3D distance
  const distance = Math.sqrt(groundDist ** 2 + bodyAlt ** 2);
  
  // Azimuth
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let azimuth = radToDeg(Math.atan2(y, x));
  azimuth = ((azimuth % 360) + 360) % 360;
  
  return { azimuth, elevation, distance };
}

// Check if a satellite (given by lat/lng/alt) is above the horizon for an observer
export function isAboveHorizon(
  satLat: number,
  satLng: number,
  satAlt: number,
  obsLat: number,
  obsLng: number,
  minElevation: number = 5
): boolean {
  const { elevation } = geoToAltAz(satLat, satLng, satAlt, obsLat, obsLng);
  return elevation >= minElevation;
}

// Format velocity for display
export function formatVelocity(kmPerSec: number): string {
  return `${(kmPerSec).toFixed(2)} km/s`;
}

// Format altitude for display
export function formatAltitude(km: number): string {
  if (km >= 1000000) return `${(km / 1000000).toFixed(1)}M km`;
  if (km >= 1000) return `${(km / 1000).toFixed(1)}K km`;
  return `${km.toFixed(0)} km`;
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km >= 149597870.7) return `${(km / 149597870.7).toFixed(2)} AU`;
  if (km >= 1000000) return `${(km / 1000000).toFixed(1)}M km`;
  if (km >= 1000) return `${Math.round(km).toLocaleString()} km`;
  return `${km.toFixed(0)} km`;
}

// Get cardinal direction from azimuth
export function getCardinalDirection(azimuth: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
}

// Planet data with approximate orbital elements (simplified)
export interface PlanetData {
  name: string;
  color: string;
  icon: string;
  description: string;
  meanDistance: number; // AU from Sun
  orbitalPeriod: number; // days
  magnitude: number; // typical apparent magnitude
}

export const PLANETS: PlanetData[] = [
  { name: 'Mercury', color: '#B8B8B8', icon: '☿', description: 'The smallest and closest planet to the Sun', meanDistance: 0.387, orbitalPeriod: 87.97, magnitude: -0.4 },
  { name: 'Venus', color: '#FFD700', icon: '♀', description: 'The brightest planet, often called the morning or evening star', meanDistance: 0.723, orbitalPeriod: 224.7, magnitude: -4.1 },
  { name: 'Mars', color: '#FF4500', icon: '♂', description: 'The Red Planet, named after the Roman god of war', meanDistance: 1.524, orbitalPeriod: 686.97, magnitude: -1.5 },
  { name: 'Jupiter', color: '#DAA520', icon: '♃', description: 'The largest planet in our solar system', meanDistance: 5.203, orbitalPeriod: 4332.59, magnitude: -2.2 },
  { name: 'Saturn', color: '#F4D03F', icon: '♄', description: 'Famous for its stunning ring system', meanDistance: 9.537, orbitalPeriod: 10759.22, magnitude: 0.5 },
  { name: 'Uranus', color: '#7EC8E3', icon: '⛢', description: 'An ice giant tilted on its side', meanDistance: 19.191, orbitalPeriod: 30688.5, magnitude: 5.7 },
  { name: 'Neptune', color: '#4169E1', icon: '♆', description: 'The most distant known planet', meanDistance: 30.069, orbitalPeriod: 60182, magnitude: 7.8 },
];

// Constellation data
export interface ConstellationData {
  name: string;
  abbreviation: string;
  ra: number; // center RA in degrees
  dec: number; // center Dec in degrees
  description: string;
  stars: number;
}

export const CONSTELLATIONS: ConstellationData[] = [
  { name: 'Orion', abbreviation: 'Ori', ra: 82.5, dec: 5, description: 'The Hunter - one of the most recognizable constellations', stars: 7 },
  { name: 'Ursa Major', abbreviation: 'UMa', ra: 165, dec: 55, description: 'The Great Bear - contains the Big Dipper asterism', stars: 7 },
  { name: 'Cassiopeia', abbreviation: 'Cas', ra: 15, dec: 60, description: 'The Queen - distinctive W shape near the North Pole', stars: 5 },
  { name: 'Scorpius', abbreviation: 'Sco', ra: 247.5, dec: -30, description: 'The Scorpion - prominent in summer skies', stars: 15 },
  { name: 'Leo', abbreviation: 'Leo', ra: 165, dec: 15, description: 'The Lion - zodiac constellation with bright Regulus', stars: 9 },
  { name: 'Cygnus', abbreviation: 'Cyg', ra: 310, dec: 40, description: 'The Swan - lies along the Milky Way', stars: 9 },
  { name: 'Gemini', abbreviation: 'Gem', ra: 105, dec: 25, description: 'The Twins - named for Castor and Pollux', stars: 8 },
  { name: 'Sagittarius', abbreviation: 'Sgr', ra: 285, dec: -25, description: 'The Archer - points toward galactic center', stars: 12 },
  { name: 'Taurus', abbreviation: 'Tau', ra: 67.5, dec: 17, description: 'The Bull - home of the Pleiades and Hyades clusters', stars: 6 },
  { name: 'Aquarius', abbreviation: 'Aqr', ra: 335, dec: -10, description: 'The Water Bearer - large zodiac constellation', stars: 10 },
  { name: 'Canis Major', abbreviation: 'CMa', ra: 101, dec: -22, description: 'The Great Dog - home of Sirius, the brightest star', stars: 8 },
  { name: 'Lyra', abbreviation: 'Lyr', ra: 284, dec: 36, description: 'The Lyre - contains brilliant Vega', stars: 5 },
  { name: 'Andromeda', abbreviation: 'And', ra: 10, dec: 38, description: 'The Princess - contains the nearest large galaxy', stars: 4 },
  { name: 'Crux', abbreviation: 'Cru', ra: 186, dec: -60, description: 'The Southern Cross - smallest constellation', stars: 4 },
  { name: 'Pegasus', abbreviation: 'Peg', ra: 340, dec: 20, description: 'The Winged Horse - Great Square asterism', stars: 9 },
  { name: 'Virgo', abbreviation: 'Vir', ra: 195, dec: -3, description: 'The Maiden - largest zodiac constellation', stars: 9 },
];

// Calculate approximate planet positions (simplified geocentric)
export function getPlanetPositions(date: Date = new Date()): Array<{
  name: string;
  ra: number;
  dec: number;
  distance: number;
  color: string;
  icon: string;
  description: string;
  magnitude: number;
}> {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0; // centuries since J2000

  // Simplified planetary longitude calculations (mean anomaly based)
  const planetLongitudes: { [key: string]: { L0: number; Ldot: number; ecc: number; incl: number } } = {
    'Mercury': { L0: 252.25, Ldot: 149472.67, ecc: 0.2056, incl: 7.0 },
    'Venus':   { L0: 181.98, Ldot: 58517.82, ecc: 0.0068, incl: 3.4 },
    'Mars':    { L0: 355.43, Ldot: 19140.30, ecc: 0.0934, incl: 1.85 },
    'Jupiter': { L0: 34.35,  Ldot: 3034.91, ecc: 0.0484, incl: 1.3 },
    'Saturn':  { L0: 50.08,  Ldot: 1222.11, ecc: 0.0542, incl: 2.49 },
    'Uranus':  { L0: 314.06, Ldot: 428.97, ecc: 0.0472, incl: 0.77 },
    'Neptune': { L0: 304.35, Ldot: 218.46, ecc: 0.0086, incl: 1.77 },
  };

  // Earth's mean longitude (used for reference)
  const _earthL = (100.46 + 35999.37 * T) % 360;
  void _earthL;

  return PLANETS.map(planet => {
    const params = planetLongitudes[planet.name];
    const L = ((params.L0 + params.Ldot * T) % 360 + 360) % 360;
    
    // Geocentric ecliptic longitude (approximate)
    let geoLng: number;
    if (planet.meanDistance < 1) {
      // Inner planet
      geoLng = L;
    } else {
      // Outer planet - simplified opposition calculation
      geoLng = L;
    }
    
    // Convert ecliptic to equatorial (simplified)
    const obliquity = 23.4393 - 0.0130 * T; // obliquity of ecliptic
    const eclLng = degToRad(geoLng);
    const eclLat = degToRad(params.incl * Math.sin(degToRad(geoLng - params.L0)));
    
    const sinDec = Math.sin(eclLat) * Math.cos(degToRad(obliquity)) +
      Math.cos(eclLat) * Math.sin(degToRad(obliquity)) * Math.sin(eclLng);
    const dec = radToDeg(Math.asin(Math.max(-1, Math.min(1, sinDec))));
    
    const y = Math.sin(eclLng) * Math.cos(degToRad(obliquity)) - Math.tan(eclLat) * Math.sin(degToRad(obliquity));
    const x = Math.cos(eclLng);
    let ra = radToDeg(Math.atan2(y, x));
    ra = ((ra % 360) + 360) % 360;

    return {
      name: planet.name,
      ra,
      dec,
      distance: planet.meanDistance * 149597870.7, // AU to km
      color: planet.color,
      icon: planet.icon,
      description: planet.description,
      magnitude: planet.magnitude,
    };
  });
}

// Get constellations visible from a location
export function getVisibleConstellations(
  obsLat: number, 
  obsLng: number, 
  coneAngle: number = 60,
  date: Date = new Date()
): ConstellationData[] {
  const zenith = getZenithRADec(obsLat, obsLng, date);
  
  return CONSTELLATIONS.filter(c => {
    const sep = angularSeparation(zenith.ra, zenith.dec, c.ra, c.dec);
    return sep <= coneAngle;
  });
}
