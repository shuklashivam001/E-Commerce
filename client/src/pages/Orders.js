import React from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { FaEye, FaShoppingBag } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Pagination from '../components/Common/Pagination';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery(
    ['orders', { page: currentPage, limit }],
    () => ordersAPI.getOrders({ page: currentPage, limit }),
    {
      select: (response) => response.data,
      keepPreviousData: true,
    }
  );

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading your orders..." />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Error Loading Orders</h4>
          <p>{error.response?.data?.message || 'Something went wrong'}</p>
        </Alert>
      </Container>
    );
  }

  if (!data?.orders || data.orders.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <div className="mb-4">
              <FaShoppingBag size={80} className="text-muted" />
            </div>
            <h3>No orders yet</h3>
            <p className="text-muted mb-4">
              You haven't placed any orders yet. Start shopping to see your orders here.
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
            <h2>My Orders</h2>
            <span className="text-muted">
              {data.pagination?.totalOrders} orders found
            </span>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          {data.orders.map((order) => (
            <Card key={order._id} className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <Row className="align-items-center">
                  <Col md={3}>
                    <div>
                      <strong>Order #{order._id.slice(-8)}</strong>
                      <div className="small text-muted">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div>
                      <div className="small text-muted">Status</div>
                      <Badge bg={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div>
                      <div className="small text-muted">Payment</div>
                      <Badge bg={order.isPaid ? 'success' : 'warning'}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div>
                      <div className="small text-muted">Total</div>
                      <strong>${order.totalPrice}</strong>
                    </div>
                  </Col>
                  <Col md={3} className="text-end">
                    <Button
                      as={Link}
                      to={`/orders/${order._id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      <FaEye className="me-1" />
                      View Details
                    </Button>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <div className="d-flex flex-wrap gap-2">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="d-flex align-items-center">
                          <img
                            src={item.image || '/api/placeholder/40/40'}
                            alt={item.name}
                            className="me-2 rounded"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="small fw-bold">{item.name}</div>
                            <div className="small text-muted">
                              Qty: {item.quantity} × ${item.price}
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="small text-muted align-self-center">
                          +{order.orderItems.length - 3} more items
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-end">
                      <div className="small text-muted">Delivery Address</div>
                      <div className="small">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.country}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <Pagination
              currentPage={data.pagination.currentPage}
              totalPages={data.pagination.totalPages}
              onPageChange={setCurrentPage}
              totalItems={data.pagination.totalOrders}
              itemsPerPage={limit}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Orders;