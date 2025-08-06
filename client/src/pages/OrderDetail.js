import { Alert, Badge, Button, Card, Col, Container, Row, Table } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ordersAPI } from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    () => ordersAPI.getOrder(id),
    {
      select: (response) => response.data,
      enabled: !!id,
    }
  );

  const cancelOrderMutation = useMutation(
    () => ordersAPI.cancelOrder(id),
    {
      onSuccess: () => {
        toast.success('Order cancelled successfully');
        queryClient.invalidateQueries(['order', id]);
        queryClient.invalidateQueries(['orders']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  );

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate();
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Processing': return 'info';
      case 'Shipped': return 'primary';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelOrder = (status) => {
    return ['Pending', 'Processing'].includes(status);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading order details..." />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Order Not Found</h4>
          <p>{error.response?.data?.message || 'The order you are looking for does not exist.'}</p>
          <Button as={Link} to="/orders" variant="primary">
            Back to Orders
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                as={Link}
                to="/orders"
                variant="outline-secondary"
                size="sm"
                className="mb-2"
              >
                <FaArrowLeft className="me-1" />
                Back to Orders
              </Button>
              <h2>Order #{order._id.slice(-8)}</h2>
              <p className="text-muted mb-0">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-end">
              <Badge bg={getStatusVariant(order.status)} className="fs-6 mb-2">
                {order.status}
              </Badge>
              <div>
                <Badge bg={order.isPaid ? 'success' : 'warning'}>
                  {order.isPaid ? 'Paid' : 'Payment Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Order Items */}
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.image || '/api/placeholder/60/60'}
                            alt={item.name}
                            className="me-3 rounded"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-1">{item.name}</h6>
                            <small className="text-muted">
                              Product ID: {item.product}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="align-middle">
                        {item.quantity}
                      </td>
                      <td className="align-middle">
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Order Timeline */}
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Timeline</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-success"></div>
                  <div className="timeline-content">
                    <h6>Order Placed</h6>
                    <p className="text-muted mb-0">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                
                {order.isPaid && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6>Payment Confirmed</h6>
                      <p className="text-muted mb-0">
                        {formatDate(order.paidAt)}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'Processing' && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-info"></div>
                    <div className="timeline-content">
                      <h6>Order Processing</h6>
                      <p className="text-muted mb-0">
                        Your order is being prepared
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'Shipped' && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <h6>Order Shipped</h6>
                      <p className="text-muted mb-0">
                        Your order is on the way
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'Delivered' && order.deliveredAt && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6>Order Delivered</h6>
                      <p className="text-muted mb-0">
                        {formatDate(order.deliveredAt)}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'Cancelled' && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-danger"></div>
                    <div className="timeline-content">
                      <h6>Order Cancelled</h6>
                      <p className="text-muted mb-0">
                        Order was cancelled
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Order Summary & Actions */}
        <Col lg={4}>
          {/* Order Summary */}
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Items Price:</span>
                <span>${order.itemsPrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${order.shippingPrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${order.taxPrice}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>${order.totalPrice}</strong>
              </div>

              <div className="mb-3">
                <strong>Payment Method:</strong>
                <div className="text-muted">{order.paymentMethod}</div>
              </div>

              {canCancelOrder(order.status) && (
                <Button
                  variant="outline-danger"
                  className="w-100"
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isLoading}
                >
                  <FaTimes className="me-1" />
                  {cancelOrderMutation.isLoading ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              )}
            </Card.Body>
          </Card>

          {/* Shipping Address */}
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Shipping Address</h5>
            </Card.Header>
            <Card.Body>
              <address className="mb-0">
                <strong>{order.shippingAddress.fullName}</strong><br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}<br />
                <strong>Phone:</strong> {order.shippingAddress.phone}
              </address>
            </Card.Body>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Order Notes</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{order.notes}</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Custom CSS for Timeline */}
      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -23px;
          top: 5px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .timeline-content h6 {
          margin-bottom: 5px;
          font-weight: 600;
        }
      `}</style>
    </Container>
  );
};

export default OrderDetail;