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
}

// StorePrice: 특정 상품의 매장별 가격 정보 구조체
interface StorePrice {
  store_id: string;
  price: number;
  inspect_day: string;
}

function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  function loadSavedPosition() {
    const saved = localStorage.getItem("lastPosition");
    if (!saved) return null;

    const pos = JSON.parse(saved);
    return pos; // { lat, lng, accuracy }
  }


  // 마커 아이콘 정의
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

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: false });
    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // 앱 시작 시: 저장된 위치 우선 사용
    const pos = loadSavedPosition();
    map.setView([pos.lat, pos.lng], 16);

    // 이후 매장 데이터 불러오기
    (async () => {
      try {
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
        const res = await fetch(`${apiURL}/getStoreInfo/all`);
        const stores: Store[] = await res.json();

        stores.forEach((store) => {
          if (store.x_coord && store.y_coord) {
            const marker = L.marker([store.x_coord, store.y_coord], { icon: blackIcon }).addTo(map);
            marker.on("click", () => setSelectedStore(store));
            markersRef.current[store.store_id] = marker;
          }
        });

        // 검색 상품 표시
        const selectedGoodName = localStorage.getItem("selectedGoodName");
        if (selectedGoodName) {
          const priceRes = await fetch(`${apiURL}/getPriceInfo?good_name=${selectedGoodName}`);
          const priceData: StorePrice[] = await priceRes.json();
          Object.values(markersRef.current).forEach((m) => m.setIcon(blackIcon));

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
  }, []);

  // 유저 마커
  useEffect(() => {
  const map = leafletMap.current!;

  function refreshMarker() {
    const pos = loadSavedPosition();
    if (!pos) return;

    // 이전 마커/원 제거
    if (markerRef.current) map.removeLayer(markerRef.current);
    if (circleRef.current) map.removeLayer(circleRef.current);

    // 새 마커와 원 추가
    markerRef.current = L.marker([pos.lat, pos.lng], { icon: blueIcon }).addTo(map);
    circleRef.current = L.circle([pos.lat, pos.lng], { radius: pos.accuracy }).addTo(map);
  }

  // 최초 1회 즉시 실행
  refreshMarker();

  // 5초마다 반복 갱신
  const intervalId = setInterval(refreshMarker, 5000);

  return () => clearInterval(intervalId);
}, []);

  // 버튼 클릭 시 내 위치로 이동
  function handleRecenter() {
    const pos = loadSavedPosition();
    const map = leafletMap.current!;
    map.flyTo([pos.lat, pos.lng], 16, {
      animate: true,
      duration: 1.5,
    });
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={mapRef} id="map" style={{ width: "100%", height: "100%" }} />

      <button
        onClick={handleRecenter}
        style={{
          position: "absolute",
          bottom: "120px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "#ffffff",
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

      {selectedStore && (
        <StoreDetailPanel store={selectedStore} onClose={() => setSelectedStore(null)} />
      )}
    </div>
  );
}

export default Map;
