import { Link } from 'react-router-dom';
import { FaSmokingBan, FaInstagram, FaFacebook, FaTiktok, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-logo">
          <Link to="/">
            <FaSmokingBan className="logo-icon" style={{color: 'var(--primary-color)'}} />
            <span>Vapes Premium</span>
          </Link>
          <p>Los mejores productos de vapeo para ti</p>
        </div>

        <div className="footer-links">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/menu">Servicios</Link></li>
            <li><Link to="/menu">Productos</Link></li>
            <li><Link to="/about">Nosotros</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Contáctanos</h3>
          <p><FaPhone /> +506 8632-2460</p>
          <p><FaMapMarkerAlt /> San José, Costa Rica</p>
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15721.553186229368!2d-84.08800565!3d9.9325367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0e342c50d15c5%3A0xe6746c7966cf7bbe!2sSan%20Jos%C3%A9%2C%20Costa%20Rica!5e0!3m2!1sen!2sus!4v1625764215694!5m2!1sen!2sus"
              width="100%"
              height="100"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Ubicación de la Panadería"
            ></iframe>
          </div>
        </div>

        <div className="footer-social">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              <FaTiktok />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} Vapes Premium. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;