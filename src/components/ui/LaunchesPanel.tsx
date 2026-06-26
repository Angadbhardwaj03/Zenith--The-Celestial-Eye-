import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Launch {
    id: string;
    name: string;
    status: { name: string; description: string };
    net: string; // Next expected time (ISO string)
    provider: string;
    location: string;
    pad: string;
}

export default function LaunchesPanel() {
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchLaunches = async () => {
            try {
                // Fetch from LL2 dev api (rate limited but free, 15/hr)
                const res = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=3');
                if (!res.ok) throw new Error('API Error');
                const data = await res.json();

                if (isMounted && data.results) {
                    const parsed = data.results.map((l: any) => ({
                        id: l.id,
                        name: l.name,
                        status: l.status,
                        net: l.net,
                        provider: l.launch_service_provider?.name || 'Unknown',
                        location: l.pad?.location?.name || 'Unknown Location',
                        pad: l.pad?.name || 'Unknown Pad'
                    }));
                    setLaunches(parsed);
                }
            } catch (e) {
                console.warn("Failed to fetch upcoming launches", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchLaunches();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="fixed top-20 left-4 sm:top-24 sm:left-5 z-40 flex flex-col gap-3 pointer-events-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="glass rounded-full px-4 py-2 w-max text-xs uppercase tracking-widest text-starlight font-bold flex items-center gap-2 hover:bg-white/5 transition-colors shadow-lg shadow-black/50"
            >
                <span>🚀 Upcoming Launches</span>
                <span className="text-black bg-starlight rounded-full w-4 h-4 flex flex-col items-center justify-center font-mono text-[10px]">{launches.length}</span>
            </button>

            <AnimatePresence>
                {isOpen && !loading && launches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="flex flex-col gap-3 w-[280px] sm:w-80 max-h-[60vh] sm:max-h-none overflow-y-auto"
                    >
                        {launches.map((launch) => {
                            const netDate = new Date(launch.net);
                            const isImminent = netDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;
                            return (
                                <div key={launch.id} className="glass rounded-xl p-4 relative overflow-hidden group">
                                    {/* Subtle highlight if launch is within 24 hours */}
                                    {isImminent && <div className="absolute inset-0 bg-cosmic-pink/5 pointer-events-none" />}

                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] text-cosmic-cyan uppercase font-bold tracking-wider truncate max-w-[70%]">
                                            {launch.provider}
                                        </span>
                                        <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${isImminent ? 'bg-cosmic-pink/20 text-cosmic-pink' : 'bg-stardust/20 text-stardust'}`}>
                                            {isImminent ? 'Imminent' : 'Scheduled'}
                                        </span>
                                    </div>

                                    <h4 className="text-sm text-starlight font-medium leading-snug mb-3">
                                        {launch.name.split('|').map((part, i) => (
                                            <span key={i} className={i === 1 ? 'block text-xs text-stardust mt-1' : ''}>{part}</span>
                                        ))}
                                    </h4>

                                    <div className="flex flex-col gap-1.5 mt-auto border-t border-white/5 pt-3">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-stardust/60">T-0</span>
                                            <span className={isImminent ? 'text-cosmic-pink' : 'text-starlight'}>
                                                {netDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-stardust/60">Loc</span>
                                            <span className="text-starlight truncate max-w-[65%] text-right">{launch.location}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
