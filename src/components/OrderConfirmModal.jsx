import { useState, useEffect } from 'react';
import { FaTimes, FaWhatsapp, FaUser, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import { submitOrder, verifyInventory } from '../services/airtableService';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import '../styles/OrderConfirmModal.css';

const OrderConfirmModal = ({ isOpen, onClose, onConfirm, cartItems, deliveryOption, deliveryAddress, orderMessage, total }) => {
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryChanges, setInventoryChanges] = useState(null);
  const [updatedCartItems, setUpdatedCartItems] = useState([]);
  const [adjustedTotal, setAdjustedTotal] = useState(total);
  
  
  const { updateCartItems } = useCart();
  
  
  useEffect(() => {
    if (!isOpen) {
     
      setIsSubmitting(false);
      setCustomerData({
        name: '',
        phone: ''
      });
      
      // Si hubo cambios en el inventario, actualizar el carrito principal
      if (inventoryChanges?.hasChanges && updateCartItems) {
        
        const itemsToUpdate = cartItems.map(item => {
          // Para productos agotados
          if (inventoryChanges.unavailableItems.some(uItem => uItem.id === item.id)) {
            return {
              ...item,
              invent: 0,
              originalQuantity: item.quantity
            };
          }
          // Para productos con cantidad reducida
          const reducedItem = inventoryChanges.reducedQuantityItems.find(rItem => rItem.id === item.id);
          if (reducedItem) {
            return {
              ...item,
              quantity: reducedItem.availableQuantity,
              originalQuantity: item.quantity
            };
          }
          return item;
        });
        
        // Actualizar el carrito con los items actualizados
        updateCartItems(itemsToUpdate);
      }
      
      setInventoryChanges(null);
      setAdjustedTotal(total);
    } else {
      // Cuando el modal se abre, inicializar con los items actuales
      setUpdatedCartItems([...cartItems]);
      setAdjustedTotal(total);
    }
  }, [isOpen, cartItems, inventoryChanges, updateCartItems, total]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para calcular el total ajustado basado en los productos disponibles
  const calculateAdjustedTotal = (items) => {
    // Filtrar productos agotados y calcular el nuevo total
    const validItems = items.filter(item => item.invent === undefined || item.invent > 0);
    return validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Función para verificar el inventario actual
  const checkCurrentInventory = async () => {
    setIsSubmitting(true);
    try {
      const verificationResult = await verifyInventory(cartItems);
      
      if (!verificationResult.success) {
        toast.error(verificationResult.message || 'Error al verificar el inventario');
        setIsSubmitting(false);
        return false;
      }
      
      // Si hay cambios en el inventario, actualizar el estado
      if (verificationResult.hasChanges) {
        setInventoryChanges(verificationResult);
        
        // Crear una lista actualizada de productos para el carrito
        const updatedItems = [
          ...verificationResult.availableItems,
          ...verificationResult.reducedQuantityItems,
          ...verificationResult.outOfStockItems
        ];
        
        // Calcular el nuevo total excluyendo productos agotados
        const newTotal = calculateAdjustedTotal(updatedItems);
        setAdjustedTotal(newTotal);
        
        setUpdatedCartItems(updatedItems);
        setIsSubmitting(false);
        return false;
      }
      
   
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error('Error al verificar el inventario:', error);
      toast.error('Error al verificar el inventario. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    if (!customerData.name.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    
    if (!customerData.phone.trim()) {
      toast.error('Por favor ingresa tu número de teléfono');
      return;
    }
    
    // Verificar si hay productos agotados o con cantidad reducida que requieren revisión
    if (inventoryChanges && inventoryChanges.hasChanges && 
        (inventoryChanges.outOfStockItems.length > 0 || inventoryChanges.reducedQuantityItems.length > 0)) {
      toast.error('Por favor revisa los cambios en tu pedido antes de confirmar');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verificar el inventario actual antes de procesar el pedido
      if (!inventoryChanges) {
        const inventoryOk = await checkCurrentInventory();
        if (!inventoryOk) return;
      }
      
      // Usar los items actualizados si hay cambios en el inventario
      const itemsToOrder = inventoryChanges ? updatedCartItems : cartItems;
      
      // Filtrar productos agotados
      const validItems = itemsToOrder.filter(item => item.invent === undefined || item.invent > 0);
      
      // Guardar el pedido en Airtable con el total ajustado
      const orderData = {
        customerName: customerData.name,
        customerPhone: customerData.phone,
        items: validItems,
        total: adjustedTotal,
        deliveryOption,
        deliveryAddress
      };
      
      const result = await submitOrder(orderData);
      
      if (result.success) {
        // Si se guardó correctamente, continuar con el proceso de WhatsApp
        onConfirm(customerData);
        // Reiniciar el estado después de confirmar
        setIsSubmitting(false);
        setCustomerData({
          name: '',
          phone: ''
        });
     
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      toast.error('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="order-modal-overlay">
      <div className="order-modal">
        <div className="order-modal-header">
          <h2>Confirmar Pedido</h2>
          <button className="close-modal" onClick={onClose} disabled={isSubmitting}>
            <FaTimes />
          </button>
        </div>
        
        <div className="order-modal-content">
          <p>Por favor, completa tus datos para finalizar el pedido:</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                <FaUser /> Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={customerData.name}
                onChange={handleChange}
                placeholder="Ingresa tu nombre completo"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">
                <FaPhone /> Número de teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerData.phone}
                onChange={handleChange}
                placeholder="Ingresa tu número de teléfono"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="order-summary-preview">
              <h3>Resumen del pedido:</h3>
              
              {inventoryChanges && inventoryChanges.hasChanges && (
                <div className="inventory-changes-alert">
                  <div className="alert-header">
                    <FaExclamationTriangle /> 
                    <p>Cambios en el inventario:</p>
                  </div>
                  
                  {inventoryChanges.outOfStockItems.length > 0 && (
                    <div className="out-of-stock-items">
                      <p><strong>Productos agotados:</strong></p>
                      <ul>
                        {inventoryChanges.outOfStockItems.map(item => (
                          <li key={item.id}>{item.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {inventoryChanges.reducedQuantityItems.length > 0 && (
                    <div className="reduced-quantity-items">
                      <p><strong>Productos con cantidad ajustada:</strong></p>
                      <ul>
                        {inventoryChanges.reducedQuantityItems.map(item => (
                          <li key={item.id}>{item.name}: {item.quantity}/{item.originalQuantity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  

                </div>
              )}
              
              <p><strong>Total:</strong> ₡{adjustedTotal.toLocaleString()}</p>
              {inventoryChanges && inventoryChanges.hasChanges && adjustedTotal !== total && (
                <p><em>El total ha sido ajustado debido a cambios en el inventario.</em></p>
              )}
              <p><strong>Método:</strong> {deliveryOption === 'delivery' ? 'Envío a domicilio' : 'Para recoger'}</p>
              {deliveryOption === 'delivery' && deliveryAddress && (
                <p><strong>Dirección:</strong> {deliveryAddress}</p>
              )}
            </div>
            
            <div className="order-modal-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="confirm-btn"
                disabled={isSubmitting || 
                  (updatedCartItems.filter(item => item.invent === undefined || item.invent > 0).length === 0) ||
                  (inventoryChanges && inventoryChanges.hasChanges && 
                    (inventoryChanges.outOfStockItems.length > 0 || inventoryChanges.reducedQuantityItems.length > 0))}
              >
                {isSubmitting ? 'Procesando...' : (
                  <>
                    <FaWhatsapp /> Confirmar Pedido
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmModal;