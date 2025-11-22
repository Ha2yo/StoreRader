import { useEffect } from "react";
import L from "leaflet";

export function useZoomScale(map: L.Map | null) {
    useEffect(() => {
        if (!map) return;

        const updateScale = () => {
            const zoom = map.getZoom();
            
            // 1. 마커 크기 조절 (기존 로직 유지)
            let scale = 0.5 + (zoom - 8) * 0.25;
            if (scale < 0.5) scale = 0.5;
            if (scale > 3.0) scale = 3.0;
            
            map.getContainer().style.setProperty('--marker-scale', scale.toFixed(3));

            // 2. 툴팁 숨기기 (CSS 클래스 대신 직접 숨김)
            // 'tooltipPane'은 모든 툴팁이 모여있는 투명한 판입니다.
            const tooltipPane = map.getPane('tooltipPane');
            
            if (tooltipPane) {
                if (zoom < 12) {
                    // 줌 12 미만이면 아예 안 보이게 설정
                    tooltipPane.style.display = 'none';
                } else {
                    // 다시 보이게 설정
                    tooltipPane.style.display = 'block';
                }
            }
        };

        // 초기 실행
        updateScale();

        // 줌 이벤트 등록
        map.on("zoom", updateScale);

        return () => {
            map.off("zoom", updateScale);
            
            // (안전 장치) 훅이 사라질 때 툴팁 판을 다시 복구해놓음
            const tooltipPane = map.getPane('tooltipPane');
            if (tooltipPane) tooltipPane.style.display = 'block';
        };

    }, [map]);
}