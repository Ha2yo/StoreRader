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
}: Props) {
    const [scoredStores, setScoredStores] = useState<Store[]>([]);

    // 매장 및 가격 데이터 갱신
    // renderkey가 바뀔 때마다 실행
    useEffect(() => {

        if (!map) return;
        if (!(map as any)._loaded) return;

        (async () => {
            try {

                // 전체 매장 목록 조회
                const stores: Store[] = await fetchAllStores();

                const selectedRegion = localStorage.getItem("selectedRegionCode") || "020000000";
                const selectedDistance = localStorage.getItem("selectedDistance");
                const selectedGoodName = localStorage.getItem("selectedGoodName");
                const historyFlag = localStorage.getItem("historyFlag");
                const historyStoreId = localStorage.getItem("historyStoreId");

                const pos = loadSavedPosition(); // 사용자 위치

                let priceData: StorePrice[] = [];

                // 선택된 상품이 있다면 가격 데이터 획득
                if (selectedGoodName) {
                    priceData = await fetchPrices(selectedGoodName);
                }

                // 매장 필터링
                let filteredStores = stores;

                // 거리 필터가 있으면 거리 기준 우선 필터링
                if (selectedDistance) {
                    const maxDist = parseFloat(selectedDistance);

                    // 사용자 위치가 있을 때만 거리 판단
                    filteredStores = stores.filter(
                        (s) => calcDistance(pos.lat, pos.lng, s.x_coord!, s.y_coord!) <= maxDist
                    );

                    // 기존 원 제거 후 새 반경 원 추가
                    if (circleRef.current) map.removeLayer(circleRef.current);
                    circleRef.current = L.circle([pos.lat, pos.lng], {
                        radius: maxDist * 1000, // km → m
                        color: "#3388ff",
                        fillColor: "#3388ff",
                        fillOpacity: 0.15,
                        weight: 2,
                    }).addTo(map);
                    console.log(`${maxDist}km 이내 매장 수: ${filteredStores.length}`);
                }
                // 거리 필터가 없고, 지역 필터가 '전체'가 아니라면 지역 코드 필터
                else if (selectedRegion !== "020000000") {
                    if (circleRef.current) map.removeLayer(circleRef.current);
                    filteredStores = stores.filter((s) => s.area_code === selectedRegion);
                    console.log(`지역 코드 ${selectedRegion} 매장 수: ${filteredStores.length}`);
                }

                // 기존 마커들 전부 제거
                Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
                markersRef.current = {};


                // 사용자가 매장 히스토리를 클릭했을 경우
                if (historyFlag === "1" && historyStoreId) {
                    const target = stores.find((s) => s.store_id === historyStoreId);

                    if (target) {
                        // 기존 마커 초기화
                        Object.values(markersRef.current).forEach(m => map.removeLayer(m));
                        markersRef.current = {};

                        // 해당 매장을 빨간 마커로 찍기
                        const marker = L.marker([target.x_coord!, target.y_coord!], { icon: redIcon }).addTo(map);
                        markersRef.current[target.store_id] = marker;

                        // 상세 패널 열기
                        marker.on("click", () => setSelectedStore(target));

                        map.flyTo([target.x_coord!, target.y_coord!], 16, {
                            animate: true,
                            duration: 1.2,
                        });

                        // 히스토리 모드 한 번만 실행하도록 제거
                        localStorage.setItem("historyFlag", "0");
                        localStorage.removeItem("historyStoreId");
                        localStorage.removeItem("historyGoodId");
                        localStorage.removeItem("historyGoodName");

                        setSelectedStore(target);

                        return;
                    }
                }


                // 상품이 선택된 경우: 추천 시스템만 실행
                if (selectedGoodName && priceData.length > 0 && historyFlag == "0") {

                    // 가격 데이터가 있는 매장을 대상으로 한다
                    const validStores = filteredStores.filter((s) =>
                        priceData.some((p) => p.store_id === s.store_id)
                    );

                    if (validStores.length === 0) return;

                    // 정규화 기준값: max 가격 / 거리
                    const maxPrice = Math.max(...priceData.map((p) => p.price));
                    const distances = validStores.map((s) =>
                        calcDistance(pos.lat, pos.lng, s.x_coord!, s.y_coord!)
                    );
                    const maxDistance = distances.length > 0 ? Math.max(...distances) : 1;

                    // 각 매장에 대해 점수 계산
                    const scored = validStores.map((store) => {
                        const matched = priceData.find((p) => p.store_id === store.store_id); // ✅ priceData에서 매칭
                        const price = matched?.price ?? maxPrice;
                        const inspect_day = matched?.inspect_day ?? null;
                        const distance = calcDistance(pos.lat, pos.lng, store.x_coord!, store.y_coord!);
                        const score = calcEfficiency(price, distance, maxPrice, maxDistance, w_price, w_distance);
                        return { ...store, price, distance, inspect_day, score };
                    });
                    scored.sort((a, b) => a.score - b.score);

                    if (scored.length > 0) {
                        const top = scored[0];
                        map.flyTo([top.x_coord!, top.y_coord!], 16, {
                            animate: true,
                            duration: 1.5,
                        });
                    }

                    setScoredStores(scored);

                    // 점수가 낮은 순(효율 높은 순)으로 정렬
                    scored.sort((a, b) => a.score - b.score);

                    // 마커 생성
                    scored.forEach((store, idx) => {
                        // 순위별 아이콘
                        let icon = blackIcon;
                        if (idx === 0) icon = redIcon;        // 1위
                        else if (idx < 5) icon = orangeIcon;  // 2~5위

                        const marker = L.marker([store.x_coord!, store.y_coord!], { icon }).addTo(map);

                        // 가격 툴팁 (항상 표시)
                        marker.bindTooltip(
                            `₩${store.price.toLocaleString()}`,
                            {
                                permanent: true,
                                direction: "top",
                                offset: L.point(0, -40),
                                className: "price-tooltip",
                            }
                        ).openTooltip();

                        // 팝업 (상위 5개는 상세, 6등부터는 순위만)
                        if (idx < 5) {
                            if (idx === 0) {
                                marker.bindTooltip(`
                      <b>추천 매장 (${idx + 1}위)</b><br/>
                      ₩${store.price.toLocaleString()}<br/>
                      ${store.distance.toFixed(2)} km<br/>
                      효율 점수: ${store.score.toFixed(3)}`,
                                    {
                                        permanent: true,
                                        direction: "top",
                                        offset: L.point(0, -40),
                                        className: "price-tooltip top-store",
                                    }
                                ).openTooltip();

                            } else
                                marker.bindPopup(`
                    <b>추천 매장 (${idx + 1}위)</b><br/>
                    ₩${store.price.toLocaleString()}<br/>
                    ${store.distance.toFixed(2)} km<br/>
                    효율 점수: ${store.score.toFixed(3)}
                  `);
                        } else {
                            marker.bindPopup(`
                    <b>${idx + 1}위 추천 매장</b><br/>
                    ₩${store.price.toLocaleString()}<br/>`);
                        }
                        markersRef.current[store.store_id] = marker;

                        // 클릭 시 상세 패널 열기
                        marker.on("click", () => setSelectedStore(store));
                    });
                }
                // 일반 모드
                else {
                    filteredStores.forEach((store) => {

                        const marker = L.marker([store.x_coord!, store.y_coord!], { icon: blackIcon }).addTo(map);
                        // 클릭 시 상세 패널 열기
                        marker.on("click", () => setSelectedStore(store));
                        markersRef.current[store.store_id] = marker;

                    });
                }

            } catch (err) {
                console.error("매장 데이터 불러오기 실패:", err);
            }
        })();
    }, [renderKey]); // 지역 변경 시 재실행
    return scoredStores;
}