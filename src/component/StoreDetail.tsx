import { useLocation, useNavigate } from "react-router-dom";

function StoreDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const store = state?.store;

  if (!store) {
    return (
      <div style={{ padding: "16px" }}>
        <p> 매장 정보가 없습니다.</p>
        <button onClick={() => navigate("/")}>지도 화면으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>{store.store_name}</h2>
      <p> 도로명 주소: {store.road_addr}</p>
      <p> 지번 주소: {store.jibun_addr}</p>
      <p> 전화번호: {store.tel_no ?? "없음"}</p>
      <p> 우편번호: {store.post_no ?? "없음"}</p>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ← 돌아가기
      </button>
    </div>
  );
}

export default StoreDetail;
