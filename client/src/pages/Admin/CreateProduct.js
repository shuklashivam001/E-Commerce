import { useEffect, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    InputGroup,
    Row,
    Spinner
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import '../../styles/CreateProduct.css';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      brand: '',
      stock: '',
      featured: false,
      discount: 0
    }
  });

  // Categories available in the system
  const categories = [
    'Electronics',
    'Clothing', 
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Toys',
    'Automotive',
    'Health',
    'Food',
    'Other'
  ];

  // Watch price and original price for discount calculation
  const watchPrice = watch('price');
  const watchOriginalPrice = watch('originalPrice');

  // Auto-calculate discount when prices change
  useEffect(() => {
    if (watchPrice && watchOriginalPrice && parseFloat(watchOriginalPrice) > parseFloat(watchPrice)) {
      const discount = ((parseFloat(watchOriginalPrice) - parseFloat(watchPrice)) / parseFloat(watchOriginalPrice)) * 100;
      setValue('discount', Math.round(discount));
    }
  }, [watchPrice, watchOriginalPrice, setValue]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    setImageFiles(validFiles);

    // Create previews
    const previews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImagePreviews(previews);
  };

  // Remove image preview
  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Handle specifications
  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      setSpecifications(specifications.filter((_, i) => i !== index));
    }
  };

  // Handle tags
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (imageFiles.length === 0) {
        toast.error('At least one product image is required');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add basic product data
      Object.keys(data).forEach(key => {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      // Add images
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Add specifications (filter out empty ones)
      const validSpecs = specifications.filter(spec => spec.key.trim() && spec.value.trim());
      if (validSpecs.length > 0) {
        formData.append('specifications', JSON.stringify(validSpecs));
      }

      // Add tags
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }

      // Submit to API
      const response = await adminAPI.createProduct(formData);
      
      toast.success('Product created successfully!');
      
      // Reset form
      reset();
      setImageFiles([]);
      setImagePreviews([]);
      setSpecifications([{ key: '', value: '' }]);
      setTags([]);
      
      // Navigate to products list or product detail
      navigate('/admin/products');
      
    } catch (error) {
      console.error('Product creation error:', error);
      const message = error.response?.data?.message || 'Failed to create product';
      toast.error(message);
      
      // Show validation errors if any
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg || err.message);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-product-container">
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="create-product-card">
              <Card.Header className="create-product-header">
                <h4 className="mb-0">
                  <i className="fas fa-plus-circle me-2"></i>
                  Create New Product
                </h4>
              </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  {/* Basic Information */}
                  <Col md={8}>
                    <h5 className="section-title">Basic Information</h5>
                    
                    {/* Product Name */}
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter product name"
                        {...register('name', {
                          required: 'Product name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' },
                          maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
                        })}
                        isInvalid={!!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Description */}
                    <Form.Group className="mb-3">
                      <Form.Label>Description *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Enter detailed product description"
                        {...register('description', {
                          required: 'Description is required',
                          minLength: { value: 10, message: 'Description must be at least 10 characters' },
                          maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
                        })}
                        isInvalid={!!errors.description}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description?.message}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        {watch('description')?.length || 0}/2000 characters
                      </Form.Text>
                    </Form.Group>

                    {/* Category and Brand */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Category *</Form.Label>
                          <Form.Select
                            {...register('category', { required: 'Category is required' })}
                            isInvalid={!!errors.category}
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.category?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Brand</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter brand name"
                            {...register('brand', {
                              maxLength: { value: 50, message: 'Brand name cannot exceed 50 characters' }
                            })}
                            isInvalid={!!errors.brand}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.brand?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>

                  {/* Pricing and Stock */}
                  <Col md={4}>
                    <h5 className="section-title">Pricing & Stock</h5>
                    
                    {/* Price */}
                    <Form.Group className="mb-3">
                      <Form.Label>Price *</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...register('price', {
                            required: 'Price is required',
                            min: { value: 0, message: 'Price cannot be negative' }
                          })}
                          isInvalid={!!errors.price}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.price?.message}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    {/* Original Price */}
                    <Form.Group className="mb-3">
                      <Form.Label>Original Price (Optional)</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...register('originalPrice', {
                            min: { value: 0, message: 'Original price cannot be negative' }
                          })}
                          isInvalid={!!errors.originalPrice}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.originalPrice?.message}
                        </Form.Control.Feedback>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        For showing discounts
                      </Form.Text>
                    </Form.Group>

                    {/* Auto-calculated Discount */}
                    {watchPrice && watchOriginalPrice && parseFloat(watchOriginalPrice) > parseFloat(watchPrice) && (
                      <Alert variant="success" className="py-2">
                        <small>
                          <strong>Auto Discount:</strong> {Math.round(((parseFloat(watchOriginalPrice) - parseFloat(watchPrice)) / parseFloat(watchOriginalPrice)) * 100)}%
                        </small>
                      </Alert>
                    )}

                    {/* Stock */}
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="0"
                        {...register('stock', {
                          required: 'Stock quantity is required',
                          min: { value: 0, message: 'Stock cannot be negative' }
                        })}
                        isInvalid={!!errors.stock}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.stock?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Featured Product */}
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Featured Product"
                        {...register('featured')}
                      />
                      <Form.Text className="text-muted">
                        Featured products appear on homepage
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <hr />

                {/* Product Images */}
                <h5 className="section-title">Product Images *</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Images (Max 5, 5MB each)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Form.Text className="text-muted">
                    Supported formats: JPG, PNG, GIF, WebP
                  </Form.Text>
                </Form.Group>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <Row className="mb-3">
                    {imagePreviews.map((preview, index) => (
                      <Col key={index} xs={6} md={3} className="mb-2">
                        <div className="position-relative">
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="img-fluid rounded"
                            style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                        <small className="text-muted d-block mt-1">
                          {preview.name}
                        </small>
                      </Col>
                    ))}
                  </Row>
                )}

                <hr />

                {/* Specifications */}
                <h5 className="section-title">Specifications</h5>
                {specifications.map((spec, index) => (
                  <Row key={index} className="mb-2">
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        placeholder="Specification name"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        type="text"
                        placeholder="Specification value"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeSpecification(index)}
                        disabled={specifications.length === 1}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addSpecification}
                  className="mb-3"
                >
                  + Add Specification
                </Button>

                <hr />

                {/* Tags */}
                <h5 className="section-title">Tags</h5>
                <Form.Group className="mb-3">
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Add a tag and press Enter"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                    />
                    <Button variant="outline-primary" onClick={addTag}>
                      Add Tag
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* Display Tags */}
                {tags.length > 0 && (
                  <div className="mb-3">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        bg="primary"
                        className="me-2 mb-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}

                <hr />

                {/* Submit Buttons */}
                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/admin/products')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Create Product
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default CreateProduct;