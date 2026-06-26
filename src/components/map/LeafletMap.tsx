import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { useAppStore } from '../../store/useAppStore';
import { reverseGeocode } from '../../lib/api/celestial-api';

export default function LeafletMap() {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const issMarkerRef = useRef<L.Marker | null>(null);
    const orbitLineRef = useRef<L.Polyline | null>(null);
    const zenithCircleRef = useRef<L.Circle | null>(null);

    const {
        mapCenter,
        mapZoom,
        userLocation,
        setUserLocation,
        setMapCenter,
        setMapZoom,
        issPosition,
        celestialBodies,
        allSatellites,
        setActiveTarget,
        viewMode,
    } = useAppStore();

    const handleMapClick = useCallback(async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const name = await reverseGeocode(lat, lng);
        setUserLocation({ lat, lng, name });
        setMapCenter([lat, lng]);
    }, [setUserLocation, setMapCenter]);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: mapCenter,
            zoom: mapZoom,
            zoomControl: true,
            attributionControl: false,
            preferCanvas: true,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        map.on('click', handleMapClick);
        map.on('moveend', () => {
            const c = map.getCenter();
            setMapCenter([c.lat, c.lng]);
            setMapZoom(map.getZoom());
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update map center
    useEffect(() => {
        if (!mapRef.current) return;
        const currentCenter = mapRef.current.getCenter();
        if (Math.abs(currentCenter.lat - mapCenter[0]) > 0.01 || Math.abs(currentCenter.lng - mapCenter[1]) > 0.01) {
            mapRef.current.flyTo(mapCenter, mapZoom, { duration: 1.5 });
        }
    }, [mapCenter, mapZoom]);

    // User location marker
    useEffect(() => {
        if (!mapRef.current) return;

        if (userMarkerRef.current) {
            mapRef.current.removeLayer(userMarkerRef.current);
        }

        if (userLocation) {
            const pulseIcon = L.divIcon({
                className: 'zenith-marker',
                html: `
          <div style="position:relative;width:40px;height:40px;">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
              <div style="width:12px;height:12px;background:radial-gradient(circle,#38BDF8,#0ea5e9);border-radius:50%;box-shadow:0 0 20px rgba(56,189,248,0.6);z-index:2;"></div>
            </div>
            <div style="position:absolute;inset:0;border:2px solid rgba(56,189,248,0.4);border-radius:50%;animation:pulse-ring 2s ease-out infinite;"></div>
            <div style="position:absolute;inset:4px;border:1px solid rgba(56,189,248,0.2);border-radius:50%;animation:pulse-ring 2s ease-out 0.5s infinite;"></div>
          </div>
        `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });

            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: pulseIcon })
                .addTo(mapRef.current)
                .bindPopup(`
          <div style="background:#0f172a;color:#f8fafc;padding:12px;border-radius:12px;font-family:Inter,sans-serif;min-width:180px;">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Selected Location</div>
            <div style="font-size:14px;font-weight:600;margin-bottom:8px;">${userLocation.name || 'Unknown'}</div>
            <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#38bdf8;">
              ${userLocation.lat.toFixed(4)}° ${userLocation.lat >= 0 ? 'N' : 'S'}, ${userLocation.lng.toFixed(4)}° ${userLocation.lng >= 0 ? 'E' : 'W'}
            </div>
          </div>
        `, {
                    className: 'custom-popup',
                });

            // Zenith visibility cone (approximate ground projection)
            if (zenithCircleRef.current) {
                mapRef.current.removeLayer(zenithCircleRef.current);
            }
            zenithCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
                radius: 2000000, // ~2000km radius (approximate zenith cone footprint for LEO)
                color: '#38BDF8',
                fillColor: '#38BDF8',
                fillOpacity: 0.03,
                weight: 1,
                opacity: 0.15,
                dashArray: '8 6',
            }).addTo(mapRef.current);
        }
    }, [userLocation]);

    // ISS Marker
    useEffect(() => {
        if (!mapRef.current || !issPosition) return;

        const issIcon = L.divIcon({
            className: 'zenith-marker',
            html: `
        <div style="position:relative;width:36px;height:36px;cursor:pointer;">
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;filter:drop-shadow(0 0 8px rgba(56,189,248,0.8));">
            🛰️
          </div>
          <div style="position:absolute;inset:-4px;border:1.5px solid rgba(56,189,248,0.3);border-radius:50%;animation:pulse-ring 3s ease-out infinite;"></div>
        </div>
      `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
        });

        if (issMarkerRef.current) {
            issMarkerRef.current.setLatLng([issPosition.lat, issPosition.lng]);
        } else {
            issMarkerRef.current = L.marker([issPosition.lat, issPosition.lng], { icon: issIcon })
                .addTo(mapRef.current)
                .on('click', () => {
                    setActiveTarget({
                        id: 'iss',
                        name: 'International Space Station',
                        type: 'iss',
                        lat: issPosition.lat,
                        lng: issPosition.lng,
                        altitude: issPosition.altitude,
                        velocity: issPosition.velocity,
                        description: 'The largest modular space station in low Earth orbit. Crew of 7 astronauts. Orbits at ~408km altitude.',
                        color: '#38BDF8',
                        icon: '🛰️',
                    });
                });
        }

        // ISS orbit path (approximate)
        if (orbitLineRef.current) {
            mapRef.current.removeLayer(orbitLineRef.current);
        }

        const orbitPoints: L.LatLngExpression[] = [];
        const inclination = 51.6;
        const now = Date.now() / 1000;
        const period = 92.65 * 60;

        for (let i = -50; i <= 50; i++) {
            const t = now + i * 60;
            const phase = ((t % period) / period);
            const lng = ((phase * 360 - 180 + (t / 240)) % 360) - 180;
            const lat = inclination * Math.sin(phase * 2 * Math.PI);
            orbitPoints.push([lat, lng]);
        }

        orbitLineRef.current = L.polyline(orbitPoints, {
            color: '#38BDF8',
            weight: 1.5,
            opacity: 0.3,
            dashArray: '6 4',
        }).addTo(mapRef.current);

    }, [issPosition, setActiveTarget]);

    // Satellite markers on the map
    useEffect(() => {
        if (!mapRef.current || !markersRef.current) return;

        markersRef.current.clearLayers();

        // Show all global satellites PLUS the planets and stars visible from the selected location
        const nonSatellites = celestialBodies.filter(b => b.type !== 'satellite' && b.type !== 'iss');
        const bodiesToShow = [...allSatellites, ...nonSatellites];

        bodiesToShow.forEach(body => {
            if (body.type === 'iss') return; // ISS has its own marker

            let size: number;
            let html: string;
            const color = body.color || '#A855F7';

            if (body.type === 'planet') {
                size = 20;
                html = `
          <div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;filter:drop-shadow(0 0 6px ${color}80);">
              ${body.icon || '🪐'}
            </div>
          </div>
        `;
            } else if (body.type === 'constellation') {
                size = 18;
                html = `
          <div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;filter:drop-shadow(0 0 4px rgba(226,232,240,0.5));">
              ⭐
            </div>
          </div>
        `;
            } else {
                size = 6;
                html = `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;box-shadow:0 0 ${size * 2}px ${color}80;cursor:pointer;"></div>`;
            }

            const icon = L.divIcon({
                className: 'zenith-marker',
                html,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });

            L.marker([body.lat, body.lng], { icon })
                .addTo(markersRef.current!)
                .on('click', () => setActiveTarget(body));
        });
    }, [celestialBodies, allSatellites, userLocation, setActiveTarget]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 transition-opacity duration-500 ${viewMode === 'radar' ? 'opacity-20' : 'opacity-100'}`}
            style={{ zIndex: 1 }}
        />
    );
}
