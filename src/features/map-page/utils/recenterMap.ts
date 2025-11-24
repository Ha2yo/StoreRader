/**
 * File: features/map-page/utils/recenterMap.ts
 * Description:
 *   저장된 사용자 위치로 지도를 이동시킨다
 */

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
