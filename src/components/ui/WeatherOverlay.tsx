import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

interface WeatherData {
    cloudCover: number; // percentage
    code: number;
}

export default function WeatherOverlay() {
    const { userLocation } = useAppStore();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userLocation) {
            setWeather(null);
            return;
        }

        let isMounted = true;
        const fetchWeather = async () => {
            setLoading(true);
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${userLocation.lat}&longitude=${userLocation.lng}&current=cloud_cover,weather_code`);
                const data = await res.json();
                if (isMounted && data.current) {
                    setWeather({
                        cloudCover: data.current.cloud_cover,
                        code: data.current.weather_code,
                    });
                }
            } catch (err) {
                console.warn("Failed to fetch weather", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchWeather();

        return () => { isMounted = false; };
    }, [userLocation]);

    if (!userLocation) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 right-4 sm:top-24 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 pointer-events-none"
            >
                <div className="glass shadow-lg rounded-full px-5 py-2 flex items-center justify-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-stardust/70 uppercase tracking-widest font-bold">Local Condition</span>
                        {loading ? (
                            <div className="h-4 w-24 bg-white/10 animate-pulse rounded mt-1" />
                        ) : (
                            weather ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xl text-starlight">{weather.cloudCover < 30 ? '☀️' : weather.cloudCover < 70 ? '⛅' : '☁️'}</span>
                                    <span className="font-mono text-sm">
                                        {weather.cloudCover}% Cloud Cover
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${weather.cloudCover < 30 ? 'bg-cosmic-cyan/20 text-cosmic-cyan' : weather.cloudCover < 70 ? 'bg-amber-400/20 text-amber-400' : 'bg-red-500/20 text-red-500'}`}>
                                        {weather.cloudCover < 30 ? 'Optimal' : weather.cloudCover < 70 ? 'Fair' : 'Poor'} Visibility
                                    </span>
                                </div>
                            ) : (
                                <span className="text-xs text-stardust font-mono">No data</span>
                            )
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
