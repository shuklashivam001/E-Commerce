import { Badge, Button, Card } from 'react-bootstrap';
import { FaEye, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product._id, 1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-warning" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-warning" style={{ opacity: 0.5 }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-muted" />);
    }

    return stars;
  };

  const discountPercentage = product.discount || 0;
  const discountedPrice = product.price - (product.price * discountPercentage / 100);

  return (
    <Card className="product-card h-100 border-0 shadow-sm">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={product.images?.[0]?.url || '/api/placeholder/300/200'}
          alt={product.name}
          className="product-image"
          style={{ height: '200px', objectFit: 'cover' }}
        />
        {discountPercentage > 0 && (
          <Badge className="discount-badge position-absolute top-0 end-0 m-2">
            -{discountPercentage}%
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
            <Badge bg="danger" className="fs-6">Out of Stock</Badge>
          </div>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <Badge bg="secondary" className="mb-2">{product.category}</Badge>
          {product.brand && (
            <Badge bg="outline-primary" className="ms-1 mb-2">{product.brand}</Badge>
          )}
        </div>

        <Card.Title className="text-truncate-2 mb-2" style={{ fontSize: '1rem' }}>
          <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </Card.Title>

        <Card.Text className="text-muted text-truncate-3 small mb-3" style={{ fontSize: '0.9rem' }}>
          {product.description}
        </Card.Text>

        {/* Rating */}
        <div className="d-flex align-items-center mb-2">
          <div className="me-2">
            {renderStars(product.ratings?.average || 0)}
          </div>
          <small className="text-muted">
            ({product.ratings?.count || 0} reviews)
          </small>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="d-flex align-items-center">
            <span className="price-text me-2">
              ${discountedPrice.toFixed(2)}
            </span>
            {discountPercentage > 0 && (
              <span className="original-price">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto">
          <div className="d-flex gap-2">
            <Button
              as={Link}
              to={`/products/${product._id}`}
              variant="outline-primary"
              size="sm"
              className="flex-fill"
            >
              <FaEye className="me-1" />
              View
            </Button>
            
            {isAuthenticated && product.stock > 0 && (
              <Button
                variant={isInCart(product._id) ? "success" : "primary"}
                size="sm"
                className="flex-fill"
                onClick={handleAddToCart}
                disabled={isInCart(product._id)}
              >
                <FaShoppingCart className="me-1" />
                {isInCart(product._id) ? 'In Cart' : 'Add to Cart'}
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;