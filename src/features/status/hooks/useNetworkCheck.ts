/**
 * File: features/status/hooks/useNetworkStatus.ts
 * Description:
 *   브라우저의 online/offline 이벤트를 감지하여
 *   현재 네트워크 연결 상태(온라인 여부)를 반환한다
 */

import { useEffect, useState } from "react";

export function useNetworkStatus() {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);

        window.addEventListener("online", on);
        window.addEventListener("offline", off);

        return () => {
            window.removeEventListener("online", on);
            window.removeEventListener("offline", off);
        };
    }, []);

    return online;
}
