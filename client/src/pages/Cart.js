import { Alert, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { FaMinus, FaPlus, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { 
    items, 
    totalAmount, 
    totalItems, 
    loading, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCart();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your cart..." />;
  }

  if (!items || items.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <div className="mb-4">
              <FaShoppingCart size={80} className="text-muted" />
            </div>
            <h3>Your cart is empty</h3>
            <p className="text-muted mb-4">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button as={Link} to="/products" variant="primary" size="lg">
              Start Shopping
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Shopping Cart ({totalItems} items)</h2>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleClearCart}
            >
              Clear Cart
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Cart Items */}
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.product._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product.images?.[0]?.url || '/api/placeholder/80/80'}
                            alt={item.product.name}
                            className="me-3 rounded"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-1">
                              <Link 
                                to={`/products/${item.product._id}`}
                                className="text-decoration-none text-dark"
                              >
                                {item.product.name}
                              </Link>
                            </h6>
                            <small className="text-muted">
                              Category: {item.product.category}
                            </small>
                            {item.product.stock < 5 && (
                              <div>
                                <small className="text-warning">
                                  Only {item.product.stock} left in stock
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <strong>${item.price.toFixed(2)}</strong>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus />
                          </Button>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              if (newQuantity > 0 && newQuantity <= item.product.stock) {
                                handleQuantityChange(item.product._id, newQuantity);
                              }
                            }}
                            className="mx-2 text-center"
                            style={{ width: '70px' }}
                            min="1"
                            max={item.product.stock}
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <FaPlus />
                          </Button>
                        </div>
                      </td>
                      <td className="align-middle">
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </td>
                      <td className="align-middle">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Continue Shopping */}
          <div className="mt-3">
            <Button as={Link} to="/products" variant="outline-primary">
              ← Continue Shopping
            </Button>
          </div>
        </Col>

        {/* Order Summary */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({totalItems} items):</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{totalAmount > 100 ? 'FREE' : '$10.00'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>${(totalAmount * 0.1).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>
                  ${(totalAmount + (totalAmount > 100 ? 0 : 10) + (totalAmount * 0.1)).toFixed(2)}
                </strong>
              </div>

              {totalAmount > 100 && (
                <Alert variant="success" className="small mb-3">
                  🎉 You qualify for FREE shipping!
                </Alert>
              )}

              <Button 
                as={Link} 
                to="/checkout" 
                variant="primary" 
                size="lg" 
                className="w-100"
              >
                Proceed to Checkout
              </Button>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  Secure checkout powered by SSL encryption
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Shipping Info */}
          <Card className="mt-3 shadow-sm">
            <Card.Body>
              <h6>Shipping Information</h6>
              <ul className="list-unstyled small mb-0">
                <li>• Free shipping on orders over $100</li>
                <li>• Standard delivery: 3-5 business days</li>
                <li>• Express delivery available at checkout</li>
                <li>• 30-day return policy</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;