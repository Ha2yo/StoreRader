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

function Map() {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
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
                    bottom: "120px",
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
                    fontSize: "22px",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
                title="내 위치로 이동"
            >
                🧭
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