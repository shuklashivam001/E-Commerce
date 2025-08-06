import { Container, Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'lg', text = 'Loading...', className = '' }) => {
  return (
    <Container className={`d-flex flex-column justify-content-center align-items-center py-5 ${className}`}>
      <Spinner animation="border" role="status" variant="primary" size={size}>
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </Container>
  );
};

export default LoadingSpinner;