import { useContext, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocationContext } from "../contexts/LocationContext";
import { invoke } from "@tauri-apps/api/core";

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
  const position = useContext(LocationContext);
  const [isAutoCenter, setIsAutoCenter] = useState(true);
  const markersRef = useRef<Record<string, L.Marker>>({});
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

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: false });
    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    (async () => {
      try {
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
        const res = await fetch(`${apiURL}/getStoreInfo/all`);
        const stores: Store[] = await res.json();

        stores.forEach((store) => {
          if (store.x_coord && store.y_coord) {
            const marker = L.marker([store.x_coord, store.y_coord], { icon: blackIcon }).addTo(map);
            marker.bindPopup(
              `<b>${store.store_name}</b><br/>${store.jibun_addr || "주소 없음"}<br/>${store.tel_no ? `☎ ${store.tel_no}` : ""
              }`
            );
            markersRef.current[store.store_id] = marker;
          }
        });

        const selectedGoodName = localStorage.getItem("selectedGoodName");
        if (selectedGoodName) {
          const priceRes = await fetch(`${apiURL}/getPriceInfo?good_name=${selectedGoodName}`);
          const priceData: StorePrice[] = await priceRes.json();

          // ① 모든 마커를 기본색으로 초기화
          Object.values(markersRef.current).forEach((m) => m.setIcon(blackIcon));

          // ② 가격 데이터 있는 매장만 빨간색 + 가격 툴팁 표시
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

  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !position) return;

    const { latitude, longitude, accuracy } = position.coords;

    if (markerRef.current) map.removeLayer(markerRef.current);
    if (circleRef.current) map.removeLayer(circleRef.current);

    markerRef.current = L.marker([latitude, longitude]).addTo(map);
    circleRef.current = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);

    if (isAutoCenter) {
      map.setView([latitude, longitude], 16);
    }
  }, [position, isAutoCenter]);

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
    </div>
  );
}

export default Map;
