/**
 * File: features/map-page/components/Map.tsx
 * Description:
 *   Leaflet 지도를 기반으로 사용자 위치, 매장 정보, 추천 매장 등을
 *   시각적으로 표시하는 메인 지도 화면
 */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StoreDetailPanel from "../../store-detail-panel/components/StoreDetailPanel";
import { Store } from "../types/Store.types";
import { useMapInit } from "../hooks/useMapInit";
import { useRegionDistanceEvent } from "../hooks/useRegionDistanceEvent";
import { useStoreData } from "../hooks/useStoreData";
import { useUserLocation } from "../hooks/useUserLocation";
import { recenterMap } from "../utils/recenterMap";
import { useZoomScale } from "../hooks/useZoomScale";
import { usePreference } from "../../preference/hooks/usepreference";

function Map() {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Layer | null>(null);             // 사용자 위치 아이콘
    const circleRef = useRef<L.Circle | null>(null);            // 사용자 주변 탐색 반경
    const markersRef = useRef<Record<string, L.Marker>>({});    // 매장 마커 목록

    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const selectedGoodId = localStorage.getItem("selectedGoodId");

    // 지역/거리 변경 발생 시 강제 렌더링 트리거
    const renderKey = useRegionDistanceEvent();

    // 지도 초기화
    useMapInit(mapRef, leafletMap);

    // 사용자 선호도 로딩
    const { preference, refreshPreference } = usePreference();
    const [isWeight, setReady] = useState(false);
    useEffect(() => {
        (async () => {
            await refreshPreference();
            setReady(true);
        })();
    }, []);

    const w_price = preference.w_price;
    const w_distance = preference.w_distance;
    console.log("선호도:", w_price, w_distance);

    // 매장 데이터 처리 + 점수 계산 + 마커 생성
    const scoredStores = useStoreData({
        map: leafletMap.current,
        markersRef,
        circleRef,
        renderKey,
        w_price,
        w_distance,
        setSelectedStore,
        isWeight,
    });

    // 줌 레벨에 따른 마커 크기 조절
    useZoomScale(leafletMap.current);

    // 사용자 현재 위치 아이콘 갱신
    useUserLocation(leafletMap, markerRef);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            {/* 지도 표시 영역 */}
            <div ref={mapRef} id="map" style={{ width: "100%", height: "100%" }} />

            {/* 현재 위치로 이동 버튼 */}
            <button
                onClick={recenterMap(leafletMap)}
                style={{
                    position: "absolute",
                    bottom: "160px",
                    right: "20px",
                    zIndex: 1000,
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
                title="내 위치로 이동"
            >
                <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: "scale(2.8)" }}
                >
                    <path d="M12 3v2M12 19v2M5 12H3M21 12h-2" />
                    <circle cx="12" cy="12" r="8" />
                    <circle cx="12" cy="12" r="3" fill="#007AFF" />

                    <line x1="12" y1="2" x2="12" y2="5" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" />
                    <line x1="19" y1="12" x2="22" y2="12" />
                </svg>
            </button>

            {/* 매장 상세 정보 패널 */}
            {selectedStore && (
                <StoreDetailPanel
                    store={selectedStore}
                    goodId={selectedGoodId}
                    candidates={scoredStores}
                    onClose={() => setSelectedStore(null)} />
            )}
        </div>
    );
}

export default Map;