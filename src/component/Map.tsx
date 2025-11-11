import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { invoke } from "@tauri-apps/api/core";
import StoreDetailPanel from "./StoreDetailPanel";
import { usePreference } from "../contexts/PreferenceContext";

// 매장 기본 정보
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

// 특정 상품의 매장별 가격 정보
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
  const markersRef = useRef<Record<string, L.Marker>>({}); // 매장 마커 캐시

  const [selectedStore, setSelectedStore] = useState<Store | null>(null); // 선택된 매장 상태

  const [renderKey, setRenderKey] = useState(0); // 지도 리렌더링 트리거

  const { preference } = usePreference(); // 사용자 선호도
  const w_price = preference.w_price; // 가격 가중치
  const w_distance = preference.w_distance; // 거리 가중치

  const [scoredStores, setScoredStores] = useState<Store[]>([]);

  const selectedGoodId = localStorage.getItem("selectedGoodId");

  // 저장된 사용자 위치 로드
  function loadSavedPosition() {
    const saved = localStorage.getItem("lastPosition");
    if (!saved) return null;

    const pos = JSON.parse(saved);
    return pos; // { lat, lng, accuracy }
  }

  // 사용자와 매장 간 거리 구하기 (하버사인 공식 활용)
  // 위, 경도 입력 -> km 단위 실수 반환
  function getDistance(
    slat: number, slng: number, dlat: number, dlng: number) {
    const radius = 6371; // 지구 반경 (km)
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

  // 추천 점수 계산 (낮을수록 효율적)
  function calcEfficiency(
    price: number,
    distance: number,
    maxPrice: number,
    maxDistance: number,
    w_price: number,
    w_distance: number
  ): number {
    const priceRatio = price / maxPrice;
    const distanceRatio = distance / maxDistance;

    return w_price * priceRatio + w_distance * distanceRatio;
  }

  // 매장 필터 이벤트 수신 -> renderKey 증가
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

  // 마커 아이콘 정의
  // - 파랑: 사용자 위치
  // - 빨강: 추천 1위 매장
  // - 주황: 추천 2~5위 매장
  // - 검정: 일반 매장
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

  const orangeIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
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
  // renderkey가 바뀔 때마다 실행
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    (async () => {
      try {
        // 서버 주소 가져오기
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

        // 전체 매장 목록 조회
        const res = await fetch(`${apiURL}/get/StoreInfo/all`);
        const stores: Store[] = await res.json();

        const selectedRegion = localStorage.getItem("selectedRegionCode") || "020000000";
        const selectedDistance = localStorage.getItem("selectedDistance");
        const selectedGoodName = localStorage.getItem("selectedGoodName");

        const pos = loadSavedPosition(); // 사용자 위치

        let priceData: StorePrice[] = [];

        // 선택된 상품이 있다면 가격 데이터 획득
        if (selectedGoodName) {
          const priceRes = await fetch(`${apiURL}/get/PriceInfo?good_name=${selectedGoodName}`);
          priceData = await priceRes.json();
          console.log("불러온 가격 데이터:", priceData.length, "개");

        }

        // 매장 필터링
        let filteredStores = stores;

        // 거리 필터가 있으면 거리 기준 우선 필터링
        if (selectedDistance) {
          const maxDist = parseFloat(selectedDistance);

          // 사용자 위치가 있을 때만 거리 판단
          filteredStores = stores.filter(
            (s) => getDistance(pos.lat, pos.lng, s.x_coord!, s.y_coord!) <= maxDist
          );

          // 기존 원 제거 후 새 반경 원 추가
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
        // 거리 필터가 없고, 지역 필터가 '전체'가 아니라면 지역 코드 필터
        else if (selectedRegion !== "020000000") {
          if (circleRef.current) map.removeLayer(circleRef.current);
          filteredStores = stores.filter((s) => s.area_code === selectedRegion);
          console.log(`지역 코드 ${selectedRegion} 매장 수: ${filteredStores.length}`);
        }

        // 기존 마커들 전부 제거
        Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
        markersRef.current = {};

        // 상품이 선택된 경우: 추천 시스템만 실행
        if (selectedGoodName && priceData.length > 0) {

          // 가격 데이터가 있는 매장을 대상으로 한다
          const validStores = filteredStores.filter((s) =>
            priceData.some((p) => p.store_id === s.store_id)
          );

          if (validStores.length === 0) return;

          // 정규화 기준값: max 가격 / 거리
          const maxPrice = Math.max(...priceData.map((p) => p.price));
          const distances = validStores.map((s) =>
            getDistance(pos.lat, pos.lng, s.x_coord!, s.y_coord!)
          );
          const maxDistance = distances.length > 0 ? Math.max(...distances) : 1;

          // 각 매장에 대해 점수 계산
          const scored = validStores.map((store) => {
            const matched = priceData.find((p) => p.store_id === store.store_id); // ✅ priceData에서 매칭
            const price = matched?.price ?? maxPrice;
            const inspect_day = matched?.inspect_day ?? null;
            const distance = getDistance(pos.lat, pos.lng, store.x_coord!, store.y_coord!);
            const score = calcEfficiency(price, distance, maxPrice, maxDistance, w_price, w_distance);
            return { ...store, price, distance, inspect_day, score };
          });
          scored.sort((a, b) => a.score - b.score);

          if (scored.length > 0) {
            const top = scored[0];
            map.flyTo([top.x_coord!, top.y_coord!], 16, {
              animate: true,
              duration: 1.5,
            });
          }

          setScoredStores(scored);

          // 점수가 낮은 순(효율 높은 순)으로 정렬
          scored.sort((a, b) => a.score - b.score);

          // 마커 생성
          scored.forEach((store, idx) => {
            // 순위별 아이콘
            let icon = blackIcon;
            if (idx === 0) icon = redIcon;        // 1위
            else if (idx < 5) icon = orangeIcon;  // 2~5위

            const marker = L.marker([store.x_coord!, store.y_coord!], { icon }).addTo(map);

            // 가격 툴팁 (항상 표시)
            marker.bindTooltip(
              `₩${store.price.toLocaleString()}`,
              {
                permanent: true,
                direction: "top",
                offset: L.point(0, -40),
                className: "price-tooltip",
              }
            ).openTooltip();

            // 팝업 (상위 5개는 상세, 6등부터는 순위만)
            if (idx < 5) {
              if (idx === 0) {
                marker.bindTooltip(`
                  <b>추천 매장 (${idx + 1}위)</b><br/>
                  ₩${store.price.toLocaleString()}<br/>
                  ${store.distance.toFixed(2)} km<br/>
                  효율 점수: ${store.score.toFixed(3)}`,
                  {
                    permanent: true,
                    direction: "top",
                    offset: L.point(0, -40),
                    className: "price-tooltip top-store",
                  }
                ).openTooltip();
                
              } else
              marker.bindPopup(`
                <b>추천 매장 (${idx + 1}위)</b><br/>
                ₩${store.price.toLocaleString()}<br/>
                ${store.distance.toFixed(2)} km<br/>
                효율 점수: ${store.score.toFixed(3)}
              `);
            } else {
              marker.bindPopup(`<b>${idx + 1}위 추천 매장</b>`);
            }
            markersRef.current[store.store_id] = marker;

            // 클릭 시 상세 패널 열기
            marker.on("click", () => setSelectedStore(store));
          });
        }
        // 일반 모드
        else {
          filteredStores.forEach((store) => {

            const marker = L.marker([store.x_coord!, store.y_coord!], { icon: blackIcon }).addTo(map);
            // 클릭 시 상세 패널 열기
            marker.on("click", () => setSelectedStore(store));
            markersRef.current[store.store_id] = marker;

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
        <StoreDetailPanel
          store={selectedStore}
          goodId={selectedGoodId}
          candidates={scoredStores}
          onClose={() => setSelectedStore(null)} />
      )}
    </div>
  );
}

export default Map;