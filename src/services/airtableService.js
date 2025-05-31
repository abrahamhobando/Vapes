// Airtable API Service

// Usar variables de entorno para datos sensibles
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'Hoja 1';
const CONTACT_TABLE_NAME = import.meta.env.VITE_AIRTABLE_CONTACT_TABLE_NAME || 'Contacto';
const ORDERS_TABLE_NAME = import.meta.env.VITE_AIRTABLE_ORDERS_TABLE_NAME || 'Pedidos';

// Base URLs for Airtable API
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`;
const CONTACT_AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTACT_TABLE_NAME}`;
const ORDERS_AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${ORDERS_TABLE_NAME}`;

// Function to fetch all products from Airtable
export const fetchProducts = async () => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Airtable records to our product format
    return data.records.map(record => ({
      id: record.id,
      name: record.fields.name || '',
      description: record.fields.description || '',
      price: record.fields.price || 0,
      image: record.fields.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Default image if none provided
      category: record.fields.category || 'otros',
      invent: record.fields.invent || 0,
      esp: record.fields.Esp || '', // Nuevo campo para identificar productos especiales
      destacado: record.fields.Destacado === 'Si' // Campo para identificar productos destacados
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Function to fetch categories from products
export const getCategories = (products) => {
  // Get unique categories from products
  const uniqueCategories = [...new Set(products.map(product => product.category))];
  
  // Create category objects with icons
  const categoryIcons = {
    panes: 'FaBreadSlice',
    promociones: 'FaPercentage',
    bebidas: 'FaGlassWhiskey',
    dulces: 'FaCookie',
    otros: null
  };
  
  // Create the 'all' category and add it to the beginning
  const categories = [
    { id: 'all', name: 'Todos', icon: null }
  ];
  
  // Add the rest of the categories
  uniqueCategories.forEach(category => {
    categories.push({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
      icon: categoryIcons[category] || null
    });
  });
  
  return categories;
};

// Function to update inventory in Airtable after a purchase
export const updateInventory = async (cartItems) => {
  try {
    // For each item in the cart, update its inventory
    const results = [];
    const errors = [];
    
    console.log('Actualizando inventario para', cartItems.length, 'productos');
    
    // Process each item individually to prevent one failure from stopping all updates
    for (const item of cartItems) {
      try {
        console.log(`Procesando item: ${item.name}, cantidad: ${item.quantity}, ID: ${item.id}`);
        
        // First, get the current record to ensure we have the latest inventory value
        const response = await fetch(
          `${AIRTABLE_URL}/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          console.warn(`Error fetching product data for ${item.name}: ${response.statusText}`);
          errors.push(`No se pudo actualizar ${item.name}`);
          continue; // Skip to next item instead of failing completely
        }

        const data = await response.json();
        // Asegurar que el inventario actual sea un número entero
        const currentInventory = parseInt(data.fields.invent || 0, 10);
        
        console.log(`Inventario actual de ${item.name}: ${currentInventory} (tipo: ${typeof currentInventory})`);
        
        // Calculate new inventory (ensure it doesn't go below 0)
        const newInventory = Math.max(0, currentInventory - item.quantity);
        
        console.log(`Nuevo inventario de ${item.name}: ${newInventory} (tipo: ${typeof newInventory})`);
        console.log(`Cantidad a restar: ${item.quantity} (tipo: ${typeof item.quantity})`);
        console.log(`Operación: ${currentInventory} - ${item.quantity} = ${newInventory}`);
        
        // Update the record with new inventory value
        const updateResponse = await fetch(
          `${AIRTABLE_URL}/${item.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: {
                invent: parseInt(newInventory, 10) // Asegurar que se envía como número entero
              }
            })
          }
        );

        if (!updateResponse.ok) {
          console.warn(`Error updating inventory for ${item.name}: ${updateResponse.statusText}`);
          errors.push(`No se pudo actualizar ${item.name}`);
          continue; // Skip to next item instead of failing completely
        }
        
        const updateResult = await updateResponse.json();
        console.log(`Inventario actualizado correctamente para ${item.name}`);
        console.log('Respuesta de Airtable:', JSON.stringify(updateResult, null, 2));
        results.push(updateResult);
        
        // Verificar que el inventario se actualizó correctamente
        if (updateResult && updateResult.fields && updateResult.fields.invent !== undefined) {
          console.log(`Inventario confirmado en Airtable: ${updateResult.fields.invent}`);
        } else {
          console.warn(`No se pudo confirmar la actualización del inventario para ${item.name}`);
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.name}:`, itemError);
        errors.push(`Error con ${item.name}`);
        // Continue with next item instead of failing completely
      }
    }
    
    // If we have some successful updates but some errors, still consider it a partial success
    if (results.length > 0) {
      return { 
        success: true, 
        message: errors.length > 0 
          ? `Inventario parcialmente actualizado. ${errors.join(', ')}` 
          : 'Inventario actualizado correctamente' 
      };
    }
    
    // If all updates failed
    return { success: false, message: 'Error al actualizar el inventario' };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, message: 'Error al actualizar el inventario' };
  }
};

