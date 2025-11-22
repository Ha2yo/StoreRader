import { useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StoreDetailPanel from "../../StoreDetailPanel/components/StoreDetailPanel";
import { usePreference } from "../../../contexts/PreferenceContext";
import { Store } from "../types/Store.types";
import { useMapInit } from "../hooks/useMapInit";
import { useRegionDistanceEvent } from "../hooks/useRegionDistanceEvent";
import { useStoreData } from "../hooks/useStoreData";
import { useUserLocation } from "../hooks/useUserLocation";
import { recenterMap } from "../utils/recenterMap";
import { useZoomScale } from "../hooks/useZoomScale";

function Map() {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Layer | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const markersRef = useRef<Record<string, L.Marker>>({});

    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const { preference } = usePreference();
    const w_price = preference.w_price;
    const w_distance = preference.w_distance;

    const selectedGoodId = localStorage.getItem("selectedGoodId");

    // 1) 지역/거리 변경 이벤트 → renderKey 증가
    const renderKey = useRegionDistanceEvent();

    // 2) 지도 초기화
    useMapInit(mapRef, leafletMap);

    // 3) 매장 데이터 처리 (추천, 마커 생성 등)
    const scoredStores = useStoreData({
        map: leafletMap.current,
        markersRef,
        circleRef,
        renderKey,
        w_price,
        w_distance,
        setSelectedStore,
    });

    useZoomScale(leafletMap.current);

    // 4) 사용자 위치 마커 갱신
    useUserLocation(leafletMap, markerRef);

    // 렌더링
    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            {/* 지도 표시 영역 */}
            <div ref={mapRef} id="map" style={{ width: "100%", height: "100%" }} />

            {/* 내 위치 이동 버튼 */}
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
                    {/* 바깥 원 */}
                    <circle cx="12" cy="12" r="8" />

                    {/* 중앙 점 */}
                    <circle cx="12" cy="12" r="3" fill="#007AFF" />

                    {/* 십자 가이드*/}
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