import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";

function Search() {
  const navigate = useNavigate();
  const [lastSearch, setLastSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const historyFlag = localStorage.getItem("historyFlag");

  // 로컬스토리지에서 마지막 검색어 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("lastSearchTerm");
    if (saved) setLastSearch(saved);
  }, []);

  return (
    <>
      {historyFlag !== "1" && (
        <>
          {/* 상단 여백 */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: 30,
              backgroundColor: "#f8f9fa",
              zIndex: 999,
            }}
          />

          {/* 상단 검색바 */}
          <div
            style={{
              position: "fixed",
              top: 30,
              left: 0,
              width: "100vw",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#f8f9fa",
              zIndex: 1000,
            }}
          >
            {/* ☰ 버튼 */}
            <button
              style={{
                all: "unset",
                fontSize: 25,
                width: 30,
                cursor: "pointer",
                color: "#333",
                marginLeft: 10,
              }}
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>

            {/* 검색창 */}
            <input
              type="text"
              value={lastSearch}
              onClick={() => navigate("/search")}
              placeholder="상품명을 입력하세요"
              readOnly
              style={{
                flex: 1,
                height: 40,
                border: "1px solid #ccc",
                borderRadius: 8,
                paddingLeft: 12,
                fontSize: 14,
              }}
            />
          </div>
        </>
      )}

      {/* 사이드바 */}
      {isSidebarOpen && (
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      )}
    </>
  );
}

export default Search;
