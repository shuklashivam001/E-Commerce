import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Offcanvas, Row } from 'react-bootstrap';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Pagination from '../components/Common/Pagination';
import ProductCard from '../components/Common/ProductCard';
import { productsAPI } from '../services/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });

  // Fetch products
  const { data, isLoading, error } = useQuery(
    ['products', filters],
    () => productsAPI.getProducts(filters),
    {
      select: (response) => response.data,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      rating: '',
      sort: 'newest',
      page: 1,
      limit: 12
    });
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  const FilterSidebar = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Filters</h5>
        <Button variant="link" size="sm" onClick={clearFilters} className="text-decoration-none">
          Clear All
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Label>Search</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </Card.Body>
      </Card>

      {/* Category */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {data?.filters?.categories?.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Price Range */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Label>Price Range</Form.Label>
          <Row>
            <Col>
              <Form.Control
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Brand */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Label>Brand</Form.Label>
          <Form.Select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
          >
            <option value="">All Brands</option>
            {data?.filters?.brands?.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Rating */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Label>Minimum Rating</Form.Label>
          <Form.Select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="">Any Rating</option>
            <option value="4">4 Stars & Up</option>
            <option value="3">3 Stars & Up</option>
            <option value="2">2 Stars & Up</option>
            <option value="1">1 Star & Up</option>
          </Form.Select>
        </Card.Body>
      </Card>
    </div>
  );

  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger text-center">
          <h4>Error Loading Products</h4>
          <p>{error.response?.data?.message || 'Something went wrong'}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        {/* Desktop Filters Sidebar */}
        <Col lg={3} className="d-none d-lg-block">
          <FilterSidebar />
        </Col>

        {/* Main Content */}
        <Col lg={9}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Products</h2>
              {data?.pagination && (
                <p className="text-muted mb-0">
                  {data.pagination.totalProducts} products found
                </p>
              )}
            </div>
            
            <div className="d-flex gap-2 align-items-center">
              {/* Mobile Filter Button */}
              <Button
                variant="outline-primary"
                className="d-lg-none"
                onClick={() => setShowFilters(true)}
              >
                <FaFilter className="me-1" />
                Filters
              </Button>

              {/* Sort Dropdown */}
              <Form.Select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                style={{ width: 'auto' }}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.rating) && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-2">
                {filters.search && (
                  <Badge bg="primary" className="d-flex align-items-center">
                    Search: {filters.search}
                    <FaTimes 
                      className="ms-1 cursor-pointer" 
                      onClick={() => handleFilterChange('search', '')}
                    />
                  </Badge>
                )}
                {filters.category && (
                  <Badge bg="primary" className="d-flex align-items-center">
                    Category: {filters.category}
                    <FaTimes 
                      className="ms-1 cursor-pointer" 
                      onClick={() => handleFilterChange('category', '')}
                    />
                  </Badge>
                )}
                {filters.brand && (
                  <Badge bg="primary" className="d-flex align-items-center">
                    Brand: {filters.brand}
                    <FaTimes 
                      className="ms-1 cursor-pointer" 
                      onClick={() => handleFilterChange('brand', '')}
                    />
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge bg="primary" className="d-flex align-items-center">
                    Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                    <FaTimes 
                      className="ms-1 cursor-pointer" 
                      onClick={() => {
                        handleFilterChange('minPrice', '');
                        handleFilterChange('maxPrice', '');
                      }}
                    />
                  </Badge>
                )}
                {filters.rating && (
                  <Badge bg="primary" className="d-flex align-items-center">
                    {filters.rating}+ Stars
                    <FaTimes 
                      className="ms-1 cursor-pointer" 
                      onClick={() => handleFilterChange('rating', '')}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <LoadingSpinner text="Loading products..." />
          ) : data?.products?.length > 0 ? (
            <>
              <Row>
                {data.products.map((product) => (
                  <Col md={6} xl={4} key={product._id} className="mb-4">
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {data?.pagination && (
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={data.pagination.totalProducts}
                  itemsPerPage={filters.limit}
                />
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <h4>No products found</h4>
              <p className="text-muted">Try adjusting your filters or search terms</p>
              <Button variant="primary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Mobile Filters Offcanvas */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FilterSidebar />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Products;