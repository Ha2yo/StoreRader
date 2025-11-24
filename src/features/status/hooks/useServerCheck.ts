/**
 * File: features/network/hooks/useServerCheck.ts
 * Description:
 *   서버 상태를 자동 또는 수동으로 확인하여
 *   - 서버 오류 시: 서버 점검 페이지로 이동
 *   - 정상 응답 시: 홈 화면으로 이동
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkServerHealth } from "../api/checkServerHealth";

// 라우트 진입 시 자동으로 서버 상태 점검
export function useServerAutoCheck(online: boolean) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!online) return;

        const check = async () => {
            const status = await checkServerHealth();
            if (status == "down")
                navigate("/maintenance")
            else if (status == "ok")
                navigate("/home");
        };

        check();
    }, []);
}

// 수동으로 서버 상태 점검
export function useServerCheck() {
    const navigate = useNavigate();

    return async () => {
        const status = await checkServerHealth();

        if (status === "ok") {
            navigate("/home");
        }
    };
}