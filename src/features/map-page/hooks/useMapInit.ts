import { useEffect } from "react";
import L from "leaflet";
import { loadSavedPosition } from "../../../utils/loadSavedPos";

export function useMapInit(
    mapRef: React.RefObject<HTMLDivElement | null>,
    leafletMap: React.MutableRefObject<L.Map | null>
) {
    // 지도 초기화 (최초 1회)
    useEffect(() => {
        if (!mapRef.current || leafletMap.current) return;

        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, });
        leafletMap.current = map;

        // 타일 레이어 추가
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // 저장된 사용자 위치로 이동
        const pos = loadSavedPosition();
        if (pos) map.setView([pos.lat, pos.lng], 16);
    }, []);
}