/**
 * File: features/map-page/hooks/useRegionDistanceEvent.ts
 * Description:
 *   지역(region) 또는 거리(distance) 필터가 변경될 때마다
 *   renderKey를 증가시켜 지도 데이터(추천/마커)를 다시 계산하도록 한다
 */
import { useEffect, useState } from "react";

export function useRegionDistanceEvent() {
    const [renderKey, setRenderKey] = useState(0);

    useEffect(() => {
        setRenderKey(0); // 초기 진입 시 반드시 1회 트리거
        setRenderKey(prev => prev + 1);

        const handleRegionChange = (e: any) => {
            console.log(" 지역 변경 감지됨:", e.detail);
            setRenderKey((prev) => prev + 1);
        };

        const handleDistanceChange = (e: any) => {
            console.log("거리 변경 감지됨:", e.detail);
            setRenderKey((prev) => prev + 1);
        };

        window.addEventListener("regionChange", handleRegionChange);
        window.addEventListener("distanceChange", handleDistanceChange);

        return () => {
            window.removeEventListener("regionChange", handleRegionChange);
            window.removeEventListener("distanceChange", handleDistanceChange);
        }
    }, []);

    return renderKey;
}