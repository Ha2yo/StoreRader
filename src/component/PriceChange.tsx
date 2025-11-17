import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

interface PriceChangeItem {
    good_id: string;
    good_name: string;
    avg_drop: number;
    change_count: number;
    inspect_day: string;
}

function formatDate(yyyymmdd: string) {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function PriceChange() {
    const [downList, setDownList] = useState<PriceChangeItem[]>([]);
    const [upList, setUpList] = useState<PriceChangeItem[]>([]);
    const [tab, setTab] = useState<"down" | "up">("down");
    const [apiURL, setApiURL] = useState<string>("");

    const navigate = useNavigate();

    async function fetchPriceChange(status: "down" | "up", baseURL: string) {
        const res = await fetch(`${baseURL}/get/price-change?status=${status}`);
        if (!res.ok) throw new Error("API 요청 실패");
        return (await res.json()) as PriceChangeItem[];
    }

    useEffect(() => {
        async function load() {
            const url = await invoke<string>("c_get_env_value", { name: "API_URL" });
            setApiURL(url);
            fetchPriceChange("down", url).then(setDownList).catch(console.error);
            fetchPriceChange("up", url).then(setUpList).catch(console.error);
        }
        load();
    }, []);

    const list = tab === "down" ? downList : upList;

    return (
        <div style={{ padding: 20 }}>

            {/* 탭 버튼 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 2, justifyContent: "center" }}>
                <button onClick={() => setTab("down")}>하락 TOP 50</button>
                <button onClick={() => setTab("up")}>상승 TOP 50</button>
            </div>
            <br />
            <p style={{
                textAlign: "left",
                fontSize: "13px",
                color: "#666",
                margin: "8px 0 15px",
                lineHeight: "1.4"
            }}>
                최근 조사된 가격과 <b> 2주 전 가격</b>을 비교하여 변동 폭이 큰 상품 TOP 50을 보여줍니다.
                상품을 클릭하면 지도에서 추천 1위 매장을 바로 확인할 수 있습니다.
            </p>
            <div style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#444",
                marginBottom: "15px"
            }}>
                조사일자: <b>{list[0] ? formatDate(list[0].inspect_day) : ""}</b>
            </div>
            {!apiURL && <div>불러오는 중...</div>}

            {/* 리스트 컨테이너 */}
            <ul style={{
                listStyle: "none",
                padding: 0,
                maxHeight: "70vh",
                overflowY: "auto",
                margin: 0
            }}>
                {list.map((item, idx) => (
                    <li
                        key={item.good_id}
                        style={{
                            padding: "10px 5px",
                            borderBottom: "1px solid #eee",
                            cursor: "pointer",
                            textAlign: "left"
                        }}
                        onClick={() => {
                            localStorage.setItem("selectedGoodId", item.good_id);
                            localStorage.setItem("selectedGoodName", item.good_name);
                            localStorage.setItem("lastSearchTerm", item.good_name);
                            navigate("/map");
                        }}
                    >
                        <strong>{idx + 1}. {item.good_name}</strong>
                        <div style={{ fontSize: "14px", color: "#333", marginTop: 4 }}>
                            변동 폭:
                            <span
                                style={{
                                    color: tab === "down" ? "blue" : "red",
                                    fontWeight: 600
                                }}
                            >
                                {" "}{item.avg_drop.toLocaleString()}원
                            </span>
                            <br />
                            변동이 감지된 매장 수: {item.change_count.toLocaleString()}곳
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
}

export default PriceChange;
