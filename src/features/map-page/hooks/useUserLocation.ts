import { useEffect } from "react";
import L from "leaflet";
import { loadSavedPosition } from "../../../utils/loadSavedPos";
import { userIcon } from "../utils/userIcon";

export function useUserLocation(
    leafletMap: React.MutableRefObject<L.Map | null>,
    markerRef: React.MutableRefObject<L.Layer | null>
) {
    useEffect(() => {
        const map = leafletMap.current!;
        if (!map) return;

        const refreshMarker = () => {
            const pos = loadSavedPosition();
            if (!pos) return;

            // 기존 마커 제거
            if (markerRef.current) map.removeLayer(markerRef.current);

            markerRef.current = L.marker([pos.lat, pos.lng], {
                icon: userIcon,
                zIndexOffset: 9999,
            }).addTo(map);
        };

        // 즉시 1회 실행 + 반복
        refreshMarker();
        const id = setInterval(refreshMarker, 5000);

        return () => clearInterval(id);
    }, []);
}
