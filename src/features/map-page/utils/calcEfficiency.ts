/**
 * File: features/map-page/utils/calcEfficiency.ts
 * Description:
 *   가격과 거리의 정규화된 효율값을 사용자 가중치(w_price, w_distance)에 따라
 *   하나의 점수(0~100)로 환산한다
 */
export function calcEfficiency(
    price: number,
    distance: number,
    maxPrice: number,
    maxDistance: number,
    w_price: number,
    w_distance: number
): number {
    // 각 항목을 0~1 사이로 정규화
    const priceRatio = price / maxPrice;
    const distanceRatio = distance / maxDistance;
    console.log("선호도:", w_price, w_distance);

    // 값이 낮을수록 효율이 높으므로 반전 (1-ratio)
    const priceEff = 1 - priceRatio;
    const distanceEff = 1 - distanceRatio;

    // 사용자 선호도(가중치)에 따라 점수 계산
    const efficiency = w_price * priceEff + w_distance * distanceEff;

    // 점수 범위를 0~100으로 확장
    return efficiency * 100;
}
