import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar, FaQuoteLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';
import '../styles/Home.css';
import { fetchProducts } from '../services/airtableService';

const Home = () => {
  
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);

  // Cargar productos desde Airtable
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchProducts();
        
        // Filtrar promociones (esp = 'promo')
        const promos = productsData.filter(product => product.esp === 'promo');
        setPromotions(promos);

        // Filtrar servicios (esp = 'Servicios')
        const serviciosData = productsData.filter(product => product.esp === 'Servicios');
        
        // Ordenar servicios: primero los destacados, luego el resto
        const serviciosDestacados = serviciosData.filter(servicio => servicio.destacado);
        const serviciosNoDestacados = serviciosData.filter(servicio => !servicio.destacado);
        
        // Mezclar servicios no destacados aleatoriamente
        const serviciosNoDestacadosRandom = [...serviciosNoDestacados].sort(() => Math.random() - 0.5);
        
        // Combinar destacados + aleatorios (hasta completar 3)
        const serviciosCombinados = [...serviciosDestacados, ...serviciosNoDestacadosRandom];
        setServicios(serviciosCombinados);
        
        // Filtrar productos para mascotas (esp = 'Producto')
        const productosData = productsData.filter(product => product.esp === 'Producto');
        
        // Ordenar productos: primero los destacados, luego el resto
        const productosDestacados = productosData.filter(producto => producto.destacado);
        const productosNoDestacados = productosData.filter(producto => !producto.destacado);
        
        // Mezclar productos no destacados aleatoriamente
        const productosNoDestacadosRandom = [...productosNoDestacados].sort(() => Math.random() - 0.5);
        
        // Combinar destacados + aleatorios (hasta completar 6)
        const productosCombinados = [...productosDestacados, ...productosNoDestacadosRandom];
        setProductos(productosCombinados);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'María Rodríguez',
      text: 'El cuidado que recibió mi perrito fue excepcional. El servicio de baño y peluquería dejó a mi mascota irreconocible de lo hermoso que quedó.',
      rating: 5
    },
    {
      id: 2,
      name: 'Carlos Méndez',
      text: 'Dejé a mi mascota en el hotel canino durante mis vacaciones y regresó feliz y bien cuidado. La atención personalizada me dio mucha tranquilidad.',
      rating: 5
    },
    {
      id: 3,
      name: 'Laura Jiménez',
      text: 'Los productos que venden son de excelente calidad. Mi lugar de confianza para todo lo que necesita mi mascota.',
      rating: 4
    }
  ];

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(<FaStar key={i} className="star-icon" />);
    }
    return stars;
  };

  return (
    <div className="home-page">
      <SEO 
        title="Inicio" 
        description="Panadería artesanal especializada en pan sin levadura. Descubre nuestros productos frescos elaborados con ingredientes naturales y técnicas tradicionales ancestrales."
      />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Dariel Pet Care</h1>
          <p>Cuidado profesional y personalizado para el bienestar de tu mascota</p>
          <div className="hero-buttons">
            <Link to="/menu" className="cta-button">
              Nuestros Servicios <FaArrowRight className="arrow-icon" />
            </Link>
            <Link to="/contact" className="cta-button secondary">
              Agendar Cita <FaArrowRight className="arrow-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section className="section promotions-section">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="promotions-grid">
            {isLoading ? (
              <p>Cargando servicios...</p>
            ) : (
              // Mostrar solo los primeros 3 servicios
              servicios.length > 0 ? (
                servicios.slice(0, 3).map((servicio) => (
                  <div className="promo-card" key={servicio.id}>
                    <div className="promo-image">
                      <img src={servicio.image} alt={servicio.name} />
                    </div>
                    <div className="promo-content">
                      <h3>{servicio.name}</h3>
                      <p>{servicio.description}</p>
                      <div className="product-price-row">
                        <span className="product-price">₡{servicio.price.toLocaleString()}</span>
                        <button onClick={(e) => addToCart(servicio, e.currentTarget)} className="promo-button">Agregar</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay servicios disponibles en este momento.</p>
              )
            )}
          </div>
          <div className="view-all-container">
            <Link to="/menu" className="view-all-button">Ver Todos los Servicios</Link>
          </div>
        </div>
      </section>

      {/* Productos para tu Mascota Section */}
      <section className="section featured-section">
        <div className="container">
          <h2 className="section-title">Productos para tu Mascota</h2>
          <div className="featured-grid">
            {isLoading ? (
              <p>Cargando productos...</p>
            ) : productos.length > 0 ? (
              productos.slice(0, 6).map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    {product.invent > 0 && product.invent <= 5 && (
                      <div className="low-stock-tag">Pocas unidades</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price-row">
                      <span className="product-price">₡{product.price.toLocaleString()}</span>
                      <button onClick={(e) => addToCart(product, e.currentTarget)} className="add-to-cart-btn">Agregar</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay productos disponibles en este momento.</p>
            )}
          </div>
          <div className="view-all-container">
            <Link to="/products" className="view-all-button">Ver Todos los Productos</Link>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="section testimonials-section">
        <div className="container">
          <h2 className="section-title">La Opinión de Nuestros Clientes</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div className="testimonial-card" key={testimonial.id}>
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="testimonial-name">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section cta-section" style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1560743641-3914f2c45636?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="container">
          <div className="cta-content">
            <h2>¿Tu mascota merece lo mejor?</h2>
            <p>Agenda una cita hoy mismo y bríndale el cuidado que se merece</p>
            <Link to="/contact" className="cta-button large">Agendar Cita</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;