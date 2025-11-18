import L from "leaflet";
import { loadSavedPosition } from "../../../utils/loadSavedPos";

export function recenterMap(leafletMap: React.MutableRefObject<L.Map | null>) {
    return () => {
        const pos = loadSavedPosition();
        if (!pos || !leafletMap.current) return;

        leafletMap.current.flyTo(
            [pos.lat, pos.lng],
            16,
            { animate: true, duration: 1.5 }
        );
    };
}
