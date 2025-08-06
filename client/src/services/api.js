import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (userData) => API.put('/auth/profile', userData),
  changePassword: (passwordData) => API.put('/auth/change-password', passwordData),
};

// Products API
export const productsAPI = {
  getProducts: (params) => API.get('/products', { params }),
  getProduct: (id) => API.get(`/products/${id}`),
  getFeaturedProducts: () => API.get('/products/featured/list'),
  getProductsByCategory: (category, params) => API.get(`/products/category/${category}`, { params }),
  addReview: (productId, reviewData) => API.post(`/products/${productId}/reviews`, reviewData),
  getProductSuggestions: (productId) => API.get(`/products/${productId}/suggestions`),
};

// Cart API
export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (data) => API.post('/cart/add', data),
  updateCart: (data) => API.put('/cart/update', data),
  removeFromCart: (productId) => API.delete(`/cart/remove/${productId}`),
  clearCart: () => API.delete('/cart/clear'),
  getCartCount: () => API.get('/cart/count'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => API.post('/orders', orderData),
  getOrders: (params) => API.get('/orders', { params }),
  getOrder: (id) => API.get(`/orders/${id}`),
  cancelOrder: (id) => API.put(`/orders/${id}/cancel`),
  updatePayment: (id, paymentData) => API.put(`/orders/${id}/pay`, paymentData),
  getUserStats: () => API.get('/orders/stats/user'),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getStats: () => API.get('/admin/stats'),
  
  // Products
  getProducts: (params) => API.get('/admin/products', { params }),
  createProduct: (productData) => API.post('/admin/products', productData),
  updateProduct: (id, productData) => API.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  
  // Orders
  getOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, statusData) => API.put(`/admin/orders/${id}/status`, statusData),
  
  // Users
  getUsers: (params) => API.get('/admin/users', { params }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;