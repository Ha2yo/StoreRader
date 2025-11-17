import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

// onclose: 사이드바 닫는 함수
interface SidebarProps {
  onClose: () => void;
}

// 대한민국 지역별 코드
interface Region {
  code: string;
  name: string;
  parent_code: string | null;
  level: number;
}

// 거리 필터 (단위: km)
const distances =[
  { name: "1km", code: "1.00"},
  { name: "3km", code: "3.00"},
  { name: "5km", code: "5.00"},
  { name: "10km", code: "10.00"},
  { name: "20km", code: "20.00"},
]

function Sidebar({ onClose }: SidebarProps) {
  const [showRegionList, setShowRegionList] = useState(false);
  const [showDistanceList, setShowDistanceList] = useState(false);

  // DB에서 불러온 지역 데이터
  const [regions, setRegions] = useState<Region[]>([]);

  // 지역 & 거리 선택 상태
  const [selectedRegion, setSelectedRegion] = useState<string>(
    localStorage.getItem("selectedRegionCode") || "020000000"
  );
  const [selectedDistance, setSelectedDistance] = useState<string | null>(
    localStorage.getItem("selectedDistance") || null
  );

  // 초기 기본값 설정
  useEffect(() => {
    if (!localStorage.getItem("selectedRegionCode")) {
      localStorage.setItem("selectedRegionCode", "020000000");
    }
  }, []);

  // ⭐ DB에서 지역코드 불러오기
  useEffect(() => {
    async function loadRegions() {
      try {
        // API_URL 불러오기
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });


        // 호출
        const res = await fetch(`${apiURL}/get/region-codes/all`);
        const data: Region[] = await res.json();

        // level = 1 만 상위지역으로 사용
        const topRegions = data.filter((r) => r.level === 1);

        // "전체" 추가
        setRegions([
          { code: "020000000", name: "전체", parent_code: null, level: 0 },
          ...topRegions,
        ]);
      } catch (err) {
        console.error("지역 코드 불러오기 실패:", err);
      }
    }

    loadRegions();
  }, []);

  // 지역 선택
  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedDistance(null);

    localStorage.setItem("selectedRegionCode", regionCode);
    localStorage.removeItem("selectedDistance");

    window.dispatchEvent(
      new CustomEvent("regionChange", { detail: regionCode })
    );
    onClose();
  };

  // 거리 선택
  const handleDistanceSelect = (distanceCode: string) => {
    setSelectedDistance(distanceCode);
    setSelectedRegion("020000000");

    localStorage.setItem("selectedDistance", distanceCode);
    localStorage.setItem("selectedRegionCode", "020000000");

    window.dispatchEvent(
      new CustomEvent("distanceChange", { detail: distanceCode })
    );
    onClose();
  };

  // 렌더링
  return (
    <>
      {/* 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.4)",
          zIndex: 1500,
        }}
      />

      {/* 사이드바 본체 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "250px",
          height: "100vh",
          background: "#ffffff",
          boxShadow: "2px 0 6px rgba(0,0,0,0.2)",
          zIndex: 2500,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          animation: "slideIn 0.3s ease-out",
          overflowY: "auto",
          paddingBottom: "80px",
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            all: "unset",
            position: "absolute",
            fontSize: 25,
            top: 30,
            right: 16,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {/* 섹션 제목 */}
        <h3 style={{ marginTop: 60 }}>매장 필터링</h3>

        {/* 지역 토글 버튼 */}
        <button
          style={{
            border: "none",
            background: "none",
            fontSize: 16,
            textAlign: "left",
            padding: "8px 0",
            cursor: "pointer",
          }}
          onClick={() => setShowRegionList((prev) => !prev)}
        >
          지역
          <span style={{ fontSize: 14, color: "#555" }}>
          </span>
        </button>

        {/* 하위 지역 리스트 */}
        {showRegionList && (
          <div style={{ marginLeft: 10, marginTop: 5 }}>
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => handleRegionSelect(region.code)}
                style={{
                  display: "block",
                  width: "100%",
                  border: "none",
                  background: "#f8f9fa",
                  borderRadius: 6,
                  padding: "8px 10px",
                  marginBottom: 4,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                  backgroundColor:
                    selectedRegion === region.code ? "#007bff" : "#f8f9fa",
                  color: selectedRegion === region.code ? "#fff" : "#000",
                  fontWeight: selectedRegion === region.code ? "bold" : "normal",
                  transition: "background-color 0.2s",
                }}
              >
                {region.name}
              </button>
            ))}
          </div>
        )}

        {/* 거리 필터 */}
        <button
          style={{
            border: "none",
            background: "none",
            fontSize: 16,
            textAlign: "left",
            padding: "8px 0",
            cursor: "pointer",
          }}
          onClick={() => setShowDistanceList((prev) => !prev)}
        >
          거리
        </button>

        {showDistanceList && (
          <div style={{ marginLeft: 10, marginTop: 5 }}>
            {distances.map((distance) => (
              <button
                key={distance.code}
                onClick={() => handleDistanceSelect(distance.code)}
                style={{
                  display: "block",
                  width: "100%",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 10px",
                  marginBottom: 4,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                  backgroundColor:
                    selectedDistance === distance.code ? "#007bff" : "#f8f9fa",
                  color: selectedDistance === distance.code ? "#fff" : "#000",
                  fontWeight:
                    selectedDistance === distance.code ? "bold" : "normal",
                }}
              >
                {distance.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;
