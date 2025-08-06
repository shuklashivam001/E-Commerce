import { Card, Col, Container, Nav, Row } from 'react-bootstrap';
import { FaBoxes, FaChartLine, FaDollarSign, FaShoppingBag, FaUsers } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const location = useLocation();

  const { data: stats, isLoading } = useQuery(
    'adminStats',
    adminAPI.getStats,
    {
      select: (response) => response.data,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const sidebarItems = [
    { path: '/admin', label: 'Dashboard', icon: FaChartLine },
    { path: '/admin/products', label: 'Products', icon: FaBoxes },
    { path: '/admin/orders', label: 'Orders', icon: FaShoppingBag },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
  ];

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar */}
        <Col lg={2} className="admin-sidebar">
          <Nav className="flex-column">
            {sidebarItems.map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <item.icon className="me-2" />
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Col>

        {/* Main Content */}
        <Col lg={10}>
          <div className="mb-4">
            <h2>Admin Dashboard</h2>
            <p className="text-muted">Welcome to your admin panel</p>
          </div>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="stats-card text-white h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3">
                    <FaDollarSign size={40} />
                  </div>
                  <div>
                    <h3>${stats?.overview?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                    <p className="mb-0">Total Revenue</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card text-white h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3">
                    <FaShoppingBag size={40} />
                  </div>
                  <div>
                    <h3>{stats?.overview?.totalOrders || 0}</h3>
                    <p className="mb-0">Total Orders</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card text-white h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3">
                    <FaBoxes size={40} />
                  </div>
                  <div>
                    <h3>{stats?.overview?.totalProducts || 0}</h3>
                    <p className="mb-0">Total Products</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card text-white h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="me-3">
                    <FaUsers size={40} />
                  </div>
                  <div>
                    <h3>{stats?.overview?.totalUsers || 0}</h3>
                    <p className="mb-0">Total Users</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Recent Orders */}
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Recent Orders</h5>
                </Card.Header>
                <Card.Body>
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map((order) => (
                            <tr key={order._id}>
                              <td>#{order._id.slice(-8)}</td>
                              <td>{order.user?.name || 'N/A'}</td>
                              <td>${order.totalPrice}</td>
                              <td>
                                <span className={`badge bg-${
                                  order.status === 'Delivered' ? 'success' :
                                  order.status === 'Shipped' ? 'primary' :
                                  order.status === 'Processing' ? 'info' :
                                  order.status === 'Cancelled' ? 'danger' : 'warning'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No recent orders</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Order Status Distribution */}
            <Col lg={4} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Order Status</h5>
                </Card.Header>
                <Card.Body>
                  {stats?.orderStatusStats && stats.orderStatusStats.length > 0 ? (
                    stats.orderStatusStats.map((status) => (
                      <div key={status._id} className="d-flex justify-content-between align-items-center mb-2">
                        <span>{status._id}</span>
                        <span className="badge bg-secondary">{status.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted mb-0">No order data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row>
            <Col>
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-3">
                    <Link to="/admin/products/create" className="btn btn-primary">
                      Add New Product
                    </Link>
                    <Link to="/admin/products" className="btn btn-outline-primary">
                      Manage Products
                    </Link>
                    <Link to="/admin/orders" className="btn btn-outline-primary">
                      View All Orders
                    </Link>
                    <Link to="/admin/users" className="btn btn-outline-primary">
                      Manage Users
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;