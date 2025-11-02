import { useEffect, useRef } from "react";

function Search() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 페이지 전환 후 input 자동 포커스 (키보드 자동 표시)
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200); // 약간의 지연을 주면 모바일 환경에서도 안정적으로 동작
    return () => clearTimeout(timer);
  }, []);

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
        style={{
          width: "100%",
          marginTop: "20px",
        }}
      />
    </div>
  );
}

export default Search;
