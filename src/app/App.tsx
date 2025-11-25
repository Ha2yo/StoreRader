/**
 * File: app/App.tsx
 * Description:
 *   StoreRader의 초기 진입 화면
 *   네트워크 및 서버 상태를 확인한 뒤 홈 화면으로 라우팅한다
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNetworkStatus } from "../features/status/hooks/useNetworkCheck";
import { checkServerHealth } from "../features/status/api/checkServerHealth";

function App() {
    const navigate = useNavigate();
    const online = useNetworkStatus();

    localStorage.removeItem("lastSearchTerm");
    localStorage.removeItem("selectedGoodName");

    useEffect(() => {
        const tryNavigate = async () => {
            // 오프라인 상태에서는 초기 이동 중단
            if (!online) return;

            // 서버 상태가 정상일 때만 홈 화면으로 이동
            const status = await checkServerHealth();
            if (status === "ok") {
                localStorage.removeItem("lastSearchTerm");
                localStorage.removeItem("selectedGoodName");
                navigate("/home");
            }
        };

        tryNavigate();
    }, [online]);

    return (
        <div className='container'>
        </div>
    );
}

export default App;