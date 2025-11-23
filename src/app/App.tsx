/***********************************************************
 App.tsx는 StoreRader의 메인 화면(초기 화면)을 정의한다
***********************************************************/

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNetworkStatus } from "../features/status/hooks/useNetworkCheck";
import { checkServerHealth } from "../features/status/api/checkServerHealth";

function App() {
    const navigate = useNavigate();
    const online = useNetworkStatus();

    useEffect(() => {
        const tryNavigate = async () => {
            // 네트워크 OFF -> 홈 이동 금지
            if (!online) return;

            // 서버 상태 체크
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