import { Store } from "../types/StoreDetail.types";

export function determinePreferenceType(selected: Store, candidates: Store[]) {
        if (!candidates || candidates.length === 0) return "neutral";
        if (!selected.price || !selected.distance) return "neutral";

        // 후보 평균 계산
        const avgPrice = candidates.reduce((sum, s) => sum + (s.price ?? 0), 0) / candidates.length;
        const avgDist = candidates.reduce((sum, s) => sum + (s.distance ?? 0), 0) / candidates.length;

        // 상대 비율 차이 계산
        const priceFocus = (avgPrice - selected.price) / avgPrice;      // 양수면 평균보다 저렴 → 가격 중심
        const distanceFocus = (avgDist - selected.distance) / avgDist;  // 양수면 평균보다 가까움 → 거리 중심

        // 판단 기준 (10% 이상 차이 시 의미 있는 차이로 간주)
        const threshold = 0.1;
        const tolerance = 0.05; // 보조 구간

        if (priceFocus > threshold && distanceFocus < tolerance) {
            return "price"; // 가격 중심
        } else if (distanceFocus > threshold && priceFocus < tolerance) {
            return "distance"; // 거리 중심
        } else {
            return "neutral"; // 중립적 선택
        }
    }