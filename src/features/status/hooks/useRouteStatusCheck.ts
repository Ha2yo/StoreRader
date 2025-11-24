/**
 * File: features/status/hooks/useRouteStatusCheck.ts
 * Description:
 *   라우트 변경 시 네트워크 상태와 서버 상태를 점검하여
 *   - 오프라인이면 네트워크 안내 팝업을 표시하고
 *   - 서버가 다운되면 유지보수 페이지로 이동시킨다
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkServerHealth } from "../api/checkServerHealth";
import { useNetworkStatus } from "./useNetworkCheck";

export function useRouteStatusCheck() {
    const navigate = useNavigate();
    const location = useLocation();
    const online = useNetworkStatus();
    const prevPath = useRef(location.pathname);
    const [networkPopup, setNetworkPopup] = useState(false);

    useEffect(() => {
        if (location.pathname === "/maintenance") return;

        // 페이지 이동 감지
        const pageChanged = prevPath.current !== location.pathname;
        prevPath.current = location.pathname;

        // 1) 클라이언트 네트워크 체크
        if (pageChanged) {
            if (!online) {
                setNetworkPopup(true);
                return;
            }
        }

        // 2) 서버 체크
        const checkServer = async () => {
            if (!online) {
                setNetworkPopup(true);
                return;
            }
            const status = await checkServerHealth();
            if (status === "down") {
                navigate("/maintenance");
            }
        };

        checkServer();

    }, [location.pathname]);
    return { networkPopup, setNetworkPopup, online };
}
