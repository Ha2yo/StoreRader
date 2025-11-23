import appIcon from "../../../assets/newIcon.png";
import { touchEffect } from "../../StoreDetailPanel/utils/touchEffect";
import { useServerCheck } from "../hooks/useServerCheck";

export default function MaintenancePage() {
    const retryCheck = useServerCheck();
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "#f5f6f8",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    width: "90%",
                    maxWidth: "420px",
                    padding: "40px 28px",
                    borderRadius: "16px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                    textAlign: "center",
                }}
            >
                <img
                    src={appIcon}
                    alt="StoreRader Icon"
                    style={{
                        width: "70px",
                        height: "70px",
                        marginBottom: "20px",
                        borderRadius: "16px",
                        objectFit: "cover",
                    }}
                />

                <h1
                    style={{
                        fontSize: "24px",
                        marginBottom: "16px",
                        color: "#333",
                        fontWeight: 700,
                    }}
                >
                    서버 점검 중입니다
                </h1>

                <p style={{ fontSize: "15px", color: "#555", marginBottom: "8px" }}>
                    현재 서버가 응답하지 않고 있습니다.
                </p>
                <p style={{ fontSize: "15px", color: "#555" }}>
                    잠시 후 다시 시도해주세요.
                </p>
                <button
                    {...touchEffect}
                    onClick={retryCheck}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        background: "#007aff",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: 600,
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                    }}
                >
                    다시 시도하기
                </button>
            </div>
        </div>
    );
}
