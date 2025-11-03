import { useContext, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocationContext } from "../contexts/LocationContext";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

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
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const navigate = useNavigate();

  // 현재 GPS 위치 (LocationContext에서 제공)
  const position = useContext(LocationContext);
  const [isAutoCenter, setIsAutoCenter] = useState(true);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // 마커 아이콘 정의 (색상별)
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

  // 지도 초기화 + 매장 데이터 표시
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: false });
    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // 매장 데이터 서버에서 불러오기
    (async () => {
      try {
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
        const res = await fetch(`${apiURL}/getStoreInfo/all`);
        const stores: Store[] = await res.json();

        // 모든 매장 마커 표시 (기본: 검정색)
        stores.forEach((store) => {
          if (store.x_coord && store.y_coord) {
            const marker = L.marker([store.x_coord, store.y_coord], { icon: blackIcon }).addTo(map);
            marker.on("click", () => {
              setSelectedStore(store);
            });
            markersRef.current[store.store_id] = marker;
          }
        });

        // 최근 선택된 상품 이름 불러오기
        const selectedGoodName = localStorage.getItem("selectedGoodName");
        if (selectedGoodName) {
          // 매장별 가격 데이터 불러오기
          const priceRes = await fetch(`${apiURL}/getPriceInfo?good_name=${selectedGoodName}`);
          const priceData: StorePrice[] = await priceRes.json();

          // 모든 마커를 기본색으로 초기화
          Object.values(markersRef.current).forEach((m) => m.setIcon(blackIcon));

          // 가격 데이터 있는 매장만 빨간색 + 가격 툴팁 표시
          priceData.forEach((p) => {
            const key = String(p.store_id).trim();
            const marker = markersRef.current[key];
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

    map.setView([37.5665, 126.978], 15);

    map.on("dragstart", () => {
      if (isAutoCenter) {
        setIsAutoCenter(false);
      }
    });
  }, [isAutoCenter, blackIcon, redIcon]);

  // 유저 위치 마커 표시
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !position) return;

    const { latitude, longitude, accuracy } = position.coords;

    // 기존 마커 / 원 제거 후 새로 추가
    if (markerRef.current) map.removeLayer(markerRef.current);
    if (circleRef.current) map.removeLayer(circleRef.current);

    markerRef.current = L.marker([latitude, longitude], { icon: blueIcon }).addTo(map);
    circleRef.current = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);

    // 지도 중심을 내 위치로 이동
    map.setView([latitude, longitude], 16);
  }, []);


  // 내 위치로 이동 버튼 클릭시 호출
  const handleRecenter = () => {
    const map = leafletMap.current;
    if (!map || !position) return;
    const { latitude, longitude } = position.coords;
    map.flyTo([latitude, longitude], 16, {
      animate: true,
      duration: 1.5,
    });
    setIsAutoCenter(true);
  };

  // 지도 및 버튼 렌더링
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div
        ref={mapRef}
        id="map"
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      <button
        onClick={handleRecenter}
        style={{
          position: "absolute",
          bottom: "120px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "#ffffffff",
          color: "white",
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
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "100%",
            background: "#fff",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            boxShadow: "0 -4px 10px rgba(0,0,0,0.2)",
            padding: "16px",
            zIndex: 2000,
            maxHeight: "40vh",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0" }}>{selectedStore.store_name}</h3>
          <p>{selectedStore.road_addr}</p>
          <p>{selectedStore.jibun_addr}</p>
          <p>📞 {selectedStore.tel_no ?? "전화번호 없음"}</p>

          <button
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              marginBottom: "env(safe-area-inset-bottom)",
            }}
            onClick={() => setSelectedStore(null)}
          >
            <p></p>
            닫기
          </button>
        </div>
      )}
    </div>

  );

}

export default Map;
