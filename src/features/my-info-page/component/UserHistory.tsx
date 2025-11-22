import { touchEffect } from "../../StoreDetailPanel/utils/touchEffect";
import { UserHistoryItem } from "../types/MyInfo.types";
import { useNavigate } from "react-router-dom";

interface Props {
  history: UserHistoryItem[];
}

export default function UserHistoryList({ history }: Props) {
  const navigate = useNavigate();

  return (
    <ul style={{
      marginTop: "20px",
      paddingLeft: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: "100px",
    }}>
      {history.map((item) => (
        <li
          key={item.id}
          {...touchEffect as any}
          style={{
            width: "92%",
            maxWidth: "480px",
            background: "#fff",
            padding: "16px 20px",
            marginBottom: "16px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            listStyle: "none",
            cursor: "pointer",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
          }}
          onClick={() => {
            localStorage.setItem("historyFlag", "1");
            localStorage.setItem("historyStoreId", item.store_id);
            localStorage.setItem("historyGoodId", item.good_id.toString());
            localStorage.setItem("historyGoodName", item.good_name);
            navigate("/map");
          }}
        >
          <div style={{
            fontSize: "12px",
            color: "#999",
            marginBottom: "8px",
          }}>
            {(() => {
              const date = new Date(item.created_at + "Z"); // ← UTC로 인식시키기
              return date.toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
              });
            })()}
          </div>

          <div style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#111",
              marginBottom: "6px",
            }}>
            {item.good_name}
          </div>

          <div style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#111",
              marginBottom: "6px",
            }}>
            {item.store_name}
          </div>

          <div style={{ fontSize: "15px" }}>
            <div>
              <span style={{ color: "#666" }}>당시 가격: </span>
              <strong style={{ color: "#007AFF" }}>
                {item.price?.toLocaleString() ?? "정보 없음"}원
              </strong>
            </div>

            {item.current_price != null && item.current_price !== item.price && (
              <div style={{ marginTop: "3px" }}>
                <span style={{ color: "#555" }}>현재 가격: </span>
                <strong style={{ color: "#d9534f" }}>
                  {item.current_price.toLocaleString()}원
                </strong>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
