import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { FaHeadset, FaShieldAlt, FaShippingFast, FaShoppingBag } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ProductCard from '../components/Common/ProductCard';
import { productsAPI } from '../services/api';

const Home = () => {
  // Fetch featured products
  const { data: featuredProducts, isLoading } = useQuery(
    'featuredProducts',
    productsAPI.getFeaturedProducts,
    {
      select: (response) => response.data,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const categories = [
    { name: 'Electronics', icon: '📱', color: 'primary' },
    { name: 'Clothing', icon: '👕', color: 'success' },
    { name: 'Books', icon: '📚', color: 'info' },
    { name: 'Home & Garden', icon: '🏠', color: 'warning' },
    { name: 'Sports', icon: '⚽', color: 'danger' },
    { name: 'Beauty', icon: '💄', color: 'secondary' },
  ];

  const features = [
    {
      icon: <FaShippingFast size={40} />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $100'
    },
    {
      icon: <FaShieldAlt size={40} />,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: <FaHeadset size={40} />,
      title: '24/7 Support',
      description: 'Round the clock customer support'
    },
    {
      icon: <FaShoppingBag size={40} />,
      title: 'Easy Returns',
      description: '30-day hassle-free returns'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to MERN Store
              </h1>
              <p className="lead mb-4">
                Discover amazing products at unbeatable prices. Shop from thousands of items 
                across multiple categories with fast delivery and excellent customer service.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/products" variant="light" size="lg">
                  Shop Now
                </Button>
                <Button as={Link} to="/products?featured=true" variant="outline-light" size="lg">
                  Featured Products
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-image">
                <span style={{ fontSize: '15rem' }}>🛒</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Card className="text-center border-0 h-100">
                  <Card.Body>
                    <div className="text-primary mb-3">
                      {feature.icon}
                    </div>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="display-5 fw-bold mb-3">Shop by Category</h2>
              <p className="lead text-muted">
                Browse our wide selection of products across different categories
              </p>
            </Col>
          </Row>
          <Row>
            {categories.map((category, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card 
                  as={Link} 
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="category-card border-0 shadow-sm h-100 text-decoration-none"
                >
                  <Card.Body className="text-center py-4">
                    <div className="mb-3" style={{ fontSize: '3rem' }}>
                      {category.icon}
                    </div>
                    <Card.Title className={`text-${category.color}`}>
                      {category.name}
                    </Card.Title>
                    <Card.Text className="text-muted">
                      Explore our {category.name.toLowerCase()} collection
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Products Section */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="display-5 fw-bold mb-3">Featured Products</h2>
              <p className="lead text-muted">
                Check out our handpicked selection of trending products
              </p>
            </Col>
          </Row>

          {isLoading ? (
            <LoadingSpinner text="Loading featured products..." />
          ) : (
            <Row>
              {featuredProducts?.slice(0, 8).map((product) => (
                <Col md={6} lg={3} key={product._id} className="mb-4">
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}

          <Row className="mt-4">
            <Col className="text-center">
              <Button as={Link} to="/products" variant="primary" size="lg">
                View All Products
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} className="text-center">
              <h3 className="mb-3">Stay Updated</h3>
              <p className="mb-4">
                Subscribe to our newsletter and get notified about new products and exclusive offers.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  style={{ maxWidth: '300px' }}
                />
                <Button variant="light">
                  Subscribe
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;