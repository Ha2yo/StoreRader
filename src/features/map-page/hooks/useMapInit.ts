/**
 * File: features/map-page/hooks/useMapInit.ts
 * Description:
 *   Leaflet 지도를 초기화하고, 저장된 사용자 위치로 이동시킨다
 */

import { useEffect } from "react";
import L from "leaflet";
import { loadSavedPosition } from "../../../utils/loadSavedPos";

export function useMapInit(
    mapRef: React.RefObject<HTMLDivElement | null>,
    leafletMap: React.MutableRefObject<L.Map | null>
) {
    useEffect(() => {
        // 중복 생성 방지
        if (!mapRef.current || leafletMap.current) return;

        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, });
        leafletMap.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const pos = loadSavedPosition();
        if (pos) map.setView([pos.lat, pos.lng], 16);
    }, []);
}