/**
 * File: features/store-detail-panel/utils/determinePreferenceType.ts
 * Description:
 *   사용자가 선택한 매장이 다른 후보 대비 가격/거리 기준에서
 *   어떤 성향(price / distance / neutral)을 보였는지 계산한다
 */
import { Store } from "../types/StoreDetail.types";

export function determinePreferenceType(
    selected: Store,
    candidates: Store[],
    threshold: number) {
    if (!candidates || candidates.length === 0) return "neutral";
    if (!selected.price || !selected.distance) return "neutral";

    const avgPrice = candidates.reduce((sum, s) => sum + (s.price ?? 0), 0) / candidates.length;
    const avgDist = candidates.reduce((sum, s) => sum + (s.distance ?? 0), 0) / candidates.length;

    const priceFocus = (avgPrice - selected.price) / avgPrice;      // 양수: 평균보다 저렴
    const distanceFocus = (avgDist - selected.distance) / avgDist;  // 양수: 평균보다 가까움

    const priceLike = priceFocus > threshold;
    const distLike = distanceFocus > threshold;

    if (priceLike && !distLike) return "price";
    if (!priceLike && distLike) return "distance";

    // 둘 다 만족 or 둘 다 미묘할 때
    return "neutral";
}
