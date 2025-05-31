import React, { useState, useEffect } from 'react';
import '../styles/About.css';
import { FaHeart, FaStar, FaHandshake, FaLeaf, FaPaw, FaDog, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { fetchProducts } from '../services/airtableService';

const About = () => {
  const [servicios, setServicios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar servicios desde Airtable
  useEffect(() => {
    const loadServicios = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchProducts();
        // Filtrar solo los elementos marcados como 'Servicios' en el campo Esp
        const serviciosData = productsData.filter(product => product.esp === 'Servicios');
        // Mostrar solo los primeros 3 servicios
        setServicios(serviciosData.slice(0, 3));
      } catch (error) {
        console.error('Error cargando servicios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServicios();
  }, []);
  return (
    <div className="about-page">
      <SEO 
        title="Nosotros" 
        description="Conoce más sobre Dariel Pet Care, mi historia, misión y compromiso con el cuidado y bienestar de tu mascota."
      />
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <h1>Sobre Dariel Pet Care</h1>
          <p>Conoce mi historia y pasión por el cuidado de las mascotas</p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="about-intro-section">
        <div className="container">
          <h2>Mi Historia</h2>
          <p>
            Dariel Pet Care nació en 2015 de mi pasión por el cuidado y bienestar animal. Tras años de formación y experiencia en el cuidado de mascotas, decidí crear un emprendimiento donde las mascotas recibieran atención personalizada y de calidad.
          </p>
          <p>
            Lo que comenzó como un pequeño servicio de cuidado a domicilio se ha convertido en un emprendimiento integral de servicios para mascotas, manteniendo siempre mi compromiso con el trato humano, el cuidado profesional y el amor por los animales.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-box">
              <h2>Mi Misión</h2>
              <p>
                En Dariel Pet Care, mi misión es ofrecer servicios de cuidado animal de la más alta calidad, con un enfoque personalizado que prioriza el bienestar y la felicidad de cada mascota que atiendo.
              </p>
              <p>
                Me esfuerzo por brindar servicios completos como baños, peluquería, hotel canino y productos especializados, creando una experiencia donde las mascotas se sientan seguras y amadas, y sus dueños confíen plenamente en mi cuidado.
              </p>
            </div>
            <div className="vision-box">
              <h2>Mi Compromiso</h2>
              <p>
                Me comprometo a utilizar técnicas y productos de la más alta calidad, manteniéndome actualizado con las mejores prácticas de cuidado animal para ofrecer siempre la mejor atención posible a cada mascota.
              </p>
              <p>
                Cada mascota que recibo obtiene atención personalizada y cariño, entendiendo que no solo cuido animales, sino miembros queridos de una familia que merecen respeto, dedicación y los mejores cuidados profesionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Mis Valores</h2>
          <div className="values-grid">
            <div className="value-card">
              <FaHeart className="value-icon" />
              <h3>Pasión</h3>
              <p>Amo lo que hago y eso se refleja en el cuidado que brindo a cada mascota.</p>
            </div>
            <div className="value-card">
              <FaStar className="value-icon" />
              <h3>Calidad</h3>
              <p>Utilizo los mejores productos y técnicas para ofrecer servicios excepcionales.</p>
            </div>
            <div className="value-card">
              <FaPaw className="value-icon" />
              <h3>Bienestar Animal</h3>
              <p>Priorizo la comodidad y felicidad de cada mascota en todos mis servicios.</p>
            </div>
            <div className="value-card">
              <FaDog className="value-icon" />
              <h3>Atención Personalizada</h3>
              <p>Cada mascota recibe un trato único adaptado a sus necesidades específicas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="history-section">
        <div className="container">
          <div className="history-content">
            <h2>Mi Trayectoria</h2>
            <div className="history-text">
              <p>
                Todo comenzó en 2015, cuando decidí transformar mi amor por los animales en un emprendimiento dedicado al cuidado integral de mascotas. Después de años de formación en técnicas de cuidado animal, grooming y comportamiento canino, inicié este proyecto con una misión clara: ofrecer servicios de calidad con un toque personal y cariñoso.
              </p>
              <p>
                Lo que comenzó como un servicio a domicilio para amigos y familiares, se ha convertido en un emprendimiento reconocido por la dedicación y el cariño en cada servicio. Cada día me esfuerzo por seguir aprendiendo y mejorando para brindar la mejor experiencia a cada mascota y su familia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="team-section">
        <div className="container">
          <h2>Mis Servicios</h2>
          <div className="team-grid">
            {isLoading ? (
              // Mostrar placeholders mientras carga
              [...Array(3)].map((_, index) => (
                <div className="team-member" key={`skeleton-${index}`}>
                  <div className="member-image skeleton-image"></div>
                  <h3 className="skeleton-text"></h3>
                  <p className="skeleton-text"></p>
                  <p className="skeleton-text"></p>
                </div>
              ))
            ) : (
              // Mostrar servicios desde Airtable
              servicios.map((servicio) => (
                <div className="team-member" key={servicio.id}>
                  <div className="member-image">
                    <img src={servicio.image} alt={servicio.name} />
                  </div>
                  <h3>{servicio.name}</h3>
                  <p>{servicio.category}</p>
                  <p>{servicio.description}</p>
                </div>
              ))
            )}
          </div>
          <div className="view-all-container">
            <Link to="/menu" className="view-all-button">
              Ver todos los servicios <FaArrowRight className="arrow-icon" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;