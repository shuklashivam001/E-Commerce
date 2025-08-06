import { Alert, Container } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  return (
    <ProtectedRoute>
      {loading ? (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
      ) : isAdmin() ? (
        children
      ) : (
        <Container className="mt-5">
          <Alert variant="danger" className="text-center">
            <h4>Access Denied</h4>
            <p>You don't have permission to access this page. Admin privileges required.</p>
          </Alert>
        </Container>
      )}
    </ProtectedRoute>
  );
};

export default AdminRoute;