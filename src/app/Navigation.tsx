/**
 * File: app/Navigation.tsx
 * Description:
 *   StoreRader 앱의 하단 내비게이션 바를 구성하는 공통 UI 컴포넌트.
 *
 * Responsibilities:
 *   1. 하단 고정 네비게이션 UI 렌더링
 *   2. 현재 URL 경로(pathname)에 따른 아이콘 활성화 처리
 *   3. 특정 페이지에서는 네비게이션 바를 숨김
 */

import 'bootstrap/dist/css/bootstrap.min.css';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const { pathname } = useLocation();

  const activeColor = "#007AFF";
  const inactiveColor = "#000";


  // 현재 페이지가 활성 상태일 때 아이콘을 확대하고 색상을 변경한다.
  const iconStyle = (isActive: boolean) => ({
    transition: "transform 0.3s ease, stroke 0.3s ease",
    transform: isActive ? "scale(1.25)" : "scale(1)",
    transformOrigin: "center center",
  });

  // 특정 페이지에서 네비게이션 바를 숨긴다
  const hideNav =
    location.pathname === "/" ||
    location.pathname === "/search" ||
    location.pathname === "/maintenance";
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
      {/* Home 버튼 */}
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

      {/* Map 버튼 */}
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

      {/* MyInfo 버튼 */}
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
