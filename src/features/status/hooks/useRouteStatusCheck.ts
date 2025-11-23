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

        // 1) 클라이언트 네트워크 체크
        const pageChanged = prevPath.current !== location.pathname;
        prevPath.current = location.pathname;
        if (pageChanged) {
            // 네트워크 꺼져 있으면 팝업 표시
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
