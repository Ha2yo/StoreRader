import { touchEffect } from "../../StoreDetailPanel/utils/touchEffect";
import { useMyInfo } from "../hooks/useMyInfo";
import UserHistoryList from "./UserHistory";

export default function MyInfo() {
  const { user, history, handleLogin, handleLogout, loadHistory } = useMyInfo();

  return (
    <div className="container" style={{ paddingTop: "100px" }}>


      {!user ? (
        <div>
          <div className="profile" />
          <br />
          <p style={{ color: "#666" }}>로그인이 필요합니다</p>

          <button
            {...touchEffect}
            style={{
              width: "80%",
              padding: "12px",
              background: "#007aff",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              marginTop: "20px",
            }}
            onClick={handleLogin}>
            로그인
          </button>
        </div>
      ) : (
        <div>
          <img
            src={user.picture}
            alt="profile"
            className="profile"
          />
          <p style={{ marginTop: 16, fontSize: 20, fontWeight: "bold" }}>
            {user.name}님 환영합니다
          </p>
          <p style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
            {user.email}
          </p>

          <button
            {...touchEffect}
            style={{
              width: "80%",
              padding: "12px",
              background: "#eee",
              border: "1px solid #ddd",
              borderRadius: "10px",
              fontSize: "16px",
              marginTop: "20px",
            }}
            onClick={loadHistory}>
            기록 보기
          </button>

          <button
            {...touchEffect}
            style={{
              width: "80%",
              padding: "12px",
              background: "#FF4D4F",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              marginTop: "12px",
            }}
            onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}

      {history.length > 0 && <UserHistoryList history={history} />}
    </div>
  );
}
