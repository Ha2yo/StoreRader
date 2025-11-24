/**
 * File: features/map-page/hooks/useZoomScale.ts
 * Description:
 *   Leaflet 지도 줌 레벨에 따라
 *   1) 커스텀 마커 크기를 동적으로 조절하고
 *   2) 줌 수준이 낮을 때 툴팁을 자동으로 숨긴다.
 */
import { useEffect } from "react";
import L from "leaflet";

export function useZoomScale(map: L.Map | null) {
    useEffect(() => {
        if (!map) return;

        const updateScale = () => {
            const zoom = map.getZoom();

            // 마커 크기 조절 (줌레벨 기반)
            let scale = 0.5 + (zoom - 8) * 0.25;
            if (scale < 0.5) scale = 0.5;
            if (scale > 3.0) scale = 3.0;

            map.getContainer().style.setProperty('--marker-scale', scale.toFixed(3));

            // 툴팁 숨기기
            const tooltipPane = map.getPane('tooltipPane');

            if (tooltipPane) {
                if (zoom < 12) {
                    tooltipPane.style.display = 'none';
                } else {
                    tooltipPane.style.display = 'block';
                }
            }
        };

        updateScale();

        map.on("zoom", updateScale);

        return () => {
            map.off("zoom", updateScale);
        };
    }, [map]);
}