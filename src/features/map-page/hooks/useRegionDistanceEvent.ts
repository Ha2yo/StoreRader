import { useEffect, useState } from "react";

export function useRegionDistanceEvent() {
    const [renderKey, setRenderKey] = useState(0);

    // 매장 필터 이벤트 수신 -> renderKey 증가
    useEffect(() => {
        setRenderKey(0);
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