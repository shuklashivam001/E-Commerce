import { Col, Container, Row } from 'react-bootstrap';
import { FaEnvelope, FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light mt-5">
      <Container>
        <Row className="py-4">
          {/* Company Info */}
          <Col md={4} className="mb-4">
            <h5 className="text-primary mb-3">🛒 MERN Store</h5>
            <p className="text-muted">
              Your one-stop destination for quality products at affordable prices. 
              We offer a wide range of products with fast delivery and excellent customer service.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-light">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-light">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-light">
                <FaLinkedin size={20} />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col md={2} className="mb-4">
            <h5 className="text-primary mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-muted text-decoration-none">
                  Products
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-muted text-decoration-none">
                  Contact
                </Link>
              </li>
            </ul>
          </Col>

          {/* Categories */}
          <Col md={2} className="mb-4">
            <h5 className="text-primary mb-3">Categories</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products?category=Electronics" className="text-muted text-decoration-none">
                  Electronics
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Clothing" className="text-muted text-decoration-none">
                  Clothing
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Books" className="text-muted text-decoration-none">
                  Books
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=Home & Garden" className="text-muted text-decoration-none">
                  Home & Garden
                </Link>
              </li>
            </ul>
          </Col>

          {/* Customer Service */}
          <Col md={2} className="mb-4">
            <h5 className="text-primary mb-3">Customer Service</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Returns
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Shipping Info
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none">
                  Track Order
                </a>
              </li>
            </ul>
          </Col>

          {/* Contact Info */}
          <Col md={2} className="mb-4">
            <h5 className="text-primary mb-3">Contact Info</h5>
            <div className="text-muted">
              <div className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                123 Store Street, City, State 12345
              </div>
              <div className="mb-2">
                <FaPhone className="me-2" />
                +1 (555) 123-4567
              </div>
              <div className="mb-2">
                <FaEnvelope className="me-2" />
                support@mernstore.com
              </div>
            </div>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <Row className="border-top pt-3">
          <Col md={6}>
            <p className="text-muted mb-0">
              &copy; {new Date().getFullYear()} MERN Store. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="d-flex justify-content-md-end gap-3">
              <a href="#" className="text-muted text-decoration-none">
                Privacy Policy
              </a>
              <a href="#" className="text-muted text-decoration-none">
                Terms of Service
              </a>
              <a href="#" className="text-muted text-decoration-none">
                Cookie Policy
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;