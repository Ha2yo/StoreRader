/***********************************************************
 Navigation.tsx는 StoreRader 앱의 하단 내비게이션 바를 정의한다
 각 주요 페이지로 이동할 수 있는 공통 UI 컴포넌트 역할을 수행한다

 1. Navbar: 하단 고정 바

 2. Nav.Link: Home / Mypage로의 이동 버튼
              (해당 영역 클릭 시 각 페이지로 이동)
***********************************************************/

import 'bootstrap/dist/css/bootstrap.min.css';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const { pathname } = useLocation();

  const activeColor = "#007AFF";
  const inactiveColor = "#000";

  const iconStyle = (isActive: boolean) => ({
    transition: "transform 0.3s ease, stroke 0.3s ease",
    transform: isActive ? "scale(1.25)" : "scale(1)",
    transformOrigin: "center center",
  });

  const hideNav = location.pathname === "/search";
  if (hideNav) return null;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        height: "70px",
        background: "#fff",
        borderRadius: "25px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <Nav.Link as={Link} to="/home"><svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={(pathname === "/" || pathname === "/home") ? activeColor : inactiveColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={iconStyle(pathname === "/" || pathname === "/home")}
      >
        <path d="M3 10L12 3l9 7" />
        <path d="M9 21V12h6v9" />
      </svg></Nav.Link>
      <Nav.Link as={Link} to="/map"> <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={pathname === "/map" ? activeColor : inactiveColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={iconStyle(pathname === "/map")}
      >

        <path d="M1 6l7-3 7 3 8-3v14l-8 3-7-3-7 3V6z" />
        <path d="M8 3v14" />
        <path d="M15 6v14" />
      </svg></Nav.Link>
      <Nav.Link as={Link} to="/myInfo"><svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke={pathname === "/myInfo" ? activeColor : inactiveColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={iconStyle(pathname === "/myInfo")}
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </svg>
      </Nav.Link>
    </nav>
  );
}

export default Navigation;
