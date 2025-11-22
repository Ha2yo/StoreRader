import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGoods } from "../hooks/useGoods";
import { useSearchTerm } from "../hooks/useSearchTerm";

function Search() {
  const inputRef = useRef<HTMLInputElement>(null);

  const goods = useGoods();
  const { searchTerm, setSearchTerm } = useSearchTerm();

  const navigate = useNavigate();

  // 모바일에서 입력창 자동 활성화
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);

  }, []);

  // 검색어 필터링
  const filteredGoods = goods.filter((g) =>
    g.good_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="search-page"
      style={{

        padding: "15px",
        backgroundColor: "#fff",
        height: "100vh",
        boxSizing: "border-box",
        zIndex: 30,
      }}
    >
      {/* 상단 여백 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: 110,
          //backgroundColor: "#18232dff",
          backgroundColor: "#ffffffff",
          zIndex: 999,
        }}
      />
      <input
        className="search-bar-search"
        ref={inputRef}
        type="text"
        placeholder="상품명을 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul
        className="search-box"
        style={{
          listStyle: "none",
          padding: 0,
          paddingTop: "70px",
          maxHeight: "80vh",
          overflowY: "auto"
        }}>
        {filteredGoods.map((g, index) => (
          <li
            key={index}
            style={{
              padding: "15px 5px",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
            }}
            onClick={() => {
              setSearchTerm(g.good_name);
              localStorage.setItem("selectedGoodName", g.good_name);
              localStorage.setItem("selectedGoodId", g.good_id);
              navigate("/map");
            }}
          >
            {g.good_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;
