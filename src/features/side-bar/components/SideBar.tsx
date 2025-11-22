import { useEffect, useState } from "react";
import { useRegions } from "../hooks/useRegions.ts";
import { applyDistanceSelection, applyRegionSelection } from "../utils/selectionHandler.ts";

// onclose: 사이드바 닫는 함수
interface SidebarProps {
  onClose: () => void;
}

// 거리 필터 (단위: km)
const distances = [
  { name: "1km", code: "1.00" },
  { name: "3km", code: "3.00" },
  { name: "5km", code: "5.00" },
  { name: "10km", code: "10.00" },
  { name: "20km", code: "20.00" },
]

function Sidebar({ onClose }: SidebarProps) {
  const [closing, setClosing] = useState(false);

  const [showRegionList, setShowRegionList] = useState(false);
  const [showDistanceList, setShowDistanceList] = useState(false);

  // 지역 & 거리 선택 상태
  const [selectedRegion, setSelectedRegion] = useState<string>(
    localStorage.getItem("selectedRegionCode") || "020000000"
  );
  const [selectedDistance, setSelectedDistance] = useState<string | null>(
    localStorage.getItem("selectedDistance") || null
  );

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };
  // 초기 기본값 설정
  useEffect(() => {
    if (!localStorage.getItem("selectedRegionCode")) {
      localStorage.setItem("selectedRegionCode", "020000000");
    }
  }, []);

  const regions = useRegions();

  const handleRegionSelect = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedDistance(null);

    applyRegionSelection(regionCode);
    onClose();
  };

  const handleDistanceSelect = (distanceCode: string) => {
    setSelectedDistance(distanceCode);
    setSelectedRegion("020000000");

    applyDistanceSelection(distanceCode);
    onClose();
  };

  // 렌더링
  return (
    <>
      {/* 오버레이 */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 1500,
        }}
      />

      {/* 사이드바 본체 */}
      <div
        className={closing ? "sidebar sidebar-close" : "sidebar sidebar-open"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "70vw",
          height: "100vh",
          background: "#fff",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          boxShadow: "4px 0 14px rgba(0,0,0,0.15)",
          zIndex: 2500,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          paddingBottom: "90px",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "50px 18px 12px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            매장 필터링
          </h2>

          <button
            onClick={handleClose}
            style={{
              all: "unset",
              fontSize: 26,
              cursor: "pointer",
              padding: "6px",
              borderRadius: 8,
            }}
          >
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "10px 18px",
          }}
        >
          <button
            onClick={() => {
              setShowRegionList(true);
              setShowDistanceList(false);
            }}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: "none",
              fontSize: 15,
              fontWeight: showRegionList ? 700 : 500,
              background: showRegionList ? "#007aff" : "#f1f3f5",
              color: showRegionList ? "#fff" : "#333",
            }}
          >
            지역
          </button>

          <button
            onClick={() => {
              setShowDistanceList(true);
              setShowRegionList(false);
            }}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 10,
              border: "none",
              fontSize: 15,
              fontWeight: showDistanceList ? 700 : 500,
              background: showDistanceList ? "#007aff" : "#f1f3f5",
              color: showDistanceList ? "#fff" : "#333",

            }}
          >
            거리
          </button>
        </div>

        {/* 지역 선택 */}
        {showRegionList && (
          <div style={{ padding: "0 18px", marginTop: 6 }}>
            {regions.map((r) => (
              <button
                key={r.code}
                onClick={() => handleRegionSelect(r.code)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: selectedRegion === r.code ? "#e8f0fe" : "#fff",
                  padding: "14px 16px",
                  marginBottom: 8,
                  borderRadius: 12,
                  border: "1px solid #eee",
                  fontSize: 15,
                  fontWeight: selectedRegion === r.code ? 700 : 500,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "0.15s",
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}

        {/* 거리 선택 */}
        {showDistanceList && (
          <div style={{ padding: "0 18px", marginTop: 6 }}>
            {distances.map((d) => (
              <button
                key={d.code}
                onClick={() => handleDistanceSelect(d.code)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background:
                    selectedDistance === d.code ? "#e8f0fe" : "#fff",
                  padding: "14px 16px",
                  marginBottom: 8,
                  borderRadius: 12,
                  border: "1px solid #eee",
                  fontSize: 15,
                  fontWeight:
                    selectedDistance === d.code ? 700 : 500,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "0.15s",
                }}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;