// Function to submit contact form data to Airtable
export const submitContactForm = async (formData) => {
  try {
    console.log('Enviando formulario de contacto:', formData);
    
    // Create a new record in the Contact table
    const response = await fetch(
      CONTACT_AIRTABLE_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Nombre: formData.name,
            Correo: formData.email,
            Telefono: formData.phone,
            Mensaje: formData.message
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al enviar el formulario:', errorText);
      return { success: false, message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' };
    }
    
    const result = await response.json();
    console.log('Formulario enviado correctamente:', result);
    return { success: true, message: '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.' };
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    return { success: false, message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.' };
  }
};

// Function to verify current inventory before order submission
export const verifyInventory = async (cartItems) => {
  try {
    console.log('Verificando inventario actual para', cartItems.length, 'productos');
    
    const results = [];
    const outOfStockItems = [];
    const reducedQuantityItems = [];
    
    // Process each item individually to check current inventory
    for (const item of cartItems) {
      try {
        console.log(`Verificando item: ${item.name}, cantidad solicitada: ${item.quantity}, ID: ${item.id}`);
        
        // Get the current record to ensure we have the latest inventory value
        const response = await fetch(
          `${AIRTABLE_URL}/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          console.warn(`Error fetching product data for ${item.name}: ${response.statusText}`);
          continue; // Skip to next item
        }

        const data = await response.json();
        // Ensure current inventory is an integer
        const currentInventory = parseInt(data.fields.invent || 0, 10);
        
        console.log(`Inventario actual de ${item.name}: ${currentInventory}`);
        
        // Check if product is out of stock
        if (currentInventory <= 0) {
          outOfStockItems.push({
            ...item,
            invent: 0
          });
          continue;
        }
        
        // Check if requested quantity exceeds available inventory
        if (item.quantity > currentInventory) {
          reducedQuantityItems.push({
            ...item,
            originalQuantity: item.quantity,
            quantity: currentInventory,
            invent: currentInventory
          });
        } else {
          // Item is available with requested quantity
          results.push({
            ...item,
            invent: currentInventory
          });
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.name}:`, itemError);
        // Continue with next item
      }
    }
    
    return { 
      success: true, 
      outOfStockItems,
      reducedQuantityItems,
      availableItems: results,
      hasChanges: outOfStockItems.length > 0 || reducedQuantityItems.length > 0
    };
  } catch (error) {
    console.error('Error verificando inventario:', error);
    return { 
      success: false, 
      message: 'Error al verificar el inventario actual',
      hasChanges: false
    };
  }
};

// Function to submit order data to Airtable
export const submitOrder = async (orderData) => {
  try {
    console.log('Enviando pedido a Airtable:', orderData);
    
    // Format products list as a string
    const productsString = orderData.items.map(item => 
      `${item.name} (${item.quantity})`
    ).join(', ');
    
    // Create a new record in the Orders table
    const response = await fetch(
      ORDERS_AIRTABLE_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Nombre: orderData.customerName,
            Phone: orderData.customerPhone,
            Productos: productsString,
            Total: orderData.total,
            Delivery: orderData.deliveryOption === 'delivery' ? 'Envío' : 'Recoger',
            Direccion: orderData.deliveryAddress || ''
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al guardar el pedido:', errorText);
      return { success: false, message: 'Error al guardar el pedido. Por favor, inténtalo de nuevo.' };
    }
    
    const result = await response.json();
    console.log('Pedido guardado correctamente:', result);
    return { success: true, message: '¡Pedido guardado correctamente!' };
  } catch (error) {
    console.error('Error al guardar el pedido:', error);
    return { success: false, message: 'Error al guardar el pedido. Por favor, inténtalo de nuevo.' };
  }
};

// Function to fetch all orders from Airtable
export const fetchOrders = async () => {
  try {
    const response = await fetch(
      ORDERS_AIRTABLE_URL,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching orders: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Airtable records to our order format
    return {
      success: true,
      orders: data.records.map(record => ({
        id: record.id,
        nombre: record.fields.Nombre || 'Cliente sin nombre',
        telefono: record.fields.Phone || 'Sin teléfono',
        productos: record.fields.Productos || 'Sin productos',
        total: record.fields.Total || 0,
        delivery: record.fields.Delivery || 'No especificado',
        direccion: record.fields.Direccion || '',
        listo: record.fields.Listo === 'Sí',
        fecha: record.createdTime ? new Date(record.createdTime).toLocaleString('es-ES') : 'Fecha desconocida'
      }))
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, message: 'Error al cargar los pedidos.' };
  }
};

// Function to update order status in Airtable
export const updateOrderStatus = async (orderId, isReady) => {
  try {
    const response = await fetch(
      `${ORDERS_AIRTABLE_URL}/${orderId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Listo: isReady ? 'Sí' : ''
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating order: ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, order: result };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Error al actualizar el estado del pedido.' };
  }
};

// Constante para la tabla de Feedbacks
const FEEDBACKS_TABLE_NAME = import.meta.env.VITE_AIRTABLE_FEEDBACKS_TABLE_NAME || 'Feedbacks';
const FEEDBACKS_AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${FEEDBACKS_TABLE_NAME}`;

// Function to submit feedback data to Airtable
export const submitFeedback = async (feedbackData) => {
  try {
    console.log('Enviando feedback a Airtable:', feedbackData);
    
    // Convertir todos los campos a formato de texto como requiere Airtable
    const servicioTexto = Array.isArray(feedbackData.servicio) ? feedbackData.servicio.join(', ') : String(feedbackData.servicio || '');
    const calificacionTexto = String(feedbackData.calificacion || '');
    const volverTexto = String(feedbackData.volver || '');
    const likeTexto = Array.isArray(feedbackData.like) ? feedbackData.like.join(', ') : String(feedbackData.like || '');
    const comentarioTexto = String(feedbackData.comentario || '');
    const contactoTexto = String(feedbackData.contacto || '');
    
    console.log('Datos convertidos a texto:', {
      Servicio: servicioTexto,
      Calificacion: calificacionTexto,
      Volver: volverTexto,
      Like: likeTexto,
      Comentario: comentarioTexto,
      Contacto: contactoTexto
    });
    
    // Create a new record in the Feedbacks table
    const response = await fetch(
      FEEDBACKS_AIRTABLE_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Servicio: servicioTexto,
            Calificacion: calificacionTexto,
            Volver: volverTexto,
            Like: likeTexto,
            Comentario: comentarioTexto,
            Contacto: contactoTexto
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al guardar el feedback:', errorText);
      return { success: false, message: 'Error al guardar tu opinión. Por favor, inténtalo de nuevo.' };
    }
    
    const result = await response.json();
    console.log('Feedback guardado correctamente:', result);
    return { success: true, message: '¡Gracias por tu opinión!' };
  } catch (error) {
    console.error('Error al guardar el feedback:', error);
    return { success: false, message: 'Error al guardar tu opinión. Por favor, inténtalo de nuevo.' };
  }
};