import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { updateRiderLocation } from "@/services/riderService";

interface LocationCoords {
    latitude: number;
    longitude: number;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationCoords | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const requestPermission = async (): Promise<boolean> => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setError("Location permission denied");
            return false;
        }
        return true;
    };

    const getCurrentLocation = async (): Promise<LocationCoords | null> => {
        try {
            const granted = await requestPermission();
            if (!granted) return null;
            const result = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: result.coords.latitude,
                longitude: result.coords.longitude,
            };
            setLocation(coords);
            return coords;
        } catch {
            setError("Failed to get location");
            return null;
        }
    };

    const startTracking = async () => {
        const granted = await requestPermission();
        if (!granted) return;
        setIsTracking(true);
        intervalRef.current = setInterval(async () => {
            const coords = await getCurrentLocation();
            if (coords) {
                try {
                    await updateRiderLocation(coords.latitude, coords.longitude);
                } catch {
                    // fail silently
                }
            }
        }, 10000); // update every 10 seconds
    };

    const stopTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsTracking(false);
    };

    useEffect(() => {
        return () => stopTracking();
    }, []);

    return {
        location,
        isTracking,
        error,
        startTracking,
        stopTracking,
        getCurrentLocation,
    };
};