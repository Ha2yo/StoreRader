import { UserHistoryItem } from "../types/MyInfo.types";
import { useNavigate } from "react-router-dom";

interface Props {
  history: UserHistoryItem[];
}

export default function UserHistoryList({ history }: Props) {
  const navigate = useNavigate();

  return (
    <ul style={{
      marginTop: "15px",
      paddingLeft: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: "80px",
    }}>
      {history.map((item) => (
        <li
          key={item.id}
          style={{
            width: "90%",
            maxWidth: "480px",
            background: "#fff",
            padding: "14px 16px",
            marginBottom: "14px",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            listStyle: "none",
            cursor: "pointer",
          }}
          onClick={() => {
            localStorage.setItem("historyFlag", "1");
            localStorage.setItem("historyStoreId", item.store_id);
            localStorage.setItem("historyGoodId", item.good_id.toString());
            localStorage.setItem("historyGoodName", item.good_name);
            navigate("/map");
          }}
        >
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
            {new Date(item.created_at).toLocaleString()}
          </div>

          <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
            {item.good_name}
          </div>

          <div style={{ fontSize: "14px", color: "#444", marginBottom: "8px" }}>
            {item.store_name}
          </div>

          <div style={{ fontSize: "14px", marginTop: "4px" }}>
            <div>
              <span style={{ color: "#555" }}>당시 가격: </span>
              <strong>
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
