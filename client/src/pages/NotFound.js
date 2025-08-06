import { Button, Col, Container, Row } from 'react-bootstrap';
import { FaHome, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <div className="mb-4">
            <h1 className="display-1 fw-bold text-primary">404</h1>
            <h2 className="mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Button as={Link} to="/" variant="primary" size="lg">
              <FaHome className="me-2" />
              Go Home
            </Button>
            <Button as={Link} to="/products" variant="outline-primary" size="lg">
              <FaSearch className="me-2" />
              Browse Products
            </Button>
          </div>
          
          <div className="mt-5">
            <p className="text-muted">
              If you think this is an error, please{' '}
              <a href="mailto:support@mernstore.com" className="text-decoration-none">
                contact support
              </a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;