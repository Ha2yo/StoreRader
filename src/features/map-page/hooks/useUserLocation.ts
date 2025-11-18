import { useEffect } from "react";
import L from "leaflet";
import { loadSavedPosition } from "../../../utils/loadSavedPos";
import { blueIcon } from "../utils/markerIcon";

export function useUserLocation(
    leafletMap: React.MutableRefObject<L.Map | null>,
    markerRef: React.MutableRefObject<L.Marker | null>) {
    // 사용자 위치 마커 갱신
    useEffect(() => {
        const map = leafletMap.current!;
        const refreshMarker = () => {
            const pos = loadSavedPosition();
            if (!pos) return;

            // 기존 마커 제거 후 새로 표시
            if (markerRef.current) map.removeLayer(markerRef.current);
            markerRef.current = L.marker([pos.lat, pos.lng], { icon: blueIcon }).addTo(map);
        };

        // 즉시 1회 실행 + 5초마다 반복
        refreshMarker();
        const id = setInterval(refreshMarker, 5000);
        return () => clearInterval(id);
    }, []);
}