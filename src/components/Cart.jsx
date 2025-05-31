import { FaShoppingCart, FaTimes, FaTrash, FaWhatsapp, FaTruck, FaStore, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaHistory, FaRedo, FaCalendarAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { updateInventory } from '../services/airtableService';
import toast from 'react-hot-toast';
import OrderConfirmModal from './OrderConfirmModal';
import '../styles/Cart.css';
import '../styles/OrderHistory.css';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getSubtotal,
    getDeliveryFee,
    isCartOpen,
    toggleCart,
    orderMessage,
    setOrderMessage,
    deliveryOption,
    setDeliveryOption,
    deliveryAddress,
    setDeliveryAddress,
    orderHistory,
    saveOrderToHistory,
    loadOrderToCart,
    removeOrderFromHistory
  } = useCart();
  
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [showOrderMessage, setShowOrderMessage] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showInventoryNotification, setShowInventoryNotification] = useState(false);

  const handleOrderButtonClick = () => {
    // Mostrar el modal de confirmación
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    if (!isCartOpen) {
      toggleCart();
    }
    
    // Verificar si hay productos agotados o con cantidad reducida para mostrar notificación
    const hasOutOfStock = cartItems.some(item => item.invent !== undefined && item.invent <= 0);
    const hasReducedQuantity = cartItems.some(item => 
      item.originalQuantity && item.quantity > 0 && item.quantity < item.originalQuantity
    );
    
    if (hasOutOfStock || hasReducedQuantity) {
      setShowInventoryNotification(true);
      // Ocultar la notificación después de 5 segundos
      setTimeout(() => {
        setShowInventoryNotification(false);
      }, 5000);
    }
  };

  const handleWhatsAppOrder = async (customerData) => {
    // Update inventory in Airtable silently
    await updateInventory(cartItems);

    
    const phoneNumber = '50686322460';
    let message = `¡Hola! Soy ${customerData.name}, me gustaría hacer el siguiente pedido:\n\n`;
    
    cartItems.forEach(item => {
      
      if (item.invent === undefined || item.invent > 0) {
        message += `${item.quantity}x ${item.name} - ₡${(item.price * item.quantity).toLocaleString()}
`;
      }
    });
    
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    
    message += `\nSubtotal: ₡${subtotal.toLocaleString()}`;
    
    if (deliveryOption === 'delivery') {
      if (deliveryFee > 0) {
        message += `\nEnvío: ₡${deliveryFee.toLocaleString()}`;
      } else {
        message += '\nEnvío: Gratis (pedido mayor a ₡9,550)';
      }
      
      // Add delivery address if provided
      if (deliveryAddress.trim()) {
        message += `\n\nDirección de entrega: ${deliveryAddress}`;
      }
    } else {
      message += '\nMétodo: Para recoger en tienda';
    }
    
    message += `\nTotal: ₡${getCartTotal().toLocaleString()}`;
    
    // Add order message if provided
    if (orderMessage.trim()) {
      message += `\n\nMensaje: ${orderMessage}`;
    }

    // Añadir número de teléfono del cliente
    message += `\n\nMi número de contacto: ${customerData.phone}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Guardar el pedido en el historial antes de limpiarlo
    saveOrderToHistory();
    
    // Mostrar mensaje de pedido creado
    toast.success('¡Pedido creado con éxito!');
    
    // Clear cart after successful order
    clearCart();
    
    // Cerrar el modal
    setShowOrderModal(false);
    
    // Usar location.href en lugar de window.open para mejor compatibilidad con móviles
    window.location.href = whatsappUrl;
    toggleCart(); // Close cart after order
  };

  return (
    <div className={`cart-container ${isCartOpen ? 'open' : ''}`}>
      <div className="cart-overlay" onClick={toggleCart}></div>
      <div className="cart-panel">
        <div className="cart-header">
          <h2>
            <FaShoppingCart /> Carrito de Compras
          </h2>
          <button className="close-cart" onClick={toggleCart}>
            <FaTimes />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart-container">
              <div className="empty-cart">
                <FaShoppingCart />
                <p>Tu carrito está vacío</p>
              </div>
              
              {orderHistory.length > 0 && (
                <div className="order-history-section">
                  <div className="order-history-header">
                    <FaHistory />
                    <h3>Historial de Pedidos</h3>
                  </div>
                  
                  <div className="order-history-list">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="order-history-item">
                        <button 
                          className="remove-order-btn" 
                          onClick={() => removeOrderFromHistory(order.id)}
                          title="Eliminar del historial"
                        >
                          <FaTrash />
                        </button>
                        <div className="order-history-info">
                          <div className="order-date">
                            <FaCalendarAlt />
                            <span>{order.date}</span>
                          </div>
                          <div className="order-items-summary">
                            {order.items.map((item, index) => (
                              <div key={`${order.id}-${item.id}-${index}`} className="order-item-preview">
                                <img src={item.image} alt={item.name} />
                                <span className="order-item-quantity">{item.quantity}x</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-total">
                            <span>Total: ₡{order.total.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="order-history-actions">
                          <button 
                            className="reorder-btn" 
                            onClick={() => loadOrderToCart(order.id)}
                            title="Cargar este pedido"
                          >
                            <FaRedo /> Reordenar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {showInventoryNotification && (
                <div className="inventory-notification">
                  <FaExclamationTriangle />
                  <span>Inventario actualizado</span>
                </div>
              )}
              {cartItems.map((item) => {
                const isOutOfStock = item.invent !== undefined && item.invent <= 0;
                const hasReducedQuantity = item.originalQuantity && item.quantity < item.originalQuantity;
                
                return (
                  <div key={item.id} className={`cart-item ${isOutOfStock ? 'out-of-stock' : ''}`}>
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      {isOutOfStock ? (
                        <p className="cart-item-out-of-stock">
                          <FaExclamationTriangle />
                          Producto agotado
                        </p>
                      ) : (
                        <>
                          <p className="cart-item-price">₡{(item.price * item.quantity).toLocaleString()}</p>
                          {hasReducedQuantity && (
                            <p className="cart-item-limited">
                              <FaExclamationTriangle />
                              Cantidad limitada: {item.quantity}/{item.originalQuantity}
                            </p>
                          )}
                        </>
                      )}
                      {isOutOfStock ? (
                        <div className="quantity-controls disabled">
                          <span>No disponible</span>
                        </div>
                      ) : (
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.invent !== undefined && item.quantity >= item.invent}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      className="remove-item"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="delivery-options">
              <div className="section-header" onClick={() => setShowDeliveryOptions(!showDeliveryOptions)}>
                <h3>Método de entrega:</h3>
                {showDeliveryOptions ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {showDeliveryOptions && (
                <>
                  <div className="delivery-option-buttons">
                    <button 
                      className={`delivery-option-btn ${deliveryOption === 'pickup' ? 'active' : ''}`}
                      onClick={() => setDeliveryOption('pickup')}
                    >
                      <FaStore /> Para recoger
                    </button>
                    <button 
                      className={`delivery-option-btn ${deliveryOption === 'delivery' ? 'active' : ''}`}
                      onClick={() => setDeliveryOption('delivery')}
                    >
                      <FaTruck /> Envío a domicilio
                    </button>
                  </div>
                  
                  {deliveryOption === 'delivery' && (
                    <>
                      <div className="delivery-info">
                        {getSubtotal() < 9550 ? (
                          <p>Costo de envío: ₡2,500</p>
                        ) : (
                          <p className="free-delivery">¡Envío gratis! (pedido mayor a ₡9,550)</p>
                        )}
                      </div>
                      <div className="delivery-address-input">
                        <div className="address-input-container">
                          <FaMapMarkerAlt />
                          <input
                            type="text"
                            placeholder="Ingresa tu dirección completa"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            
            <div className="order-message">
              <div className="section-header" onClick={() => setShowOrderMessage(!showOrderMessage)}>
                <h3>Mensaje para tu pedido:</h3>
                {showOrderMessage ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {showOrderMessage && (
                <textarea 
                  placeholder="Instrucciones especiales, dirección de entrega, etc."
                  value={orderMessage}
                  onChange={(e) => setOrderMessage(e.target.value)}
                  rows="3"
                />
              )}
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₡{getSubtotal().toLocaleString()}</span>
              </div>
              
              {deliveryOption === 'delivery' && getDeliveryFee() > 0 && (
                <div className="summary-row">
                  <span>Envío:</span>
                  <span>₡{getDeliveryFee().toLocaleString()}</span>
                </div>
              )}
              
              <div className="cart-total">
                <span>Total:</span>
                <span>₡{getCartTotal().toLocaleString()}</span>
              </div>
            </div>
            
            <div className="cart-actions">
              <button className="clear-cart" onClick={clearCart}>
                Vaciar Carrito
              </button>
              <button className="checkout-btn" onClick={handleOrderButtonClick}>
                <FaWhatsapp /> Hacer Pedido
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmación de pedido */}
      <OrderConfirmModal 
        isOpen={showOrderModal}
        onClose={handleCloseModal}
        onConfirm={handleWhatsAppOrder}
        cartItems={cartItems}
        deliveryOption={deliveryOption}
        deliveryAddress={deliveryAddress}
        orderMessage={orderMessage}
        total={getCartTotal()}
      />
    </div>
  );
};

export default Cart;