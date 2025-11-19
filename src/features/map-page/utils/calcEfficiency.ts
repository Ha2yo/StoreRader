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

    const priceEff = 1 - priceRatio;
    const distanceEff = 1 - distanceRatio;

    const efficiency = w_price * priceEff + w_distance * distanceEff;

    const score = efficiency * 100;
    
    return score
}