// src/components/Map.tsx
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

declare global {
  interface Window {
    naver: any;
  }
}

// 환경변수에서 네이버맵 키 불러오기
const naverMapClientId = await invoke<string>("c_get_env_value", { name: "NAVER_MAP_CLIENT_ID" });

function Map() {
  useEffect(() => {
    // 네이버 지도 스크립트 로드
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapClientId}`;
    script.async = true;

    script.onload = () => {
      const mapDiv = document.getElementById("map");
      if (!mapDiv) return;

      // 지도 생성
      const defaultCenter = new window.naver.maps.LatLng(37.390792686, 126.918513414); // 우리집 좌표
      const map = new window.naver.maps.Map(mapDiv, {
        center: defaultCenter,
        zoom: 14,
      });

      // 마커
      new window.naver.maps.Marker({
        position: defaultCenter,
        map,
        title: "안양대",
      });

      // 내 위치 표시
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const myPos = new window.naver.maps.LatLng(latitude, longitude);

            // 푸른 점 마커 생성
            new window.naver.maps.Marker({
              position: myPos,
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
                anchor: new window.naver.maps.Point(9, 9),
              },
              title: "내 위치",
            });

            // 지도 중심을 내 위치로 이동
            map.setCenter(myPos);
          },
          (err) => {
            console.error("위치 정보를 가져올 수 없습니다:", err);
          }
        );
      } else {
        console.error("이 기기는 위치 정보를 지원하지 않습니다.");
      }
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div
      id="map"
      style={{ width: "100%", height: "100vh", borderRadius: "12px" }}
    />
  );
}

export default Map;
