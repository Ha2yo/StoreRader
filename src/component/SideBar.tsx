import { useEffect, useState } from "react";

// onclose: 사이드바 닫는 함수
interface SidebarProps {
  onClose: () => void;
}

// 대한민국 지역별 코드
const regions = [
  { name: "전체", code: "020000000" },
  { name: "서울특별시", code: "020100000" },
  { name: "광주광역시", code: "020200000" },
  { name: "대구광역시", code: "020300000" },
  { name: "대전광역시", code: "020400000" },
  { name: "부산광역시", code: "020500000" },
  { name: "울산광역시", code: "020600000" },
  { name: "인천광역시", code: "020700000" },
  { name: "강원특별자치도", code: "020800000" },
  { name: "경기도", code: "020900000" },
  { name: "경상남도", code: "021000000" },
  { name: "경상북도", code: "021100000" },
  { name: "전라남도", code: "021200000" },
  { name: "전북특별자치도", code: "021300000" },
  { name: "충청남도", code: "021400000" },
  { name: "충청북도", code: "021500000" },
  { name: "제주특별자치도", code: "021600000" },
  { name: "세종특별자치시", code: "021700000" },
];

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

  // 지역 & 거리 선택 상태
  const [selectedRegion, setSelectedRegion] = useState<string>(
    localStorage.getItem("selectedRegionCode") || "020000000"
  );
  const [selectedDistance, setSelectedDistance] = useState<string | null>(
    localStorage.getItem("selectedDistance") || null
  );

  // 초기 기본값 설정 ("전체"로 설정되게끔)
  useEffect(() => {
    if (!localStorage.getItem("selectedRegionCode")) {
      localStorage.setItem("selectedRegionCode", "020000000");
    }
  }, []);

  // 지역 선택 시 (이 때, 거리 선택은 해제)
  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedDistance(null);

    localStorage.setItem("selectedRegionCode", regionCode);
    localStorage.removeItem("selectedDistance");

    window.dispatchEvent(new CustomEvent("regionChange", { detail: regionCode })); // ✅ 추가
    console.log("지역 코드 저장 완료:", regionCode);
    onClose();
  };

  // 거리 선택 시 (지역 선택은 해제)
  const handleDistanceSelect = (distanceCode: string) => {
    setSelectedDistance(distanceCode);
    setSelectedRegion("020000000"); // 지역을 "전체"로 초기화

    localStorage.setItem("selectedDistance", distanceCode);
    localStorage.setItem("selectedRegionCode", "020000000");

    window.dispatchEvent(new CustomEvent("distanceChange", { detail: distanceCode }));
    console.log("거리 설정 완료:", distanceCode);
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
