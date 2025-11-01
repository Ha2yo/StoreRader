import { useContext, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocationContext } from "../contexts/LocationProvider";

function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const position = useContext(LocationContext);
  const [isAutoCenter, setIsAutoCenter] = useState(true);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: false });
    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // 기본 중심
    map.setView([37.5665, 126.9780], 15);

    // 사용자가 지도 드래그하면 자동 중심 이동 해제
    map.on("dragstart", () => {
      if (isAutoCenter) {
        setIsAutoCenter(false);
      }
    });
  }, [isAutoCenter]);

  // 위치 업데이트 시 마커/원 표시 및 (필요시) 중심 이동
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

  // 버튼 클릭 시 내 위치로 이동
  const handleRecenter = () => {
    const map = leafletMap.current;
    if (!map || !position) return;
    const { latitude, longitude } = position.coords;
    map.setView([latitude, longitude], 16);
    setIsAutoCenter(true);
    console.log("내 위치로 이동");
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
