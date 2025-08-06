import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaCreditCard, FaLock, FaShippingFast } from 'react-icons/fa';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useCart } from '../contexts/CartContext';
import { ordersAPI } from '../services/api';

const Checkout = () => {
  const { items, totalAmount, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  // Create order mutation
  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.createOrder(orderData),
    {
      onSuccess: (response) => {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders/${response.data.order._id}`);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to place order';
        toast.error(message);
        setError('root', { message });
      }
    }
  );

  const onSubmit = async (data) => {
    const orderData = {
      shippingAddress: {
        fullName: data.fullName,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone
      },
      paymentMethod,
      notes: data.notes
    };

    createOrderMutation.mutate(orderData);
  };

  // Redirect if cart is empty
  if (!items || items.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Your cart is empty</h4>
          <p>Please add some items to your cart before proceeding to checkout.</p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </Alert>
      </Container>
    );
  }

  const subtotal = totalAmount;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (createOrderMutation.isLoading) {
    return <LoadingSpinner text="Processing your order..." />;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">Checkout</h2>
        </Col>
      </Row>

      {errors.root && (
        <Row>
          <Col>
            <Alert variant="danger" className="mb-4">
              {errors.root.message}
            </Alert>
          </Col>
        </Row>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          {/* Shipping Information */}
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaShippingFast className="me-2" />
                  Shipping Information
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('fullName', {
                          required: 'Full name is required'
                        })}
                        isInvalid={!!errors.fullName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fullName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        {...register('phone', {
                          required: 'Phone number is required'
                        })}
                        isInvalid={!!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Street address, apartment, suite, etc."
                    {...register('address', {
                      required: 'Address is required'
                    })}
                    isInvalid={!!errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('city', {
                          required: 'City is required'
                        })}
                        isInvalid={!!errors.city}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.city?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code *</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('postalCode', {
                          required: 'Postal code is required'
                        })}
                        isInvalid={!!errors.postalCode}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.postalCode?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country *</Form.Label>
                      <Form.Select
                        {...register('country', {
                          required: 'Country is required'
                        })}
                        isInvalid={!!errors.country}
                      >
                        <option value="">Select Country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.country?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-0">
                  <Form.Label>Order Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Any special instructions for your order..."
                    {...register('notes')}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaCreditCard className="me-2" />
                  Payment Method
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <Form.Check
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    label="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                  />
                  <Form.Check
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    label="PayPal (Coming Soon)"
                    disabled
                    className="mt-2"
                  />
                  <Form.Check
                    type="radio"
                    id="stripe"
                    name="paymentMethod"
                    label="Credit/Debit Card (Coming Soon)"
                    disabled
                    className="mt-2"
                  />
                </div>

                {paymentMethod === 'Cash on Delivery' && (
                  <Alert variant="info" className="mb-0">
                    <small>
                      <FaLock className="me-1" />
                      You will pay when your order is delivered to your address.
                    </small>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush" className="mb-3">
                  {items.map((item) => (
                    <ListGroup.Item key={item.product._id} className="px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product.images?.[0]?.url || '/api/placeholder/50/50'}
                            alt={item.product.name}
                            className="me-2 rounded"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-0 small">{item.product.name}</h6>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                        <span className="fw-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal ({totalItems} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong>${total.toFixed(2)}</strong>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={createOrderMutation.isLoading}
                  >
                    {createOrderMutation.isLoading ? 'Processing...' : 'Place Order'}
                  </Button>

                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      <FaLock className="me-1" />
                      Your order information is secure and encrypted
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Checkout;