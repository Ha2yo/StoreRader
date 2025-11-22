import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../side-bar/components/SideBar";
import { useLastSearch } from "../hooks/useLastSearch";

function Search() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const historyFlag = localStorage.getItem("historyFlag");
  const lastSearch = useLastSearch();

  return (
    <>
      {historyFlag !== "1" && (
        <>
          {/* 상단 검색바 */}
          <div
            className="search-bar-map"
            onClick={() => navigate("/search")}
          >
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
            {/* 검색창 */}
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

      {/* 사이드바 */}
      {isSidebarOpen && (
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      )}
    </>
  );
}

export default Search;
