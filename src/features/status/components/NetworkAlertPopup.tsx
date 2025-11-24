/**
 * File: features/status/components/NetworkAlertPopup.tsx
 * Description:
 *   기기가 오프라인일 때 화면 중앙에 표시되는 네트워크 경고 모달
 */

import { touchEffect } from "../../../utils/touchEffect";
type NetworkAlertPopupProps = {
    visible: boolean;
    onRetry: () => void;
};

export function NetworkAlertPopup({ visible, onRetry }: NetworkAlertPopupProps) {
    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "24px 28px",
                    borderRadius: "14px",
                    width: "80%",
                    maxWidth: "320px",
                    textAlign: "center",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                }}
            >
                <p style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>
                    ⚠ 네트워크 연결 없음
                </p>

                <p style={{ fontSize: "14px", marginBottom: "20px", color: "#555" }}>
                    인터넷 연결을 확인한 후 다시 시도해주세요.
                </p>

                <button
                    {...touchEffect}
                    onClick={onRetry}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        background: "#007aff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    다시 시도
                </button>
            </div>
        </div>
    );
}
