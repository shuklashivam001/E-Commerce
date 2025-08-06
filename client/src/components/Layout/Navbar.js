import { useState } from 'react';
import { Badge, Navbar as BootstrapNavbar, Button, Container, Form, FormControl, Nav, NavDropdown } from 'react-bootstrap';
import { FaSearch, FaShoppingCart, FaSignOutAlt, FaUser, FaUserCog } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartItemCount = getCartItemCount();

  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <span className="fs-3">🛒 MERN Store</span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          {/* Search Form */}
          <Form className="d-flex mx-auto" style={{ maxWidth: '400px', width: '100%' }} onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search products..."
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-primary" type="submit">
              <FaSearch />
            </Button>
          </Form>

          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/products" className="me-3">
              Products
            </Nav.Link>

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Nav.Link as={Link} to="/cart" className="me-3 position-relative">
                  <FaShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <Badge 
                      bg="danger" 
                      className="position-absolute top-0 start-100 translate-middle rounded-pill"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Nav.Link>

                {/* User Dropdown */}
                <NavDropdown
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {user?.name}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" />
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    Orders
                  </NavDropdown.Item>
                  {isAdmin() && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/admin">
                        <FaUserCog className="me-2" />
                        Admin Dashboard
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">
                  Login
                </Nav.Link>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;