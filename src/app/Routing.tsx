/**
 * File: app/Routing.tsx
 * Description:
 *   StoreRader의 전역 라우팅 엔트리
 *   인증 컨텍스트 적용, 네트워크 상태 기반 UI 제어,
 *   페이지별 네비게이션 노출 조건을 처리한다
 */

import Home from '../pages/Home.tsx';
import MyPage from '../pages/MyInfo.tsx';
import MapPage from '../pages/Map.tsx';
import SearchPage from '../pages/Search.tsx'
import MaintenancePage from "../features/status/components/MaintenencePage.tsx";
import Navigation from './Navigation';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext.tsx";
import { useRouteStatusCheck } from '../features/status/hooks/useRouteStatusCheck.ts';
import { NetworkAlertPopup } from '../features/status/components/NetworkAlertPopup.tsx';
import App from './App.tsx';

/**
 * 전역 인증 컨텍스트와 브라우저 라우터를 초기화하는 상위 라우팅 컴포넌트
 */
function Routing() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <RoutingContents />
            </BrowserRouter>
        </AuthProvider>
    );
}

/**
 * 라우팅 처리 + 네트워크 상태 감지 + 페이지별 네비게이션 표시 제어 담당
 */
function RoutingContents() {
    const { networkPopup, setNetworkPopup, online } = useRouteStatusCheck();
    return (
        <>
            {/* 네트워크 끊김 감지 팝업 */}
            <NetworkAlertPopup
                visible={networkPopup}
                onRetry={() => {
                    if (online) setNetworkPopup(false);
                }}
            />

            <Navigation />

            {/* 애플리케이션 라우트 구성 */}
            <Routes>
                <Route path='/' element={<App />} />
                <Route path='/home' element={<Home />} />
                <Route path='/map' element={<MapPage />} />
                <Route path='/myInfo' element={<MyPage />} />
                <Route path='/search' element={<SearchPage />} />
                <Route path='/maintenance' element={<MaintenancePage />} />
            </Routes>
        </>
    );
}

export default Routing;
