/**
 * File: features/search-bar/components/Search.tsx
 * Description:
 *   홈 화면 상단 검색바 + 사이드바 버튼 UI
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../side-bar/components/SideBar";
import { useLastSearch } from "../hooks/useLastSearch";

function Search() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 히스토리에서 들어온 경우 검색바를 숨긴다
  const historyFlag = localStorage.getItem("historyFlag");

  // 마지막 검색어 자동 표시
  const lastSearch = useLastSearch();

  return (
    <>
      {historyFlag !== "1" && (
        <>
          <div
            className="search-bar-map"
            onClick={() => navigate("/search")}
          >
            {/* 햄버거 버튼 */}
            <button
              style={{
                all: "unset",
                fontSize: 25,
                width: 80,
                height: 50,
                cursor: "pointer",
                color: "#333",
                borderRadius: "25px 8px 8px 25px",
                // background: "rgba(0,0,0,0.05)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(true);
              }}
            >
              &nbsp;&nbsp;&nbsp;&nbsp;☰
            </button>

            <input
              className="search-bar-box"
              type="text"
              value={lastSearch}
              onClick={() => navigate("/search")}
              placeholder="상품명을 입력하세요"
              readOnly
            />
          </div>
        </>
      )}

      {isSidebarOpen && (
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      )}
    </>
  );
}

export default Search;
