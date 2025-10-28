// src/components/Map.tsx
import { useEffect } from "react";

declare global {
  interface Window {
    naver: any;
  }
}

function Map() {
  useEffect(() => {
    // 네이버 지도 SDK 로드 확인
    if (!window.naver?.maps) {
      console.error("네이버 지도 SDK가 아직 로드되지 않았습니다.");
      return;
    }

    // 사용자 위치 기반으로 지도 생성
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userPos = new window.naver.maps.LatLng(latitude, longitude);

          const mapDiv = document.getElementById("map");
          if (!mapDiv) return;

          // 위치 받아온 후에 지도 생성
          const map = new window.naver.maps.Map(mapDiv, {
            center: userPos,
            zoom: 15,
          });

          // 내 위치 원(circle) 표시
          new window.naver.maps.Marker({
            position: userPos,
            map,
            icon: {
              content: `
                <div style="
                  width: 18px;
                  height: 18px;
                  background: #1E90FF;
                  border: 2px solid white;
                  border-radius: 50%;
                  box-shadow: 0 0 5px rgba(0,0,0,0.3);
                "></div>
              `,
              anchor: new window.naver.maps.Point(9, 9), // 중심 정렬
            },
            title: "내 위치",
          });

          

        },
        (err) => {
          console.error("위치 정보를 가져올 수 없습니다:", err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("이 기기는 위치 정보를 지원하지 않습니다.");
    }
  }, []);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100vh",
        borderRadius: "12px",
      }}
    />
  );
}

export default Map;
