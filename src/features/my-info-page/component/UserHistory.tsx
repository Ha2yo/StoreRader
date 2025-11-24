/**
 * File: features/myinfo-page/components/UserHistoryList.tsx
 * Description:
 *   사용자가 선택했던 매장/상품 기록을 카드 형태로 보여주고,
 *   클릭 시 해당 매장을 지도 페이지에서 바로 표시한다
 */

import { touchEffect } from "../../../utils/touchEffect";
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

          {/* 기록 생성 날짜 표시 */}
          <div style={{
            fontSize: "12px",
            color: "#999",
            marginBottom: "8px",
          }}>
            {(() => {
              const date = new Date(item.created_at + "Z"); // UTC -> 한국시간 변환
              return date.toLocaleString("ko-KR", {
                timeZone: "Asia/Seoul",
              });
            })()}
          </div>

          {/* 상품명 */}
          <div style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "#111",
            marginBottom: "6px",
          }}>
            {item.good_name}
          </div>

          {/* 매장명 */}
          <div style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "#111",
            marginBottom: "6px",
          }}>
            {item.store_name}
          </div>

          {/* 가격 정보 */}
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
