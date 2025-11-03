/***********************************************************
 Routing.tsx는 StoreRader 프론트엔드의 라우팅 구조를 정의하고,
 AuthProvider를 적용하는 역할을 담당한다

 1. AuthProvider
    - 전역 인증 상태 관리 (로그인 정보, 사용자 세션 등)

 2. Navigation
    - 공통 내비게이션 바 렌더링

 3. 라우터 구성
    - "/" -> App (메인 화면)
    - "/home" -> Home (검색/메인 기능 화면)
    - "/mypage" -> MyPage (사용자 정보 및 계정 관리 화면)
***********************************************************/

import App from './App';
import Home from './pages/Home';
import MyPage from './pages/MyPage.tsx';
import MapPage from './pages/MapPage';
import SearchPage from './pages/SearchPage'
import Navigation from './Navigation';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import StoreDetailPage from './pages/StoreDetailPage.tsx';

function Routing() {
    return (
        <AuthProvider>
            <div>
                <BrowserRouter>
                    <Navigation />
                    <Routes>
                        <Route path='/' element={<App />} />
                        <Route path='/home' element={<Home />} />
                        <Route path='/map' element={<MapPage />} />
                        <Route path='/mypage' element={<MyPage />} />
                        <Route path='/search' element={<SearchPage />} />
                        <Route path="/store/:storeId" element={<StoreDetailPage />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </AuthProvider>
    );
}

export default Routing;