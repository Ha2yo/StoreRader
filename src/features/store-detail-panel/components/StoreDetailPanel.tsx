/**
 * File: features/store-detail-panel/components/StoreDetailPanel.tsx
 * Description:
 *   매장 상세 정보(주소, 전화번호, 거리)를 보여주고
 *   네이버/카카오 길찾기 실행 및 사용자 선택 로그를 기록하는 패널
 */

import { useState } from "react";
import { openUrl } from '@tauri-apps/plugin-opener'
import { Props } from "../types/StoreDetail.types";
import { calcDistance } from "../../../utils/calcDistance";
import { loadSavedPosition } from "../../../utils/loadSavedPos";
import { determinePreferenceType } from "../utils/determinePrefType";
import { logUserSelection } from "../utils/logUserSelection";
import { touchEffect } from "../../../utils/touchEffect";
import { fetchPreferenceThreshold } from "../api/fetchPreferenceThreshold";

function StoreDetailPanel({ store, candidates, goodId, onClose }: Props) {
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

    // 사용자 위치 및 매장까지의 거리 계산
    const pos = loadSavedPosition();
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
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
                    padding: "20px 20px 30px 20px",
                    paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
                    zIndex: 2000
                }}
            >
                {/* 매장 기본 정보 */}
                <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>{store.store_name}</h3>
                <p style={{ fontSize: "15px", color: "#777", marginBottom: "4px" }}>{store.road_addr}</p>
                <p style={{ fontSize: "14px", color: "#777", marginBottom: "14px" }}>{store.jibun_addr}</p>
                <p style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#555",
                    marginBottom: "10px"
                }}>📞 {store.tel_no ?? "전화번호 없음"}</p>

                {distanceKm && (
                    <p style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                        color: "#555",
                        marginBottom: "22px"
                    }}>{distanceKm} km</p>
                )}

                {/* 길찾기 & 닫기 */}
                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                    <button
                        {...touchEffect}
                        style={{
                            flex: 1,
                            background: "#3182F6",
                            color: "#fff",
                            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                            padding: "12px 0",
                            borderRadius: "12px",
                            border: "none",
                            fontSize: "16px",
                            fontWeight: "bold"
                        }}
                        onClick={() => setIsRouteModalOpen(true)}
                    >
                        길찾기
                    </button>

                    <button
                        {...touchEffect}
                        style={{
                            flex: 1,
                            background: "#F3F4F6",
                            color: "#555",
                            textShadow: "0 1px 1px rgba(0,0,0,0.05)",
                            padding: "12px 0",
                            borderRadius: "12px",
                            border: "none",
                            fontSize: "16px",
                            fontWeight: "bold"
                        }}
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>

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
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        backdropFilter: "blur(1px)",
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
                            borderRadius: "20px",
                            padding: "24px 20px",
                            width: "85%",
                            maxWidth: "380px",
                            textAlign: "center",
                            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: "20px",
                                fontSize: "18px",
                                fontWeight: 600
                            }}>
                            길찾기 앱 선택</h3>

                        {/* 네이버 지도 / 카카오맵 */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "14px",
                            }}
                        >
                            {/* 네이버 지도 */}
                            <button
                                {...touchEffect}
                                style={{
                                    flex: 1,
                                    aspectRatio: "1",
                                    borderRadius: "14px",
                                    background: "#fff",
                                    border: "none",
                                    boxShadow: "none",
                                    color: "#fff",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
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
                                        const threshold = await fetchPreferenceThreshold();
                                        const preferenceType = determinePreferenceType(store, candidates, threshold);
                                        await logUserSelection(store, goodId, preferenceType);
                                        await openUrl(naverMApUrl);
                                    }
                                }}
                            >
                                <img
                                    src="/navermap.png"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "20%",
                                    }} />
                            </button>

                            {/* 카카오맵 */}
                            <button
                                {...touchEffect}
                                style={{
                                    flex: 1,
                                    aspectRatio: "1",
                                    borderRadius: "14px",
                                    background: "#fff",
                                    border: "none",
                                    boxShadow: "none",
                                    color: "#3A1D1D",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
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
                                        const threshold = await fetchPreferenceThreshold();
                                        const preferenceType = determinePreferenceType(store, candidates, threshold);
                                        await logUserSelection(store, goodId, preferenceType);
                                        await openUrl(kakaoMapUrl);
                                    }
                                }}
                            >
                                <img
                                    src="/kakaomap.png"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "20%",
                                    }} />
                            </button>


                        </div>
                        {/* 닫기 */}
                        <button
                            {...touchEffect}
                            style={{
                                marginTop: "20px",
                                width: "100%",
                                padding: "14px",
                                borderRadius: "14px",
                                background: "#f5f5f5",
                                border: "none",
                                color: "#333",
                                fontSize: "16px",
                                fontWeight: 500,
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
