/***********************************************************
 Navigation.tsx는 StoreRader 앱의 하단 내비게이션 바를 정의한다
 각 주요 페이지로 이동할 수 있는 공통 UI 컴포넌트 역할을 수행한다

 1. Navbar: 하단 고정 바

 2. Nav.Link: Home / Mypage로의 이동 버튼
              (해당 영역 클릭 시 각 페이지로 이동)
***********************************************************/

import 'bootstrap/dist/css/bootstrap.min.css';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation() {
  
  return (
    <Navbar fixed="bottom" bg="light" className="safe-area-navbar">
      <Nav className="w-100 justify-content-around">
        <Nav.Link as={Link} to="/home">Home</Nav.Link>
        <Nav.Link as={Link} to="/map">Map</Nav.Link>
        <Nav.Link as={Link} to="/mypage">My Info</Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default Navigation;