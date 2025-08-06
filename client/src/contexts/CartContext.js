import { createContext, useContext, useEffect, useReducer } from 'react';
import toast from 'react-hot-toast';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  loading: false,
  error: null
};

// Action types
const CART_ACTIONS = {
  FETCH_CART_START: 'FETCH_CART_START',
  FETCH_CART_SUCCESS: 'FETCH_CART_SUCCESS',
  FETCH_CART_FAILURE: 'FETCH_CART_FAILURE',
  ADD_TO_CART_START: 'ADD_TO_CART_START',
  ADD_TO_CART_SUCCESS: 'ADD_TO_CART_SUCCESS',
  ADD_TO_CART_FAILURE: 'ADD_TO_CART_FAILURE',
  UPDATE_CART_START: 'UPDATE_CART_START',
  UPDATE_CART_SUCCESS: 'UPDATE_CART_SUCCESS',
  UPDATE_CART_FAILURE: 'UPDATE_CART_FAILURE',
  REMOVE_FROM_CART_START: 'REMOVE_FROM_CART_START',
  REMOVE_FROM_CART_SUCCESS: 'REMOVE_FROM_CART_SUCCESS',
  REMOVE_FROM_CART_FAILURE: 'REMOVE_FROM_CART_FAILURE',
  CLEAR_CART_START: 'CLEAR_CART_START',
  CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
  CLEAR_CART_FAILURE: 'CLEAR_CART_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.FETCH_CART_START:
    case CART_ACTIONS.ADD_TO_CART_START:
    case CART_ACTIONS.UPDATE_CART_START:
    case CART_ACTIONS.REMOVE_FROM_CART_START:
    case CART_ACTIONS.CLEAR_CART_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CART_ACTIONS.FETCH_CART_SUCCESS:
    case CART_ACTIONS.ADD_TO_CART_SUCCESS:
    case CART_ACTIONS.UPDATE_CART_SUCCESS:
    case CART_ACTIONS.REMOVE_FROM_CART_SUCCESS:
      return {
        ...state,
        items: action.payload.items || [],
        totalAmount: action.payload.totalAmount || 0,
        totalItems: action.payload.totalItems || 0,
        loading: false,
        error: null
      };

    case CART_ACTIONS.CLEAR_CART_SUCCESS:
      return {
        ...state,
        items: [],
        totalAmount: 0,
        totalItems: 0,
        loading: false,
        error: null
      };

    case CART_ACTIONS.FETCH_CART_FAILURE:
    case CART_ACTIONS.ADD_TO_CART_FAILURE:
    case CART_ACTIONS.UPDATE_CART_FAILURE:
    case CART_ACTIONS.REMOVE_FROM_CART_FAILURE:
    case CART_ACTIONS.CLEAR_CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });
    }
  }, [isAuthenticated, user]);

  // Fetch cart
  const fetchCart = async () => {
    dispatch({ type: CART_ACTIONS.FETCH_CART_START });
    
    try {
      const response = await cartAPI.getCart();
      dispatch({ 
        type: CART_ACTIONS.FETCH_CART_SUCCESS, 
        payload: response.data 
      });
    } catch (error) {
      dispatch({ 
        type: CART_ACTIONS.FETCH_CART_FAILURE, 
        payload: error.response?.data?.message || 'Failed to fetch cart' 
      });
    }
  };

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false, error: 'Not authenticated' };
    }

    dispatch({ type: CART_ACTIONS.ADD_TO_CART_START });
    
    try {
      const response = await cartAPI.addToCart({ productId, quantity });
      dispatch({ 
        type: CART_ACTIONS.ADD_TO_CART_SUCCESS, 
        payload: response.data.cart 
      });
      toast.success('Item added to cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({ 
        type: CART_ACTIONS.ADD_TO_CART_FAILURE, 
        payload: message 
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_CART_START });
    
    try {
      const response = await cartAPI.updateCart({ productId, quantity });
      dispatch({ 
        type: CART_ACTIONS.UPDATE_CART_SUCCESS, 
        payload: response.data.cart 
      });
      toast.success('Cart updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      dispatch({ 
        type: CART_ACTIONS.UPDATE_CART_FAILURE, 
        payload: message 
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART_START });
    
    try {
      const response = await cartAPI.removeFromCart(productId);
      dispatch({ 
        type: CART_ACTIONS.REMOVE_FROM_CART_SUCCESS, 
        payload: response.data.cart 
      });
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      dispatch({ 
        type: CART_ACTIONS.REMOVE_FROM_CART_FAILURE, 
        payload: message 
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART_START });
    
    try {
      const response = await cartAPI.clearCart();
      dispatch({ 
        type: CART_ACTIONS.CLEAR_CART_SUCCESS, 
        payload: response.data.cart 
      });
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      dispatch({ 
        type: CART_ACTIONS.CLEAR_CART_FAILURE, 
        payload: message 
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get cart item count
  const getCartItemCount = () => {
    return state.totalItems;
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  // Get cart item by product ID
  const getCartItem = (productId) => {
    return state.items.find(item => item.product._id === productId);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemCount,
    isInCart,
    getCartItem,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};