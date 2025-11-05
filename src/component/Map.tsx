import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { invoke } from "@tauri-apps/api/core";
import StoreDetailPanel from "./StoreDetailPanel";

// Store: 매장 기본 정보 구조체
interface Store {
  id: number;
  store_id: string;
  store_name: string;
  tel_no: string | null;
  post_no: string | null;
  jibun_addr: string;
  road_addr: string;
  x_coord: number | null;
  y_coord: number | null;
  area_code: string;
  area_detail_code: string;
  price?: number | null;
  inspect_day?: string | null;
}

// StorePrice: 특정 상품의 매장별 가격 정보 구조체
interface StorePrice {
  store_id: string;
  price: number;
  inspect_day: string;
}

function Map() {
  const mapRef = useRef<HTMLDivElement>(null); // 지도 DOM 참조
  const leafletMap = useRef<L.Map | null>(null); // Leaflet Map 인스턴스
  const markerRef = useRef<L.Marker | null>(null); // 사용자 위치 마커
  const circleRef = useRef<L.Circle | null>(null); // 거리 반경 표시용 원
  const markersRef = useRef<Record<string, L.Marker>>({}); // 매장 카서 캐시
  const [selectedStore, setSelectedStore] = useState<Store | null>(null); // 선택된 매장 상태
  const [renderKey, setRenderKey] = useState(0); // 지도 리렌더링 트리거

  // 사용자 위치 불러오기
  function loadSavedPosition() {
    const saved = localStorage.getItem("lastPosition");
    if (!saved) return null;

    const pos = JSON.parse(saved);
    return pos; // { lat, lng, accuracy }
  }

  // 사용자와 매장 간 거리 구하기 (하버사인 공식 활용)
  function getDistance(
    slat: number, slng: number, dlat: number, dlng: number) {
    const radius = 6371;
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

  // 지역 / 거리 변경 이벤트 감지
  useEffect(() => {
    const handleRegionChange = (e: any) => {
      console.log(" 지역 변경 감지됨:", e.detail);
      setRenderKey((prev) => prev + 1);
    };

    const handleDistanceChange = (e: any) => {
      console.log("거리 변경 감지됨:", e.detail);
      setRenderKey((prev) => prev + 1);
    };

    window.addEventListener("regionChange", handleRegionChange);
    window.addEventListener("distanceChange", handleDistanceChange);

    return () => {
      window.removeEventListener("regionChange", handleRegionChange);
      window.removeEventListener("distanceChange", handleDistanceChange);
    }
  }, []);

  // 마커 아이콘 정의 (파랑:사용자, 검정:기본 매장, 빨강:선택된 상품 판매 매장)
  const blueIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const redIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const blackIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png",
    shadowUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // 지도 초기화 (최초 1회)
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: false });
    leafletMap.current = map;

    // 타일 레이어 추가
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // 저장된 사용자 위치로 이동
    const pos = loadSavedPosition();
    if (pos) map.setView([pos.lat, pos.lng], 16);
  }, []);

  // 매장 및 가격 데이터 갱신
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    (async () => {
      try {
        // 서버 주소 가져오기
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

        // 전체 매장 목록 불러오기
        const res = await fetch(`${apiURL}/getStoreInfo/all`);
        const stores: Store[] = await res.json();

        const selectedRegion = localStorage.getItem("selectedRegionCode") || "020000000";
        const selectedDistance = localStorage.getItem("selectedDistance");
        const pos = loadSavedPosition();

        let priceData: StorePrice[] = [];
        let selectedGoodName = localStorage.getItem("selectedGoodName");
        
        // 선택된 상품이 있을 경우, 가격 정보 불러오기
        if (selectedGoodName) {
          const priceRes = await fetch(`${apiURL}/getPriceInfo?good_name=${selectedGoodName}`);
          priceData = await priceRes.json();
          console.log("불러온 가격 데이터:", priceData.length, "개");
        }

        let filteredStores = stores;

        // 거리 필터
        if (selectedDistance && pos) {
          const maxDist = parseFloat(selectedDistance);

          // 거리 내 매장만 필터링
          filteredStores = stores.filter(
            (s) =>
              s.x_coord &&
              s.y_coord &&
              getDistance(pos.lat, pos.lng, s.x_coord, s.y_coord) <= maxDist
          );
          
          // 기존 원 제거 후 새로 생성
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
        // 지역 필터
        else if (selectedRegion !== "020000000") {
          if (circleRef.current) map.removeLayer(circleRef.current);
          filteredStores = stores.filter((s) => s.area_code === selectedRegion);
          console.log(`지역 코드 ${selectedRegion} 매장 수: ${filteredStores.length}`);
        }

        // 기존 마커 제거
        Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
        markersRef.current = {};

        // 새 매장 마커 추가
        filteredStores.forEach((store) => {
          if (store.x_coord && store.y_coord) {
            const match = priceData.find((p) => p.store_id === store.store_id);

            const marker = L.marker([store.x_coord, store.y_coord], { icon: blackIcon }).addTo(map);

            // 클릭 시 매장 상세 패널 표시
            marker.on("click", () =>
              setSelectedStore({
                ...store,
                price: match ? match.price : null,
                inspect_day: match ? match.inspect_day : null,
              })
            );

            markersRef.current[store.store_id] = marker;
          }
        });

        // 매장 마커 강조 (사용자가 입력한 물품이 있을 경우)
        if (selectedGoodName) {
          const priceRes = await fetch(`${apiURL}/getPriceInfo?good_name=${selectedGoodName}`);
          const priceData: StorePrice[] = await priceRes.json();

          // 모든 마커를 기본색(검정)으로 초기화
          Object.values(markersRef.current).forEach((m) => m.setIcon(blackIcon));
          
          // 해당 상품 판매 매장은 빨간색으로 표시 + 가격 툴팁 표시
          priceData.forEach((p) => {
            const marker = markersRef.current[p.store_id];
            if (marker) {
              marker.setIcon(redIcon);
              marker.bindTooltip(`₩${p.price.toLocaleString()}`, {
                permanent: true,
                direction: "top",
                offset: L.point(0, -10),
                className: "price-tooltip",
              }).openTooltip();
            }
          });
        }
      } catch (err) {
        console.error("매장 데이터 불러오기 실패:", err);
      }
    })();
  }, [renderKey]); // 지역 변경 시 재실행

  // 사용자 위치 마커 갱신
  useEffect(() => {
    const map = leafletMap.current!;
    const refreshMarker = () => {
      const pos = loadSavedPosition();
      if (!pos) return;

      // 기존 마커 제거 후 새로 표시
      if (markerRef.current) map.removeLayer(markerRef.current);
      markerRef.current = L.marker([pos.lat, pos.lng], { icon: blueIcon }).addTo(map);
    };

    // 즉시 1회 실행 + 5초마다 반복
    refreshMarker();
    const id = setInterval(refreshMarker, 5000);
    return () => clearInterval(id);
  }, []);

  // "내 위치로 이동" 버튼
  const handleRecenter = () => {
    const pos = loadSavedPosition();
    if (!pos || !leafletMap.current) return;
    leafletMap.current.flyTo([pos.lat, pos.lng], 16, { animate: true, duration: 1.5 });
  };

  // 렌더링
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* 지도 표시 영역 */}
      <div ref={mapRef} id="map" style={{ width: "100%", height: "100%" }} />

      {/* 내 위치 이동 버튼 */}
      <button
        onClick={handleRecenter}
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
        <StoreDetailPanel store={selectedStore} onClose={() => setSelectedStore(null)} />
      )}
    </div>
  );
}

export default Map;