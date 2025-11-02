// src/components/Search.tsx
import { useNavigate } from "react-router-dom";

function Search() {
  const navigate = useNavigate();

  return (
      <input
        type="text"
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
