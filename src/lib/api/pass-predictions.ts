import * as satellite from 'satellite.js';
import * as SunCalc from 'suncalc';

export interface PassPrediction {
    riseTime: Date;
    peakTime: Date;
    setTime: Date;
    maxElevation: number;
}

export function predictPasses(
    satrec: satellite.SatRec,
    observerLat: number,
    observerLng: number,
    daysIntoFuture: number = 2
): PassPrediction[] {
    const passes: PassPrediction[] = [];
    const now = new Date();
    const observerGd = {
        longitude: satellite.degreesToRadians(observerLng),
        latitude: satellite.degreesToRadians(observerLat),
        height: 0
    };

    let isCurrentlyVisible = false;
    let currentPass: Partial<PassPrediction> = {};

    const stepSeconds = 60; // 1-minute steps
    const totalSteps = daysIntoFuture * 24 * 60 * 60 / stepSeconds;

    for (let i = 0; i < totalSteps; i++) {
        const time = new Date(now.getTime() + i * stepSeconds * 1000);
        const pv = satellite.propagate(satrec, time);

        if (!pv || !pv.position || typeof pv.position === 'boolean') continue;

        const gmst = satellite.gstime(time);
        const positionEcf = satellite.eciToEcf(pv.position, gmst);
        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

        const elevation = satellite.radiansToDegrees(lookAngles.elevation);

        // Only consider passing if elevation above horizon (> 10 deg to be clearly visible)
        if (elevation > 10) {
            // It's above horizon. Is the sky dark?
            const sunPosition = SunCalc.getPosition(time, observerLat, observerLng);
            const sunElevation = (sunPosition.altitude * 180) / Math.PI;

            // Ensure the sky is dark but satellite is illuminated (Sun < -6 for nautical twilight, elevation > 10)
            if (sunElevation < -6) {
                if (!isCurrentlyVisible) {
                    // Rise event
                    isCurrentlyVisible = true;
                    currentPass = { riseTime: time, maxElevation: elevation, peakTime: time };
                } else {
                    // Update peak
                    if (elevation > (currentPass.maxElevation || 0)) {
                        currentPass.maxElevation = elevation;
                        currentPass.peakTime = time;
                    }
                }
            }
        } else {
            if (isCurrentlyVisible) {
                // Set event
                isCurrentlyVisible = false;
                if (currentPass.riseTime && currentPass.peakTime) {
                    passes.push({
                        riseTime: currentPass.riseTime,
                        peakTime: currentPass.peakTime,
                        setTime: time,
                        maxElevation: currentPass.maxElevation as number
                    });
                }
                currentPass = {};

                // Return early if we got enough passes
                if (passes.length >= 3) break;
            }
        }
    }

    return passes;
}
