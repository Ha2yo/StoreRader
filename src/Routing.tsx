import App from './App';
import Home from './pages/Home.tsx';
import MyPage from './pages/MyPage.tsx';
import Navigation from './Navigation';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";

function Routing() {
    return (
        <AuthProvider>
            <div className="App">
                <BrowserRouter>
                    <Navigation />
                    <Routes>
                        <Route path='/' element={<App />} />
                        <Route path='/home' element={<Home />} />
                        <Route path='/mypage' element={<MyPage />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </AuthProvider>
    );
}

export default Routing;