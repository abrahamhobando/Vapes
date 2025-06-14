import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaShoppingCart, FaFire } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import '../styles/Header.css';
import logoImage from '../assets/images/LOGO Da.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getCartCount, toggleCart, cartIconRef } = useCart();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <FaFire className="logo-icon" style={{color: 'var(--primary-color)', fontSize: '2rem'}} />
            <span>3 de Espadas</span>
          </Link>
        </div>

        {/* Menú hamburguesa solo en móvil/tablet */}
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Abrir menú">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav ${isOpen ? 'active' : ''}`}>
          <ul className="nav-list">
  <li className="nav-item">
    <Link to="/" onClick={() => setIsOpen(false)}>Inicio</Link>
  </li>
  <li className="nav-item">
    <Link to="/products" onClick={() => setIsOpen(false)}>Productos</Link>
  </li>
  <li className="nav-item">
    <Link to="/contact" onClick={() => setIsOpen(false)}>Contacto</Link>
  </li>
</ul>
        </nav>

        <div className="cart-badge" onClick={toggleCart} ref={cartIconRef}>
          <FaShoppingCart />
          {getCartCount() > 0 && <span className="count">{getCartCount()}</span>}
        </div>

        <Cart />
      </div>
    </header>
  );
};

export default Header;