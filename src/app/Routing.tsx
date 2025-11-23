import Home from '../pages/Home.tsx';
import MyPage from '../pages/MyInfo.tsx';
import MapPage from '../pages/Map.tsx';
import SearchPage from '../pages/Search.tsx'
import MaintenancePage from "../features/status/components/MaintenencePage.tsx";
import Navigation from './Navigation';
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext.tsx";
import { useRouteStatusCheck } from '../features/status/hooks/useRouteStatusCheck.ts';
import { NetworkAlertPopup } from '../features/status/components/NetworkAlertPopup.tsx';
import App from './App.tsx';

function Routing() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <RoutingContents />
            </BrowserRouter>
        </AuthProvider>
    );
}

function RoutingContents() {
    const { networkPopup, setNetworkPopup, online } = useRouteStatusCheck();


    const location = useLocation();
    const hideNav = location.pathname === "/maintenance" || location.pathname === "/";

    return (
        <>
            <NetworkAlertPopup
                visible={networkPopup}
                onRetry={() => {
                    if (online) setNetworkPopup(false);
                }}
            />
            {!hideNav && <Navigation />}

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
