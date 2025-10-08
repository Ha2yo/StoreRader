import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <Navbar fixed="bottom" bg="primary" data-bs-theme="dark" className="safe-area-navbar">
      <Nav className="w-100 justify-content-around">
        <Nav.Link as={Link} to="/home">Home</Nav.Link>
        <Nav.Link as={Link} to="/mypage">page</Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default Navigation;