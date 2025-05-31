import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { fetchProducts } from '../services/airtableService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' or 'delivery'
  const [deliveryAddress, setDeliveryAddress] = useState(''); // New state for delivery address
  const [orderHistory, setOrderHistory] = useState([]);
  
  // Ref for the cart icon element
  const cartIconRef = useRef(null);

  // Load cart and order history from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    const savedHistory = localStorage.getItem('orderHistory');
    if (savedHistory) {
      setOrderHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Save order history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);

  const addToCart = (product, sourceElement) => {
    // Check if we have inventory available
    if (product.invent !== undefined && product.invent <= 0) {
      toast.error('Producto agotado');
      return;
    }
    
    const existingItem = cartItems.find(item => item.id === product.id);
    
    // Check if adding one more would exceed inventory
    if (existingItem) {
      if (existingItem.quantity >= product.invent) {
        toast.error(`Solo hay ${product.invent} unidades disponibles`);
        return;
      }
    }
    
    // Create flying animation
    if (sourceElement) {
      createFlyingElement(product, sourceElement);
    }
    
    if (existingItem) {
      setCartItems(prevItems => prevItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success('Cantidad actualizada');
    } else {
      setCartItems(prevItems => [...prevItems, { ...product, quantity: 1 }]);
      toast.success('Producto añadido al carrito');
    }
    
    // Animate the cart badge
    animateCartBadge();
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast.success('Producto eliminado del carrito');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Find the item to check inventory
    const item = cartItems.find(item => item.id === productId);
    
    // Check if we have enough inventory
    if (item && item.invent !== undefined && newQuantity > item.invent) {
      toast.error(`Solo hay ${item.invent} unidades disponibles`);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // Eliminamos la notificación de aquí para evitar duplicados
    // La notificación se manejará en el componente que llama a esta función
  };
  
  // Función para guardar un pedido en el historial
  const saveOrderToHistory = () => {
    if (cartItems.length === 0) return;
    
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('es-ES'),
      items: [...cartItems],
      total: getCartTotal(),
      subtotal: getSubtotal(),
      deliveryFee: getDeliveryFee(),
      deliveryOption,
      deliveryAddress,
      orderMessage
    };
    
    setOrderHistory(prevHistory => [newOrder, ...prevHistory]);
  };
  
  // Función para cargar un pedido del historial al carrito
  const loadOrderToCart = async (orderId) => {
    const orderToLoad = orderHistory.find(order => order.id === orderId);
    if (!orderToLoad) return;
    
    // Obtener los productos actualizados desde Airtable para tener el inventario actual
    const currentProducts = await fetchProducts();
    
    // Verificar el inventario disponible para cada producto
    const updatedItems = orderToLoad.items.map(item => {
      // Buscar el producto en la lista actualizada de productos
      const currentProduct = currentProducts.find(product => product.id === item.id);
      // Guardar la cantidad original solicitada
      const originalQuantity = item.quantity;
      
      // Si no se encuentra el producto o el inventario es 0 o menor, marcar como agotado
      if (!currentProduct || (currentProduct.invent !== undefined && currentProduct.invent <= 0)) {
        return { 
          ...item, 
          quantity: 0, 
          originalQuantity,
          invent: currentProduct ? currentProduct.invent : 0 // Actualizar el inventario
        };
      }
      
      // Si el inventario es menor que la cantidad solicitada, ajustar la cantidad
      if (currentProduct.invent !== undefined && currentProduct.invent < item.quantity) {
        return { 
          ...item, 
          quantity: currentProduct.invent, 
          originalQuantity,
          invent: currentProduct.invent // Actualizar el inventario
        };
      }
      
      // Si hay suficiente inventario, mantener la cantidad original pero actualizar el valor del inventario
      return { 
        ...item, 
        originalQuantity,
        invent: currentProduct.invent // Actualizar el inventario
      };
    });
    
    setCartItems(updatedItems);
    setDeliveryOption(orderToLoad.deliveryOption);
    setDeliveryAddress(orderToLoad.deliveryAddress || '');
    setOrderMessage(orderToLoad.orderMessage || '');
    
    // Verificar si hay productos agotados o con cantidad reducida
    const hasOutOfStock = updatedItems.some(item => item.quantity === 0);
    const hasReducedQuantity = updatedItems.some(item => item.quantity > 0 && item.quantity < item.originalQuantity);
    
    if (hasOutOfStock && hasReducedQuantity) {
      toast.success('Pedido cargado al carrito con algunos productos agotados y cantidades ajustadas');
    } else if (hasOutOfStock) {
      toast.success('Pedido cargado al carrito con algunos productos agotados');
    } else if (hasReducedQuantity) {
      toast.success('Pedido cargado al carrito con cantidades ajustadas por inventario limitado');
    } else {
      toast.success('Pedido cargado al carrito');
    }
  };
  
  // Función para eliminar un pedido del historial
  const removeOrderFromHistory = (orderId) => {
    setOrderHistory(prevHistory => prevHistory.filter(order => order.id !== orderId));
    toast.success('Pedido eliminado del historial');
  };

  const getCartTotal = () => {
    const subtotal = getSubtotal();
    
    // Add delivery fee if delivery option is selected and subtotal is less than 9550
    if (deliveryOption === 'delivery' && subtotal < 9550) {
      return subtotal + 2500; // Add 2500 colones for delivery
    }
    
    return subtotal;
  };
  
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // No incluir productos agotados (invent <= 0) en el cálculo
      if (item.invent !== undefined && item.invent <= 0) {
        return total;
      }
      return total + (item.price * item.quantity);
    }, 0);
  };
  
  const getDeliveryFee = () => {
    const subtotal = getSubtotal();
    if (deliveryOption === 'delivery' && subtotal < 9550) {
      return 2500;
    }
    return 0;
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  // Function to create the flying element animation
  const createFlyingElement = (product, sourceElement) => {
    // Get the source button position
    const sourceRect = sourceElement.getBoundingClientRect();
    
    // Find the cart icon element
    const cartIcon = document.querySelector('.cart-badge');
    if (!cartIcon) return;
    
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Create the flying element
    const flyingElement = document.createElement('div');
    flyingElement.className = 'cart-item-fly';
    flyingElement.style.backgroundImage = `url(${product.image})`;
    
    // Set initial position (center of the button)
    flyingElement.style.left = `${sourceRect.left + sourceRect.width / 2 - 15}px`;
    flyingElement.style.top = `${sourceRect.top + sourceRect.height / 2 - 15}px`;
    
    // Add to DOM
    document.body.appendChild(flyingElement);
    
    // Set final position (cart icon)
    const destinationX = cartRect.left + cartRect.width / 2 - 15;
    const destinationY = cartRect.top + cartRect.height / 2 - 15;
    
    // Trigger animation
    setTimeout(() => {
      flyingElement.style.transition = 'all 0.8s cubic-bezier(0.075, 0.82, 0.165, 1)';
      flyingElement.style.left = `${destinationX}px`;
      flyingElement.style.top = `${destinationY}px`;
      flyingElement.style.animation = 'flyToCart 0.8s forwards';
      
      // Add bounce animation to cart
      setTimeout(() => {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => {
          cartIcon.classList.remove('cart-bounce');
        }, 500);
      }, 600);
      
      // Remove the flying element after animation
      setTimeout(() => {
        if (document.body.contains(flyingElement)) {
          document.body.removeChild(flyingElement);
        }
      }, 800);
    }, 0);
  };
  
  // Function to animate the cart badge
  const animateCartBadge = () => {
    const cartBadge = document.querySelector('.cart-badge .count');
    if (cartBadge) {
      cartBadge.classList.add('animate');
      setTimeout(() => {
        cartBadge.classList.remove('animate');
      }, 500);
    }
  };

  // Función para actualizar directamente los items del carrito con información de inventario actualizada
  const updateCartItems = (updatedItems) => {
    if (!updatedItems || updatedItems.length === 0) return;
    
    // Actualizar el carrito con los items actualizados
    setCartItems(updatedItems);
    
    // Verificar si hay productos agotados o con cantidad reducida
    const hasOutOfStock = updatedItems.some(item => item.invent !== undefined && item.invent <= 0);
    const hasReducedQuantity = updatedItems.some(item => 
      item.originalQuantity && item.quantity > 0 && item.quantity < item.originalQuantity
    );
    
    if (hasOutOfStock && hasReducedQuantity) {
      toast.info('El carrito ha sido actualizado: algunos productos están agotados y otros tienen cantidad limitada');
    } else if (hasOutOfStock) {
      toast.info('El carrito ha sido actualizado: algunos productos están agotados');
    } else if (hasReducedQuantity) {
      toast.info('El carrito ha sido actualizado: algunos productos tienen cantidad limitada');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getSubtotal,
        getDeliveryFee,
        getCartCount,
        isCartOpen,
        toggleCart,
        orderMessage,
        setOrderMessage,
        deliveryOption,
        setDeliveryOption,
        deliveryAddress,
        setDeliveryAddress,
        cartIconRef,
        // Nuevas funciones para el historial de pedidos
        orderHistory,
        saveOrderToHistory,
        loadOrderToCart,
        removeOrderFromHistory,
        // Nueva función para actualizar el carrito con información de inventario
        updateCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};