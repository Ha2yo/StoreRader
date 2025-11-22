import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePriceChange } from "../hooks/usePriceChange";
import { formatDate } from "../utils/formatDate";
import Slider from "@mui/material/Slider";
import { touchEffect } from "../../StoreDetailPanel/utils/touchEffect";

const marks = [
    { value: 0, label: '0개' },
    { value: 50, label: '50개' },
    { value: 100, label: '100개' },
];

export default function PriceChange() {
    const navigate = useNavigate();
    const { downList, upList, minCount, setMinCount } = usePriceChange();
    const [tab, setTab] = useState<"down" | "up">("down");

    const list = tab === "down" ? downList : upList;

    return (
        <div style={{ padding: "0px 20px 100px" }}>

            {/* 탭 */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 12,
                borderBottom: "1px solid #eee",
            }}>
                {["down", "up"].map((type) => (
                    <div
                        key={type}
                        onClick={() => setTab(type as "down" | "up")}
                        style={{
                            padding: "10px 20px",
                            fontSize: 15,
                            cursor: "pointer",
                            color: tab === type ? "#007AFF" : "#666",
                            borderBottom: tab === type ? "3px solid #007AFF" : "3px solid transparent",
                            fontWeight: tab === type ? 600 : 500,
                        }}
                    >
                        {type === "down" ? "하락 TOP 50" : "상승 TOP 50"}
                    </div>
                ))}
            </div>

            {/* 슬라이더 */}
            <div style={{ margin: "10px 10px" }}>
                <label style={{ fontSize: 14, fontWeight: 600 }}>
                    매장 수 필터 : {minCount}개 이상
                </label>

                <Slider
                    value={minCount}
                    onChange={(_, value) => setMinCount(value as number)}
                    min={0}
                    max={100}
                    step={10}
                    marks={marks}
                    valueLabelDisplay="auto"
                    sx={{
                        mt: 2,
                        color: "#007AFF",
                        "& .MuiSlider-thumb": {
                            width: 22,
                            height: 22,
                        },
                    }}
                />
            </div>

            {/* 설명 카드 */}
            <div style={{
                background: "#F7F9FC",
                padding: "12px 14px",
                borderRadius: 8,
                fontSize: "13px",
                color: "#555",
                lineHeight: "1.45",
                marginBottom: 14,
            }}>
                최근 조사된 가격과 <b>2주 전 가격</b>을 비교하여 변동 폭이 큰 상품 TOP 50을 보여줍니다.
                상품을 클릭하면 지도에서 추천 1위 매장을 바로 확인할 수 있습니다.
            </div>

            {/* 조사일 */}
            <div style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#444",
                marginBottom: "15px"
            }}>
                조사일자: <b>
                    {list.length > 0 ? formatDate(list[0].inspect_day) : ""}
                </b>
            </div>

            {/* 리스트 */}
            <ul style={{ listStyle: "none", paddingBottom: 100, margin: 0 }}>
                {list.map((item, idx) => (
                    <li
                        key={item.good_id}
                        {...touchEffect as any}
                        onClick={() => {
                            localStorage.setItem("selectedGoodId", item.good_id);
                            localStorage.setItem("selectedGoodName", item.good_name);
                            localStorage.setItem("lastSearchTerm", item.good_name);
                            navigate("/map");
                        }}
                        style={{
                            padding: "14px 8px",
                            borderBottom: "1px solid #eee",
                            cursor: "pointer",
                        }}
                    >
                        <strong style={{ fontSize: 15 }}>
                            {idx + 1}. {item.good_name}
                        </strong>

                        <div style={{ marginTop: 6, fontSize: 14, color: "#333" }}>
                            변동 폭:
                            <span
                                style={{
                                    color: tab === "down" ? "#007AFF" : "#FF3B30",
                                    fontWeight: 700,
                                }}
                            >
                                {" "}
                                {item.avg_drop.toLocaleString()}원
                            </span>

                            <br />
                            <span style={{ color: "#666", fontSize: 13 }}>
                                변동이 감지된 매장 수: {item.change_count.toLocaleString()}곳
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}