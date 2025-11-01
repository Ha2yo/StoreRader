import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return; // DOM이 준비되어야 실행됨

    // 이미 map이 있다면 재생성 방지
    if (leafletMap.current) return;

    // Leaflet 지도 초기화
    const map = L.map(mapRef.current, {
      zoomControl: false, // ← 이 한 줄이 줌 컨트롤 제거
    }).setView([37.5664056, 126.9778222], 16);


    // OpenStreetMap 타일 추가
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    if (!navigator.geolocation) {
      console.log("This device doesn't support geolocation feature!");
    } else {
      setInterval(() => {
        navigator.geolocation.getCurrentPosition(getPosition);
      }, 5000);
    }

    let marker: L.Marker | null = null;
    let circle: L.Circle | null = null;

    function getPosition(position: GeolocationPosition) {
      const lat = position.coords.latitude;
      const long = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      if (marker) map.removeLayer(marker);
      if (circle) map.removeLayer(circle);

      marker = L.marker([lat, long]);
      circle = L.circle([lat, long], { radius: accuracy })

      const featureGroup = L.featureGroup([marker, circle]).addTo(map)

      map.fitBounds(featureGroup.getBounds())
    }


    // 언마운트 시 지도 제거
    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export default Map;
