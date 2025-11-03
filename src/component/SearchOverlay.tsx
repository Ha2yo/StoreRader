import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const navigate = useNavigate();
  const [lastSearch, setLastSearch] = useState("");

  // 컴포넌트 로드시 마지막 검색어 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("lastSearchTerm");
    if (saved) {
      setLastSearch(saved);
    }
  }, []);

  // 렌더링
  return (
    <input
      type="text"
      value={lastSearch}
      onClick={() => navigate("/search")}
      placeholder="상품명을 입력하세요"
      readOnly
      style={{
        width: "100%",
        marginTop: "20px",
      }}
    />

  );
}

export default Search;
