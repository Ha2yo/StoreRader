import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Good: 상품 정보 구조체
interface Good {
  id: number;
  good_id: string;
  good_name: string;
  total_cnt: number | null;
  total_div_code: string | null;
  created_at: string;
  updated_at: string;
}

function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [goods, setGoods] = useState<Good[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // 마지막 검색어 로드
  useEffect(() => {
    const savedTerm = localStorage.getItem("lastSearchTerm");
    if (savedTerm) {
      setSearchTerm(savedTerm);
    }
  }, []);

  // 검색어 상태 변화 시 로컬스토리지 업데이트
  useEffect(() => {
    if (searchTerm.trim() === "") {
      localStorage.removeItem("lastSearchTerm");
    } else {
      localStorage.setItem("lastSearchTerm", searchTerm);
    }
  }, [searchTerm]);

  // 상품 목록 서버에서 불러오기
  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
        const res = await fetch(`${apiURL}/getGoodInfo/all`);
        const data: Good[] = await res.json();
        setGoods(data);
        console.log("상품목록 불러오기 완료:", data.length, "개");
      } catch (err) {
        console.error("상품 불러오기 실패:", err);
      }
    };
    fetchGoods();
  }, []);

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
        {filteredGoods.slice(0, 10).map((g, index) => (
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
