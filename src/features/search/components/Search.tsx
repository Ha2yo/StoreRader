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
      style={{
        padding: "15px",
        backgroundColor: "#fff",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="상품명을 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          marginTop: "20px",
        }}
      />

      <ul style={{ listStyle: "none", padding: 0, maxHeight: "70vh", overflowY: "auto" }}>
        {filteredGoods.map((g, index) => (
          <li
            key={index}
            style={{
              padding: "8px 5px",
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
