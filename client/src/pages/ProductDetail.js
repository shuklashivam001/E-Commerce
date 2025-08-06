import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { FaHeart, FaMinus, FaPlus, FaShare, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ProductCard from '../components/Common/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productsAPI } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, isInCart, getCartItem } = useCart();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  // Fetch product details
  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => productsAPI.getProduct(id),
    {
      select: (response) => response.data,
      enabled: !!id,
    }
  );

  // Fetch product suggestions
  const { data: suggestions } = useQuery(
    ['productSuggestions', id],
    () => productsAPI.getProductSuggestions(id),
    {
      select: (response) => response.data,
      enabled: !!id,
    }
  );

  // Add review mutation
  const addReviewMutation = useMutation(
    (reviewData) => productsAPI.addReview(id, reviewData),
    {
      onSuccess: () => {
        toast.success('Review added successfully');
        setReviewData({ rating: 5, comment: '' });
        queryClient.invalidateQueries(['product', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add review');
      }
    }
  );

  const handleAddToCart = async () => {
    await addToCart(product._id, quantity);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }
    addReviewMutation.mutate(reviewData);
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${i <= rating ? 'text-warning' : 'text-muted'} ${interactive ? 'cursor-pointer' : ''}`}
          onClick={interactive ? () => onRatingChange(i) : undefined}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          <h4>Product Not Found</h4>
          <p>{error.response?.data?.message || 'The product you are looking for does not exist.'}</p>
          <Button as={Link} to="/products" variant="primary">
            Browse Products
          </Button>
        </Alert>
      </Container>
    );
  }

  const discountPercentage = product.discount || 0;
  const discountedPrice = product.price - (product.price * discountPercentage / 100);
  const cartItem = getCartItem(product._id);

  return (
    <Container className="mt-4">
      <Row>
        {/* Product Images */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {product.images && product.images.length > 0 ? (
                <>
                  <div className="position-relative">
                    <img
                      src={product.images[selectedImage]?.url || '/api/placeholder/500/500'}
                      alt={product.name}
                      className="w-100"
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                    {discountPercentage > 0 && (
                      <Badge className="position-absolute top-0 end-0 m-3 fs-6" bg="danger">
                        -{discountPercentage}%
                      </Badge>
                    )}
                  </div>
                  
                  {product.images.length > 1 && (
                    <div className="p-3">
                      <Row>
                        {product.images.map((image, index) => (
                          <Col key={index} xs={3} className="mb-2">
                            <img
                              src={image.url}
                              alt={`${product.name} ${index + 1}`}
                              className={`w-100 cursor-pointer border ${selectedImage === index ? 'border-primary' : 'border-light'}`}
                              style={{ height: '80px', objectFit: 'cover' }}
                              onClick={() => setSelectedImage(index)}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                  <span className="text-muted">No image available</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Product Info */}
        <Col lg={6}>
          <div className="ps-lg-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-decoration-none">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/products" className="text-decoration-none">Products</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link 
                    to={`/products?category=${encodeURIComponent(product.category)}`} 
                    className="text-decoration-none"
                  >
                    {product.category}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {product.name}
                </li>
              </ol>
            </nav>

            <h1 className="mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="d-flex align-items-center mb-3">
              <div className="me-2">
                {renderStars(product.ratings?.average || 0)}
              </div>
              <span className="text-muted">
                ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <span className="h3 text-primary me-3">
                  ${discountedPrice.toFixed(2)}
                </span>
                {discountPercentage > 0 && (
                  <span className="h5 text-muted text-decoration-line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-3">
              {product.stock > 0 ? (
                <Badge bg="success">In Stock ({product.stock} available)</Badge>
              ) : (
                <Badge bg="danger">Out of Stock</Badge>
              )}
            </div>

            {/* Brand */}
            {product.brand && (
              <div className="mb-3">
                <strong>Brand: </strong>
                <Badge bg="secondary">{product.brand}</Badge>
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <p className="text-muted">{product.description}</p>
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && isAuthenticated && (
              <div className="mb-4">
                <Row className="align-items-center">
                  <Col xs="auto">
                    <strong>Quantity:</strong>
                  </Col>
                  <Col xs="auto">
                    <div className="d-flex align-items-center border rounded">
                      <Button
                        variant="link"
                        size="sm"
                        className="border-0"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <FaMinus />
                      </Button>
                      <span className="px-3">{quantity}</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="border-0"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-3 mb-4">
              {isAuthenticated && product.stock > 0 && (
                <Button
                  variant={isInCart(product._id) ? "success" : "primary"}
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isInCart(product._id)}
                  className="flex-fill"
                >
                  <FaShoppingCart className="me-2" />
                  {isInCart(product._id) ? 
                    `In Cart (${cartItem?.quantity})` : 
                    'Add to Cart'
                  }
                </Button>
              )}
              
              <Button variant="outline-secondary" size="lg">
                <FaHeart />
              </Button>
              
              <Button variant="outline-secondary" size="lg">
                <FaShare />
              </Button>
            </div>

            {!isAuthenticated && (
              <Alert variant="info">
                <Link to="/login" className="text-decoration-none">Login</Link> to add items to cart
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      <Row className="mt-5">
        <Col>
          <Tabs defaultActiveKey="description" className="mb-3">
            <Tab eventKey="description" title="Description">
              <Card>
                <Card.Body>
                  <p>{product.description}</p>
                  
                  {product.specifications && product.specifications.length > 0 && (
                    <div className="mt-4">
                      <h5>Specifications</h5>
                      <table className="table table-striped">
                        <tbody>
                          {product.specifications.map((spec, index) => (
                            <tr key={index}>
                              <td><strong>{spec.key}</strong></td>
                              <td>{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="reviews" title={`Reviews (${product.reviews?.length || 0})`}>
              <Card>
                <Card.Body>
                  {/* Add Review Form */}
                  {isAuthenticated && (
                    <div className="mb-4">
                      <h5>Add Your Review</h5>
                      <Form onSubmit={handleReviewSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rating</Form.Label>
                          <div>
                            {renderStars(reviewData.rating, true, (rating) => 
                              setReviewData(prev => ({ ...prev, rating }))
                            )}
                          </div>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Comment</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={reviewData.comment}
                            onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                            required
                          />
                        </Form.Group>
                        
                        <Button 
                          type="submit" 
                          variant="primary"
                          disabled={addReviewMutation.isLoading}
                        >
                          {addReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </Form>
                      <hr />
                    </div>
                  )}

                  {/* Reviews List */}
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review, index) => (
                      <div key={index} className="mb-3 pb-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong>{review.name}</strong>
                            <div className="mt-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <p className="mb-0">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Related Products */}
      {suggestions && suggestions.length > 0 && (
        <Row className="mt-5">
          <Col>
            <h3 className="mb-4">Related Products</h3>
            <Row>
              {suggestions.map((product) => (
                <Col md={6} lg={3} key={product._id} className="mb-4">
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProductDetail;