import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css'; // Crearemos este archivo CSS

const AdminLogin = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username === 'Admin' && pin === '1818') {
      setError('');
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      navigate('/admin');
    } else {
      setError('Usuario o PIN incorrecto. Inténtalo de nuevo.');
      setIsAuthenticated(false);
      localStorage.removeItem('isAdminAuthenticated');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Acceso de Administrador</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pin">PIN:</label>
            <input
              type="password" 
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              maxLength="4" 
            />
          </div>
          {error && <p className="error-message-login">{error}</p>}
          <button type="submit" className="login-button">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;