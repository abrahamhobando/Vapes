import { useState, useEffect } from 'react';
import { FaCheck, FaSpinner, FaSync, FaCalendarAlt, FaUser, FaPhone, FaShoppingBag, FaMoneyBillWave, FaMapMarkerAlt, FaTimes, FaHourglassHalf, FaUndo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../styles/Admin.css';

const AIRTABLE_API_KEY = 'patAnz5UFfhV1J8kH.2ae8750a7ae672f5caecc25c7ed7c2fa4ecee92af4f239ca0d4f5f524e94b6f2';
const AIRTABLE_BASE_ID = 'appQelh4ddza6AoIK';
const ORDERS_TABLE_NAME = 'Pedidos';
const ORDERS_AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${ORDERS_TABLE_NAME}`;

// Definición de estados de pedido
const ORDER_STATUS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Listo',
  CANCELLED: 'Cancelado',
};

// Mapeo de valores de Airtable a estados locales
const AIRTABLE_STATUS_MAP = {
  'Sí': ORDER_STATUS.COMPLETED,
  'En Progreso': ORDER_STATUS.IN_PROGRESS,
  'Cancelado': ORDER_STATUS.CANCELLED,
  // 'No' o undefined/null se considerarán PENDING por defecto
};

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // Para deshabilitar botones del pedido específico

  // Función para cargar los pedidos desde Airtable
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        ORDERS_AIRTABLE_URL,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error al cargar pedidos: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformar los registros de Airtable a nuestro formato de pedidos
      const formattedOrders = data.records.map(record => {
        let status = ORDER_STATUS.PENDING; // Por defecto
        const airtableStatus = record.fields.Listo;
        if (airtableStatus && AIRTABLE_STATUS_MAP[airtableStatus]) {
          status = AIRTABLE_STATUS_MAP[airtableStatus];
        } else if (airtableStatus === 'Sí') { // Compatibilidad con el antiguo 'Sí'
            status = ORDER_STATUS.COMPLETED;
        } else if (!airtableStatus || airtableStatus === 'No') {
            status = ORDER_STATUS.PENDING;
        }

        return {
          id: record.id,
          nombre: record.fields.Nombre || 'Cliente sin nombre',
          telefono: record.fields.Phone || 'Sin teléfono',
          productos: record.fields.Productos || 'Sin productos',
          total: record.fields.Total || 0,
          delivery: record.fields.Delivery || 'No especificado',
          direccion: record.fields.Direccion || '',
          status: status, // Usar el nuevo campo de estado
          fecha: record.createdTime ? new Date(record.createdTime).toLocaleString('es-ES') : 'Fecha desconocida'
        };
      });
      
      setOrders(formattedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setError('Error al cargar los pedidos. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    fetchOrders();
  }, []);

  // Función genérica para actualizar el estado de un pedido
  const updateOrderStatus = async (orderId, newAirtableStatus, newLocalStatus, successMessage) => {
    setUpdatingOrderId(orderId);
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
              Listo: newAirtableStatus // 'Listo' es el nombre de la columna en Airtable
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error al actualizar pedido: ${response.statusText}`);
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newLocalStatus } : order
        )
      );
      toast.success(successMessage);
    } catch (error) {
      console.error(`Error al cambiar estado a ${newLocalStatus}:`, error);
      toast.error(`Error al actualizar el pedido a ${newLocalStatus}.`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const markOrderAsReady = (orderId) => updateOrderStatus(orderId, 'Sí', ORDER_STATUS.COMPLETED, '¡Pedido marcado como Listo!');
  const markOrderAsInProgress = (orderId) => updateOrderStatus(orderId, 'En Progreso', ORDER_STATUS.IN_PROGRESS, 'Pedido marcado En Progreso.');
  const cancelOrder = (orderId) => updateOrderStatus(orderId, 'Cancelado', ORDER_STATUS.CANCELLED, 'Pedido Cancelado.');
  const revertToPending = (orderId) => updateOrderStatus(orderId, 'No', ORDER_STATUS.PENDING, 'Pedido devuelto a Pendiente.');

  // Filtrar pedidos por estado
  const pendingOrders = orders.filter(order => order.status === ORDER_STATUS.PENDING);
  const inProgressOrders = orders.filter(order => order.status === ORDER_STATUS.IN_PROGRESS);
  const completedOrders = orders.filter(order => order.status === ORDER_STATUS.COMPLETED);
  const cancelledOrders = orders.filter(order => order.status === ORDER_STATUS.CANCELLED);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Administración de Pedidos</h1>
        <button 
          className="refresh-button" 
          onClick={fetchOrders} 
          disabled={loading || updatingOrderId}
        >
          {loading && !updatingOrderId ? <FaSpinner className="spinner" /> : <FaSync />}
          Actualizar Pedidos
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Sección de Resumen */} 
      {!loading && orders.length > 0 && (
        <div className="admin-summary">
          <h2>Resumen de Pedidos</h2>
          <div className="summary-grid">
            <div className="summary-item"><strong>Pendientes:</strong> {pendingOrders.length}</div>
            <div className="summary-item"><strong>En Progreso:</strong> {inProgressOrders.length}</div>
            <div className="summary-item"><strong>Listos:</strong> {completedOrders.length}</div>
            <div className="summary-item"><strong>Cancelados:</strong> {cancelledOrders.length}</div>
            <div className="summary-item"><strong>Total:</strong> {orders.length}</div>
          </div>
        </div>
      )}

      <div className="orders-container">
        {/* Sección de pedidos pendientes */} 
        <div className="orders-section pending-orders">
          <h2><FaHourglassHalf /> Pedidos Pendientes ({pendingOrders.length})</h2>
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Cargando pedidos...</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="empty-orders">
              <p>No hay pedidos pendientes</p>
            </div>
          ) : (
            <div className="orders-list">
              {pendingOrders.map(order => (
                <div key={order.id} className={`order-card status-${order.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="order-header">
                    <div className="order-date">
                      <FaCalendarAlt />
                      <span>{order.fecha}</span>
                    </div>
                    <span className={`order-status-tag status-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-info">
                      <div className="info-item">
                        <FaUser />
                        <span><strong>Cliente:</strong> {order.nombre}</span>
                      </div>
                      <div className="info-item">
                        <FaPhone />
                        <span><strong>Teléfono:</strong> <a href={`https://wa.me/+506${order.telefono.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">{order.telefono}</a></span>
                      </div>
                      <div className="info-item">
                        <FaShoppingBag />
                        <span><strong>Productos:</strong> {order.productos}</span>
                      </div>
                      <div className="info-item">
                        <FaMoneyBillWave />
                        <span><strong>Total:</strong> ₡{order.total.toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <span><strong>Método:</strong> {order.delivery}</span>
                      </div>
                      {order.direccion && (
                        <div className="info-item">
                          <FaMapMarkerAlt />
                          <span><strong>Dirección:</strong> {order.direccion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="order-actions">
                    {order.status === ORDER_STATUS.PENDING && (
                      <>
                        <button onClick={() => markOrderAsInProgress(order.id)} disabled={updatingOrderId === order.id} className="action-button progress">
                          {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaHourglassHalf />} En Progreso
                        </button>
                        <button onClick={() => markOrderAsReady(order.id)} disabled={updatingOrderId === order.id} className="action-button ready">
                          {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaCheck />} Listo
                        </button>
                      </>
                    )}
                    {order.status === ORDER_STATUS.IN_PROGRESS && (
                      <>
                        <button onClick={() => markOrderAsReady(order.id)} disabled={updatingOrderId === order.id} className="action-button ready">
                          {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaCheck />} Listo
                        </button>
                        <button onClick={() => revertToPending(order.id)} disabled={updatingOrderId === order.id} className="action-button revert">
                          {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaUndo />} A Pendiente
                        </button>
                      </>
                    )}
                    {order.status !== ORDER_STATUS.CANCELLED && (
                        <button onClick={() => cancelOrder(order.id)} disabled={updatingOrderId === order.id} className="action-button cancel">
                            {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaTimes />} Cancelar
                        </button>
                    )}
                    {(order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.CANCELLED) && (
                        <button onClick={() => revertToPending(order.id)} disabled={updatingOrderId === order.id} className="action-button revert">
                            {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaUndo />} A Pendiente
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de pedidos En Progreso */} 
        <div className="orders-section in-progress-orders">
          <h2><FaHourglassHalf style={{ color: '#ffa000' }} /> Pedidos En Progreso ({inProgressOrders.length})</h2>
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Cargando pedidos...</p>
            </div>
          ) : inProgressOrders.length === 0 ? (
            <div className="empty-orders">
              <p>No hay pedidos en progreso</p>
            </div>
          ) : (
            <div className="orders-list">
              {inProgressOrders.map(order => (
                <div key={order.id} className={`order-card status-${order.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="order-header">
                    <div className="order-date">
                      <FaCalendarAlt />
                      <span>{order.fecha}</span>
                    </div>
                    <span className={`order-status-tag status-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span>
                  </div>
                  <div className="order-details">
                    <div className="order-info">
                      <div className="info-item"><FaUser /><span><strong>Cliente:</strong> {order.nombre}</span></div>
                      <div className="info-item"><FaPhone /><span><strong>Teléfono:</strong> <a href={`https://wa.me/+506${order.telefono.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">{order.telefono}</a></span></div>
                      <div className="info-item"><FaShoppingBag /><span><strong>Productos:</strong> {order.productos}</span></div>
                      <div className="info-item"><FaMoneyBillWave /><span><strong>Total:</strong> ₡{order.total.toLocaleString()}</span></div>
                      <div className="info-item"><span><strong>Método:</strong> {order.delivery}</span></div>
                      {order.direccion && <div className="info-item"><FaMapMarkerAlt /><span><strong>Dirección:</strong> {order.direccion}</span></div>}
                    </div>
                  </div>
                  <div className="order-actions">
                    <button onClick={() => markOrderAsReady(order.id)} disabled={updatingOrderId === order.id} className="action-button ready">
                      {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaCheck />} Listo
                    </button>
                    <button onClick={() => revertToPending(order.id)} disabled={updatingOrderId === order.id} className="action-button revert">
                      {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaUndo />} A Pendiente
                    </button>
                    <button onClick={() => cancelOrder(order.id)} disabled={updatingOrderId === order.id} className="action-button cancel">
                      {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaTimes />} Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de pedidos completados */} 
        <div className="orders-section completed-orders">
          <h2><FaCheck style={{ color: '#2e7d32' }} /> Pedidos Listos ({completedOrders.length})</h2>
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Cargando pedidos...</p>
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="empty-orders">
              <p>No hay pedidos completados</p>
            </div>
          ) : (
            <div className="orders-list">
              {completedOrders.map(order => (
                <div key={order.id} className={`order-card status-${order.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="order-header">
                    <div className="order-date">
                      <FaCalendarAlt />
                      <span>{order.fecha}</span>
                    </div>
                     <span className={`order-status-tag status-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-info">
                      <div className="info-item">
                        <FaUser />
                        <span><strong>Cliente:</strong> {order.nombre}</span>
                      </div>
                      <div className="info-item">
                        <FaPhone />
                        <span><strong>Teléfono:</strong> <a href={`https://wa.me/${order.telefono.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">{order.telefono}</a></span>
                      </div>
                      <div className="info-item">
                        <FaShoppingBag />
                        <span><strong>Productos:</strong> {order.productos}</span>
                      </div>
                      <div className="info-item">
                        <FaMoneyBillWave />
                        <span><strong>Total:</strong> ₡{order.total.toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <span><strong>Método:</strong> {order.delivery}</span>
                      </div>
                      {order.direccion && (
                        <div className="info-item">
                          <FaMapMarkerAlt />
                          <span><strong>Dirección:</strong> {order.direccion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="order-actions">
                    <button onClick={() => revertToPending(order.id)} disabled={updatingOrderId === order.id} className="action-button revert">
                      {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaUndo />} A Pendiente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de pedidos Cancelados */} 
        <div className="orders-section cancelled-orders">
          <h2><FaTimes style={{ color: '#c62828' }} /> Pedidos Cancelados ({cancelledOrders.length})</h2>
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Cargando pedidos...</p>
            </div>
          ) : cancelledOrders.length === 0 ? (
            <div className="empty-orders">
              <p>No hay pedidos cancelados</p>
            </div>
          ) : (
            <div className="orders-list">
              {cancelledOrders.map(order => (
                <div key={order.id} className={`order-card status-${order.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="order-header">
                    <div className="order-date">
                      <FaCalendarAlt />
                      <span>{order.fecha}</span>
                    </div>
                    <span className={`order-status-tag status-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span>
                  </div>
                  <div className="order-details">
                    <div className="order-info">
                      <div className="info-item"><FaUser /><span><strong>Cliente:</strong> {order.nombre}</span></div>
                      <div className="info-item"><FaPhone /><span><strong>Teléfono:</strong> <a href={`https://wa.me/+506${order.telefono.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">{order.telefono}</a></span></div>
                      <div className="info-item"><FaShoppingBag /><span><strong>Productos:</strong> {order.productos}</span></div>
                      <div className="info-item"><FaMoneyBillWave /><span><strong>Total:</strong> ₡{order.total.toLocaleString()}</span></div>
                      <div className="info-item"><span><strong>Método:</strong> {order.delivery}</span></div>
                      {order.direccion && <div className="info-item"><FaMapMarkerAlt /><span><strong>Dirección:</strong> {order.direccion}</span></div>}
                    </div>
                  </div>
                  <div className="order-actions">
                    <button onClick={() => revertToPending(order.id)} disabled={updatingOrderId === order.id} className="action-button revert">
                      {updatingOrderId === order.id ? <FaSpinner className="spinner" /> : <FaUndo />} A Pendiente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Admin;