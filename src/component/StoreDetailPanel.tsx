import { useState } from "react";
import { openUrl } from '@tauri-apps/plugin-opener'
import { invoke } from "@tauri-apps/api/core";

// 매장 정보 인터페이스 
interface Store {
    id: number;
    store_id: string;
    store_name: string;
    tel_no: string | null;
    post_no: string | null;
    jibun_addr: string;
    road_addr: string;
    x_coord: number | null;
    y_coord: number | null;
    price?: number | null;
    distance?: number | null;
    inspect_day?: string | null;
}

interface Props {
    store: Store;
    candidates: Store[];
    goodId: string | null;
    onClose: () => void;
}

function StoreDetailPanel({ store, candidates, goodId, onClose }: Props) {
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

    // 전역 위치 정보 (사용자 현재 위치)
    function loadSavedPosition() {
        const saved = localStorage.getItem("lastPosition");
        if (!saved) return null;

        const pos = JSON.parse(saved);
        return pos; // { lat, lng, accuracy }
    }

    // 매장과의 거리 구하기 (하버사인 공식 활용)
    function getDistance(
        slat: number, slng: number, dlat: number, dlng: number) {
        const radius = 6371;
        const toRadian = Math.PI / 180;

        const deltaLat = Math.abs(slat - dlat) * toRadian;
        const deltaLng = Math.abs(slng - dlng) * toRadian;

        const sinDeltaLat = Math.sin(deltaLat / 2);
        const sinDeltaLng = Math.sin(deltaLng / 2);
        const squareRoot = Math.sqrt(
            sinDeltaLat * sinDeltaLat +
            Math.cos(slat * toRadian) * Math.cos(dlat * toRadian) * sinDeltaLng * sinDeltaLng);

        const distance = 2 * radius * Math.asin(squareRoot);

        return distance;
    }

    function determinePreferenceType(selected: Store, candidates: Store[]) {
        if (!candidates || candidates.length === 0) return "neutral";
        if (!selected.price || !selected.distance) return "neutral";

        // 후보 평균 계산
        const avgPrice = candidates.reduce((sum, s) => sum + (s.price ?? 0), 0) / candidates.length;
        const avgDist = candidates.reduce((sum, s) => sum + (s.distance ?? 0), 0) / candidates.length;

        // 상대 비율 차이 계산
        const priceFocus = (avgPrice - selected.price) / avgPrice;      // 양수면 평균보다 저렴 → 가격 중심
        const distanceFocus = (avgDist - selected.distance) / avgDist;  // 양수면 평균보다 가까움 → 거리 중심

        // 판단 기준 (10% 이상 차이 시 의미 있는 차이로 간주)
        const threshold = 0.1;
        const tolerance = 0.05; // 보조 구간

        if (priceFocus > threshold && distanceFocus < tolerance) {
            return "price"; // 가격 중심
        } else if (distanceFocus > threshold && priceFocus < tolerance) {
            return "distance"; // 거리 중심
        } else {
            return "neutral"; // 중립적 선택
        }
    }

    async function logUserSelection(store: Store, goodId: string | null, preferenceType: String) {
        try {
            const jwt = localStorage.getItem("jwt");
            if (!jwt) {
                console.warn("JWT 없음 -> 비로그인 사용자");
                return;
            }

            const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

            const payload = {
                store_id: store.store_id,
                good_id: goodId,
                price: store.price,
                preference_type: preferenceType,
                
            };
            console.log("서버 전송 데이터:", payload);

            const res = await fetch(`${apiURL}/update/userSelectionLog`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text();
                console.error("로그 저장 실패:", text);
            } else {
                console.log("로그 저장 완료");
            }
        } catch (err) {
            console.error("로그 저장 중 오류:", err);
        }
    }

    // 사용자 위치 얻기
    const pos = loadSavedPosition();
    // 매장과의 거리 얻기
    const distanceKm = getDistance(pos.lat, pos.lng, store.x_coord!, store.y_coord!).toFixed(2)
    return (
        <>
            {/* 상세 패널 */}
            <div
                style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    background: "#fff",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    boxShadow: "0 -4px 10px rgba(0,0,0,0.2)",
                    padding: "16px",
                    paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
                    zIndex: 2000,
                    maxHeight: "100vh",
                }}
            >
                {/* 매장 기본 정보 */}
                <h3 style={{ margin: "0 0 8px 0" }}>{store.store_name}</h3>
                <p>{store.road_addr}</p>
                <p>{store.jibun_addr}</p>
                <p>📞 {store.tel_no ?? "전화번호 없음"}</p>

                {distanceKm && (
                    <p>{distanceKm} km</p>
                )}

                {/* 길찾기 버튼 */}
                <button
                    style={{
                        flex: 1,
                        padding: "10px",
                        background: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                    }}
                    onClick={() => setIsRouteModalOpen(true)}
                >
                    길찾기
                </button>
                {/* 닫기 버튼 */}
                <button
                    style={{
                        flex: 1,
                        padding: "10px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        marginLeft: "10px"
                    }}
                    onClick={onClose}
                >
                    닫기
                </button>

            </div>

            {/* 길찾기 선택 모달 */}
            {isRouteModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3000,
                    }}
                    onClick={() => setIsRouteModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: "12px",
                            padding: "20px",
                            width: "80%",
                            maxWidth: "360px",
                            textAlign: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                    >
                        <h3>길찾기 앱 선택</h3>

                        {/* 네이버 지도 */}
                        <button
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "12px",
                                background: "#2DB400",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                            }}
                            onClick={async () => {
                                if (store.x_coord && store.y_coord) {
                                    const slat = pos.lat;
                                    const slng = pos.lng;
                                    const sname = encodeURIComponent("내 위치");
                                    const dlat = store.x_coord;
                                    const dlng = store.y_coord;
                                    const dname = encodeURIComponent(store.store_name);
                                    const naverMApUrl = `nmap://route/public?slat=${slat}&slng=${slng}&sname=${sname}&dlat=${dlat}&dlng=${dlng}&dname=${dname}&appname=com.ik9014.storerader`
                                    await openUrl(naverMApUrl);

                                    const preferenceType = determinePreferenceType(store, candidates);
                                    await logUserSelection(store, goodId, preferenceType);
                                }
                            }}
                        >
                            네이버 지도 길찾기
                        </button>

                        {/* 카카오맵 */}
                        <button
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "10px",
                                background: "#FEE500",
                                color: "#3C1E1E",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                            }}
                            onClick={async () => {
                                if (store.x_coord && store.y_coord) {
                                    const slat = pos.lat;
                                    const slng = pos.lng;
                                    const sname = encodeURIComponent("내 위치");
                                    const dlat = store.x_coord;
                                    const dlng = store.y_coord;
                                    const dname = encodeURIComponent(store.store_name);
                                    const kakaoMapUrl = `https://map.kakao.com/link/from/${sname},${slat},${slng}/to/${dname},${dlat},${dlng}`;
                                    await openUrl(kakaoMapUrl);

                                    const preferenceType = determinePreferenceType(store, candidates);
                                    await logUserSelection(store, goodId, preferenceType);
                                }
                            }}
                        >
                            카카오맵 길찾기
                        </button>

                        {/* 취소 버튼 */}
                        <button
                            style={{
                                marginTop: "16px",
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                background: "#fff",
                            }}
                            onClick={() => setIsRouteModalOpen(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default StoreDetailPanel;
