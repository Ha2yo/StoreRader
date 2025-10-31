// src/components/Map.tsx
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

declare global {
  interface Window {
    naver: any;
    __globalMap?: any; // 전역 지도 객체 저장
  }
}

interface Store {
  id: number;
  store_name: string;
  road_addr: string;
  plmk_addr: string;
}

function Map() {
  // ===============================
  // 매장 데이터 로드 및 마커 표시
  // ===============================
  const loadMap = async () => {
    // 1. 지도 준비될 때까지 대기
    const waitForMap = async () => {
      for (let i = 0; i < 20; i++) {
        if (window.__globalMap && window.naver?.maps?.Service) return;
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error("지도 또는 geocoder 모듈이 아직 준비되지 않았습니다.");
    };
    await waitForMap();

    const map = window.__globalMap;

    // 2. API에서 매장 목록 받아오기
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
    const response = await fetch(`${apiURL}/api/stores`);
    const data = await response.json();
    const stores = data.stores || data;

    // 3. 매장 주소로 지오코딩 → 마커 표시
    for (const store of stores) {
      const addr = store.plmk_addr || store.road_addr;
      if (!addr) continue;

      console.log(`${store.store_name} — ${addr}`);

      await new Promise<void>((resolve) => {
        window.naver.maps.Service.geocode(
          { query: addr },
          (status: any, resp: any) => {
            if (status !== window.naver.maps.Service.Status.OK) {
              console.warn(`⚠️ 지오코딩 실패: ${addr}`);
              return resolve();
            }

            const item = resp.v2.addresses[0];
            if (!item) return resolve();

            const lat = parseFloat(item.y);
            const lng = parseFloat(item.x);
            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`⚠️ 좌표 파싱 실패: ${addr}`);
              return resolve();
            }

            const position = new window.naver.maps.LatLng(lat, lng);

            // 매장 마커 표시
            const marker = new window.naver.maps.Marker({
              position,
              map,
              title: store.store_name,
            });

            // 마커 클릭 시 정보창 표시
            const info = new window.naver.maps.InfoWindow({
              content: `
                <div style="padding:8px; width:220px;">
                  <b>${store.store_name}</b><br/>
                  ${addr}
                </div>
              `,
            });

            window.naver.maps.Event.addListener(marker, "click", () => {
              info.open(map, marker);
            });

            resolve();
          }
        );
      });

      // rate-limit 보호 (지오코딩 API 초당 10회 제한)
      await new Promise((r) => setTimeout(r, 120));
    }

    console.log("모든 매장 마커 표시 완료");
  };

  // ===============================
  // 지도 초기화 및 내 위치 표시
  // ===============================
  useEffect(() => {
    if (!window.naver?.maps) {
      console.error("네이버 지도 SDK가 아직 로드되지 않았습니다.");
      return;
    }

    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    // 기본 지도 생성 (서울 중심)
    const map = new window.naver.maps.Map(mapDiv, {
      center: new window.naver.maps.LatLng(37.5665, 126.9780),
      zoom: 13,
    });

    // 전역으로 저장 → loadMap()에서 접근
    window.__globalMap = map;

    // 내 위치 표시
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userPos = new window.naver.maps.LatLng(latitude, longitude);
          map.setCenter(userPos);

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
              anchor: new window.naver.maps.Point(9, 9),
            },
            title: "내 위치",
          });
        },
        (err) => console.error("위치 정보를 가져올 수 없습니다:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("이 기기는 위치 정보를 지원하지 않습니다.");
    }

    // 지도 준비 후 매장 마커 로드
    loadMap();
  }, []);

  // ===============================
  //  렌더링
  // ===============================
  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
}

export default Map;
