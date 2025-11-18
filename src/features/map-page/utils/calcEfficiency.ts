// 추천 점수 계산 (낮을수록 효율적)
export function calcEfficiency(
    price: number,
    distance: number,
    maxPrice: number,
    maxDistance: number,
    w_price: number,
    w_distance: number
): number {
    const priceRatio = price / maxPrice;
    const distanceRatio = distance / maxDistance;

    return w_price * priceRatio + w_distance * distanceRatio;
}