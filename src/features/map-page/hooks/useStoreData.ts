/**
 * File: features/map-page/hooks/useStoreData.ts
 * Description:
 *   매장 데이터와 가격 데이터를 조합하여
 *   필터(지역/거리/상품) 및 사용자 선호도에 맞는 추천 매장을 계산하고,
 *   지도 마커를 렌더링한다
 */
import { useEffect, useState } from "react";
import L from "leaflet";
import { Store } from "../types/Store.types";
import { StorePrice } from "../types/StorePrice.types";
import { loadSavedPosition } from "../../../utils/loadSavedPos";
import { calcDistance } from "../../../utils/calcDistance";
import { calcEfficiency } from "../utils/calcEfficiency";
import { redIcon, orangeIcon, blackIcon } from "../utils/markerIcon";
import { Props } from "../types/StoreDataProps";
import { fetchAllStores } from "../api/fetchAllStores";
import { fetchPrices } from "../api/fetchPrices";

export function useStoreData({
    map,
    markersRef,
    circleRef,
    renderKey,
    w_price,
    w_distance,
    setSelectedStore,
    isWeight,
}: Props) {
    const [scoredStores, setScoredStores] = useState<Store[]>([]);

    useEffect(() => {
        if (!isWeight) return;
        if (!map) return;
        if (!(map as any)._loaded) return;

        (async () => {
            try {
                const stores: Store[] = await fetchAllStores();

                const selectedRegion = localStorage.getItem("selectedRegionCode") || "020000000";
                const selectedDistance = localStorage.getItem("selectedDistance");
                let selectedGoodName =
                    localStorage.getItem("selectedGoodName") ||
                    localStorage.getItem("lastSearchTerm");

                const historyFlag = localStorage.getItem("historyFlag");
                const historyStoreId = localStorage.getItem("historyStoreId");

                if (!historyFlag)
                    localStorage.setItem("historyFlag", "0");

                const pos = loadSavedPosition();

                let priceData: StorePrice[] = [];

                if (selectedGoodName)
                    priceData = await fetchPrices(selectedGoodName);

                let filteredStores = stores;

                if (selectedDistance) {
                    const maxDist = parseFloat(selectedDistance);

                    filteredStores = stores.filter(
                        (s) => calcDistance(pos.lat, pos.lng, s.x_coord!, s.y_coord!) <= maxDist
                    );

                    if (circleRef.current) map.removeLayer(circleRef.current);
                    circleRef.current = L.circle([pos.lat, pos.lng], {
                        radius: maxDist * 1000,
                        color: "#3388ff",
                        fillColor: "#3388ff",
                        fillOpacity: 0.15,
                        weight: 2,
                    }).addTo(map);
                    console.log(`${maxDist}km 이내 매장 수: ${filteredStores.length}`);
                }
                else if (selectedRegion !== "020000000") {
                    // 전체 지역이 아닐 때만 지역 필터 사용
                    if (circleRef.current) map.removeLayer(circleRef.current);
                    filteredStores = stores.filter((s) => s.area_code === selectedRegion);
                    console.log(`지역 코드 ${selectedRegion} 매장 수: ${filteredStores.length}`);
                } else {
                    if (circleRef.current) {
                        map.removeLayer(circleRef.current);
                        circleRef.current = null;
                    }
                }

                // 기존 마커 전체 제거
                Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
                markersRef.current = {};

                // 사용자 히스토리 우선 표시
                if (historyFlag == "1" && historyStoreId) {
                    const target = stores.find((s) => s.store_id === historyStoreId);

                    if (target) {
                        Object.values(markersRef.current).forEach(m => map.removeLayer(m));
                        markersRef.current = {};

                        const marker = L.marker(
                            [target.x_coord!, target.y_coord!],
                            { icon: redIcon }
                        ).addTo(map);

                        markersRef.current[target.store_id] = marker;

                        marker.on("click", () => setSelectedStore(target));

                        map.flyTo([target.x_coord!, target.y_coord!], 16, {
                            animate: true,
                            duration: 1.2,
                        });

                        localStorage.setItem("historyFlag", "0");
                        localStorage.removeItem("historyStoreId");
                        localStorage.removeItem("historyGoodId");
                        localStorage.removeItem("historyGoodName");

                        setSelectedStore(target);
                        return;
                    }
                }

                // 추천 시스템 실행
                if (selectedGoodName && priceData.length > 0 && historyFlag == "0") {
                    const validStores = filteredStores.filter((s) =>
                        priceData.some((p) => p.store_id === s.store_id)
                    );

                    if (validStores.length === 0) return;

                    const maxPrice = Math.max(...priceData.map((p) => p.price));
                    const distances = validStores.map((s) =>
                        calcDistance(pos.lat, pos.lng, s.x_coord!, s.y_coord!)
                    );
                    const maxDistance = distances.length > 0 ? Math.max(...distances) : 1;

                    // 사용자 선호도 기반 가격/거리 효율 점수 계산
                    const scored = validStores.map((store) => {
                        const matched = priceData.find((p) => p.store_id === store.store_id);
                        const price = matched?.price ?? maxPrice;
                        const distance = calcDistance(pos.lat, pos.lng, store.x_coord!, store.y_coord!);
                        const inspect_day = matched?.inspect_day ?? null;

                        const score = calcEfficiency(
                            price, distance, maxPrice, maxDistance, w_price, w_distance
                        );

                        return { ...store, price, distance, inspect_day, score };
                    });

                    scored.sort((a, b) => b.score - a.score);
                    setScoredStores(scored);

                    // 최적 매장 자동 포커싱
                    if (scored.length > 0) {
                        const top = scored[0];
                        map.flyTo([top.x_coord!, top.y_coord!], 16, {
                            animate: true,
                            duration: 1.5,
                        });
                    }

                    scored.sort((a, b) => b.score - a.score);

                    scored.forEach((store, idx) => {
                        let icon = blackIcon;
                        if (idx === 0) icon = redIcon;
                        else if (idx < 5) icon = orangeIcon;

                        const marker = L.marker([store.x_coord!, store.y_coord!], { icon }).addTo(map);

                        marker.bindTooltip(
                            `₩${store.price.toLocaleString()}`,
                            {
                                permanent: true,
                                direction: "top",
                                offset: L.point(0, -30),
                                className: "price-tooltip",
                            }
                        ).openTooltip();

                        if (idx === 0) {
                            marker.bindTooltip(`
                                <b>추천 매장 (${idx + 1}위)</b><br/>
                                ₩${store.price.toLocaleString()}<br/>
                                ${store.distance.toFixed(2)} km<br/>
                                효율 점수: ${store.score.toFixed(2)}`,
                                {
                                    permanent: true,
                                    direction: "top",
                                    offset: L.point(0, -30),
                                }
                            ).openTooltip();

                        } else
                            marker.bindPopup(`
                                <b>추천 매장 (${idx + 1}위)</b><br/>
                                ₩${store.price.toLocaleString()}<br/>
                                ${store.distance.toFixed(2)} km<br/>
                                효율 점수: ${store.score.toFixed(2)}`,
                                {
                                    offset: L.point(0, -15),
                                }

                            );
                        markersRef.current[store.store_id] = marker;
                        marker.on("click", () => setSelectedStore(store));
                    });
                }
                // 기본 모드
                else {
                    filteredStores.forEach((store) => {

                        const marker = L.marker([store.x_coord!, store.y_coord!], { icon: blackIcon }).addTo(map);
                        marker.on("click", () => setSelectedStore(store));
                        markersRef.current[store.store_id] = marker;

                    });
                }
            } catch (err) {
                console.error("매장 데이터 불러오기 실패:", err);
            }
        })();
    }, [renderKey, isWeight]);
    return scoredStores;
}