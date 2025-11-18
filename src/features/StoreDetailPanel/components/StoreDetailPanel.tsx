import { useState } from "react";
import { openUrl } from '@tauri-apps/plugin-opener'
import { Props } from "../types/StoreDetail.types";
import { calcDistance } from "../../../utils/calcDistance";
import { loadSavedPosition } from "../../../utils/loadSavedPos";
import { determinePreferenceType } from "../utils/determinePrefType";
import { logUserSelection } from "../utils/logUserSelection";

function StoreDetailPanel({ store, candidates, goodId, onClose }: Props) {
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

    // 사용자 위치 얻기
    const pos = loadSavedPosition();
    // 매장과의 거리 얻기
    const distanceKm = calcDistance(pos.lat, pos.lng, store.x_coord!, store.y_coord!).toFixed(2)

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
