/**
 * File: utils/calcDistance.ts
 * Description:
 *   두 지점의 위도·경도 좌표를 이용해
 *   하버사인(Haversine) 공식을 통해 실제 직선 거리(km)를 계산한다
 */

export function calcDistance(
    slat: number, slng: number, dlat: number, dlng: number) {
    const radius = 6371; // 지구 반경 (km)
    const toRadian = Math.PI / 180;

    const deltaLat = Math.abs(slat - dlat) * toRadian;
    const deltaLng = Math.abs(slng - dlng) * toRadian;

    const sinDeltaLat = Math.sin(deltaLat / 2);
    const sinDeltaLng = Math.sin(deltaLng / 2);
    const squareRoot = Math.sqrt(
        sinDeltaLat * sinDeltaLat +
        Math.cos(slat * toRadian) * Math.cos(dlat * toRadian) * sinDeltaLng * sinDeltaLng);

    const distance = 2 * radius * Math.asin(squareRoot);

    return distance;
}