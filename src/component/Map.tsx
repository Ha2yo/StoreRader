import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 지도 초기화
    const map = L.map(mapRef.current, {
      center: [37.5665, 126.9780], // 서울 중심
      zoom: 15,
      zoomControl: false,
    });

    // 기본 타일 레이어 (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    }).addTo(map);

    // 컴포넌트가 언마운트될 때 지도 제거
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div id="map"
      ref={mapRef}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}

export default Map;
