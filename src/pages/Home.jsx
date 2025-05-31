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
      text: 'Los sabores de los líquidos son increíbles y la calidad del vapor es excepcional. VapeZone se ha convertido en mi tienda favorita.',
      rating: 5
    },
    {
      id: 2,
      name: 'Carlos Méndez',
      text: 'Compré mi primer vape aquí y el asesoramiento fue perfecto. Los dispositivos son de alta calidad y duran mucho tiempo.',
      rating: 5
    },
    {
      id: 3,
      name: 'Laura Jiménez',
      text: 'Excelente variedad de productos y marcas reconocidas. El servicio al cliente es de primera y siempre tienen las últimas novedades.',
      rating: 5
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
        description="VapeZone - Tu tienda especializada en vapes y líquidos premium. Descubre la mejor selección de dispositivos de vapeo, e-liquids y accesorios de las marcas más reconocidas."
      />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>VapeZone</h1>
          <p>Los mejores vapes y líquidos premium para tu experiencia perfecta</p>
          <div className="hero-buttons">
            <Link to="/menu" className="cta-button">
              Ver Productos <FaArrowRight className="arrow-icon" />
            </Link>
            <Link to="/contact" className="cta-button secondary">
              Explorar Catálogo <FaArrowRight className="arrow-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section className="section promotions-section">
        <div className="container">
          <h2 className="section-title">Productos Destacados</h2>
          <div className="promotions-grid">
            {isLoading ? (
              <p>Cargando servicios...</p>
            ) : (
              // Mostrar solo los primeros 3 productos
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
                <p>No hay productos disponibles en este momento.</p>
              )
            )}
          </div>
          <div className="view-all-container">
            <Link to="/menu" className="view-all-button">Ver Todos los Productos</Link>
          </div>
        </div>
      </section>

      {/* Productos para tu Mascota Section */}
      <section className="section featured-section">
        <div className="container">
          <h2 className="section-title">Líquidos y Accesorios</h2>
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
            <Link to="/products" className="view-all-button">Ver Todo el Catálogo</Link>
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
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Buscas la mejor experiencia de vapeo?</h2>
            <p>Descubre nuestra selección premium de vapes y líquidos de las mejores marcas</p>
            <Link to="/products" className="cta-button large">Explorar Catálogo</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;