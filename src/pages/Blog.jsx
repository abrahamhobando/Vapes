import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import '../styles/Blog.css';
import { fetchProducts } from '../services/airtableService';

const formatText = (text) => {
  if (!text) return '';

  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const blogPosts = [
  {
    id: 1,
    title: "El Inicio de Dariel Pet Care: Mi Historia",
    date: '2023-05-15',
    excerpt: 'Descubre cómo comenzó mi pasión por el cuidado animal y el viaje que me llevó a crear Dariel Pet Care.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    content: `
      Todo comenzó con una simple pero poderosa pasión: brindar el mejor cuidado posible a las mascotas. 
      Esta visión nació de mi profundo amor por los animales y la creencia en la importancia de ofrecerles un trato personalizado y de calidad que priorice su bienestar y felicidad.

      Mi historia comenzó en 2015, cuando después de años de formación en técnicas de cuidado animal, grooming y comportamiento canino, decidí transformar mi pasión en un emprendimiento dedicado al cuidado integral de mascotas. El camino no fue fácil, pero cada desafío me hizo más fuerte y más determinado. Con cada experiencia, aprendí algo nuevo sobre las necesidades específicas de diferentes razas y personalidades.

      Lo que comenzó como un servicio a domicilio para amigos y familiares, se ha convertido en un emprendimiento reconocido por la dedicación y el cariño en cada servicio. Cada día me esfuerzo por seguir aprendiendo y mejorando para brindar la mejor experiencia a cada mascota y su familia.

      Hoy, Dariel Pet Care se ha convertido en un referente en el cuidado animal personalizado, manteniendo siempre mi compromiso con la calidad y el amor que caracteriza mi trabajo desde el primer día. Cada mascota que recibo cuenta una historia de pasión, dedicación y cariño genuino.
    `,
    recommendedProducts: [
      {
        id: 1,
        name: 'Champú Premium para Pelajes Sensibles',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 2,
        name: 'Cepillo Deslanador Profesional',
        price: 18000,
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      }
    ]
  },
  {
    id: 2,
    title: 'Cuidados Esenciales para el Pelaje de tu Mascota',
    date: '2023-04-10',
    excerpt: 'Aprende sobre los cuidados básicos que necesita el pelaje de tu mascota para mantenerlo saludable, brillante y libre de problemas.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    content: `
      El pelaje de tu mascota es mucho más que una simple cubierta estética; es un indicador de su salud general y cumple funciones vitales como la regulación de temperatura y protección. Por eso, mantenerlo en óptimas condiciones es fundamental para el bienestar de tu compañero peludo.

      **Cepillado Regular: La Base del Cuidado**

      Dependiendo del tipo de pelaje, tu mascota necesitará un cepillado diario o semanal. Esta rutina no solo elimina pelos muertos y previene nudos, sino que también estimula la circulación sanguínea y distribuye los aceites naturales, dando como resultado un pelaje más brillante y saludable.

      **Baños: Calidad sobre Cantidad**
      
      Contrario a lo que muchos piensan, bañar a tu mascota con demasiada frecuencia puede ser contraproducente. Los baños excesivos eliminan los aceites naturales protectores del pelaje, causando sequedad y posibles problemas dermatológicos. La frecuencia ideal varía según la raza, estilo de vida y condiciones específicas de cada animal.

      En Dariel Pet Care utilizo productos específicamente formulados para cada tipo de pelaje y condición, asegurando que cada baño sea una experiencia beneficiosa y agradable para tu mascota.

      **Nutrición: Belleza desde el Interior**

      Un pelaje saludable comienza con una alimentación adecuada. Proteínas de alta calidad, ácidos grasos esenciales (especialmente Omega-3 y Omega-6), vitaminas y minerales son fundamentales para mantener un pelaje brillante y resistente.

      **Signos de Alerta**

      Presta atención a cambios en el pelaje de tu mascota como caída excesiva, zonas calvas, descamación, opacidad o cambios de color. Estos pueden ser indicadores de problemas de salud que requieren atención veterinaria.

      En Dariel Pet Care no solo me enfoco en la estética, sino en el bienestar integral de tu mascota, ofreciendo servicios de grooming profesional que contribuyen a su salud y felicidad.
    `,
    recommendedProducts: [
      {
        id: 11,
        name: 'Acondicionador Natural para Perros',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 4,
        name: 'Set de Cepillos Profesionales',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      }
    ]
  },
  {
    id: 3,
    title: 'Preparando a tu Mascota para su Estancia en el Hotel Canino',
    date: '2023-03-18',
    excerpt: 'Consejos prácticos para que la experiencia de tu perro en nuestro hotel canino sea positiva y enriquecedora.',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    content: `
      Dejar a tu mascota al cuidado de otros puede generar ansiedad tanto en el animal como en su familia humana. En Dariel Pet Care entiendo esta preocupación y me esfuerzo por hacer que la estancia de tu perro en mi hotel canino sea una experiencia positiva y enriquecedora.

      **Preparación Previa**

      Una visita de familiarización antes de la estancia puede ayudar a tu perro a conocer el entorno y a mí como su cuidador. Esto reduce significativamente el estrés durante la estancia real. También es recomendable traer objetos familiares como su cama, juguetes favoritos o una prenda con tu olor.

      **Información Detallada**

      Proporcionar información completa sobre las rutinas, preferencias, necesidades médicas y peculiaridades de comportamiento de tu mascota me permite ofrecerle un cuidado personalizado que respete sus hábitos y necesidades individuales.

      **Mantén la Calma en la Despedida**

      Las despedidas largas y emotivas pueden transmitir ansiedad a tu mascota. Una despedida breve, positiva y segura ayuda a establecer que su estancia será temporal y agradable.

      **Comunicación Durante la Estancia**

      En Dariel Pet Care entiendo la importancia de mantenerte informado. Por eso, envío actualizaciones regulares y fotos de tu mascota disfrutando de su estancia, para tu tranquilidad.

      **El Regreso a Casa**

      Después de la estancia, tu perro puede necesitar un tiempo para readaptarse a la rutina hogareña. Mantén la calma y sé paciente durante este proceso de transición.

      Mi compromiso es ofrecer no solo un lugar seguro donde tu mascota pueda quedarse, sino un verdadero hogar temporal donde reciba atención personalizada, ejercicio adecuado, estimulación mental y todo el cariño que merece.
    `,
    recommendedProducts: [
      {
        id: 15,
        name: 'Cama Ortopédica para Perros',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1541599188900-560da8683fb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 16,
        name: 'Juguete Interactivo Dispensador',
        price: 18000,
        image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 17,
        name: 'Manta de Confort con Feromonas',
        price: 22000,
        image: 'https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      }
    ]
  },
  {
    id: 4,
    title: 'Beneficios de la Peluquería Profesional para tu Mascota',
    date: '2023-02-20',
    excerpt: 'Descubre por qué la peluquería profesional es mucho más que estética: es salud, bienestar y prevención para tu compañero peludo.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    content: `
      La peluquería canina profesional va mucho más allá de la estética; es un componente esencial del cuidado integral de tu mascota que contribuye significativamente a su salud y bienestar general.

      **Salud Dermatológica**

      Durante una sesión de peluquería profesional, puedo detectar tempranamente problemas como parásitos externos, infecciones cutáneas, alergias o crecimientos anormales que podrían pasar desapercibidos en casa. La detección precoz de estas condiciones puede marcar una gran diferencia en su tratamiento y pronóstico.

      **Prevención de Problemas**

      El mantenimiento regular previene problemas como nudos severos que pueden causar dolor e incluso lesiones en la piel. También evita la acumulación excesiva de pelo muerto que puede provocar problemas respiratorios y dermatológicos.

      **Cuidado Especializado**

      Cada raza tiene necesidades específicas de grooming. Como profesional, conozco las técnicas y herramientas adecuadas para cada tipo de pelaje y estructura corporal, minimizando el estrés y maximizando los beneficios de cada sesión.

      **Cuidado de Áreas Sensibles**

      Áreas como oídos, ojos, almohadillas plantares y zona perianal requieren atención especial. La limpieza profesional de estas zonas previene infecciones y otros problemas de salud.

      **Experiencia Positiva**

      En Dariel Pet Care, cada sesión de peluquería está diseñada para ser una experiencia positiva y relajante. Utilizo técnicas de manejo suave y productos de alta calidad específicos para cada necesidad, creando un ambiente tranquilo donde tu mascota se sienta segura y cómoda.

      La peluquería profesional regular no solo mantiene a tu mascota luciendo hermosa, sino que es una inversión en su salud y bienestar a largo plazo. Te invito a experimentar la diferencia que un cuidado profesional y personalizado puede hacer en la vida de tu compañero peludo.
    `,
    recommendedProducts: [
      {
        id: 1,
        name: 'Champú Premium para Pelajes Sensibles',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 18,
        name: 'Perfume Hipoalergénico para Perros',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 19,
        name: 'Acondicionador Desenredante',
        price: 14000,
        image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
      }
    ]
  }
];

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const { addToCart } = useCart();
  
  // Cargar productos y servicios desde Airtable
  useEffect(() => {
    const loadProductsAndServices = async () => {
      try {
        const productsData = await fetchProducts();
  
        const productItems = productsData.filter(item => item.esp === 'Producto');
        const serviceItems = productsData.filter(item => item.esp === 'Servicios');
        
        setProducts(productItems);
        setServices(serviceItems);
      } catch (error) {
        console.error('Error cargando productos y servicios:', error);
      }
    };
    
    loadProductsAndServices();
  }, []);

  const handlePostClick = (post) => {

    const postWithRecommendations = {
      ...post,
      dynamicRecommendations: getRecommendationsForPost(post)
    };
    setSelectedPost(postWithRecommendations);
  };
  

  const getRecommendationsForPost = (post) => {

    const postContent = post.content.toLowerCase();
    

    const serviceKeywords = ['peluquería', 'baño', 'hotel', 'grooming', 'cuidado'];
    const productKeywords = ['champú', 'cepillo', 'alimento', 'juguete', 'accesorio'];
    
    let serviceScore = 0;
    let productScore = 0;
    

    serviceKeywords.forEach(keyword => {
      if (postContent.includes(keyword)) serviceScore++;
    });
    
    productKeywords.forEach(keyword => {
      if (postContent.includes(keyword)) productScore++;
    });
    
 
    let recommendedItems = [];
    
    if (serviceScore >= productScore && services.length > 0) {
      // Recomendar servicios
      recommendedItems = services.slice(0, 3); // Mostrar hasta 3 servicios
    } else if (products.length > 0) {
      // Recomendar productos
      recommendedItems = products.slice(0, 3); // Mostrar hasta 3 productos
    }
    
    return recommendedItems;
  };

  const handleBack = () => {
    setSelectedPost(null);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (selectedPost) {
    return (
      <div className="blog-post-detail">
        <button className="back-button" onClick={handleBack}>
          ← Volver a Blog
        </button>
        <article className="post-content">
          <h1>{selectedPost.title}</h1>
          <p className="post-date">{new Date(selectedPost.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          <img src={selectedPost.image} alt={selectedPost.title} className="post-image" />
          <div className="post-body">
            {selectedPost.content.split('\n').filter(paragraph => paragraph.trim() !== '').map((paragraph, index) => (
              <p key={index} dangerouslySetInnerHTML={{ __html: formatText(paragraph.trim()) }}></p>
            ))}
          </div>
          
          <div className="social-share">
            <button 
              className="share-button facebook"
              onClick={() => {
                const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank', 'width=600,height=400');
              }}
            >
              <FaFacebook /> Compartir
            </button>
            <button 
              className="share-button twitter"
              onClick={() => {
                const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(selectedPost.title)}`;
                window.open(url, '_blank', 'width=600,height=400');
              }}
            >
              <FaTwitter /> Compartir
            </button>
            <button 
              className="share-button whatsapp"
              onClick={() => {
                const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${selectedPost.title}\n\n${selectedPost.excerpt}\n\n${window.location.href}`)}`;
                window.open(url, '_blank');
              }}
            >
              <FaWhatsapp /> Compartir
            </button>
          </div>

          {/* Product Recommendations Section */}
          <div className="product-recommendations">
            <h3>Productos Recomendados</h3>
            <div className="recommended-products">
              {selectedPost.dynamicRecommendations && selectedPost.dynamicRecommendations.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-price">₡{product.price.toLocaleString()}</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <h1 className="blog-title">Nuestro Blog</h1>
      <p className="blog-description">
        Explora artículos sobre cuidado de mascotas, servicios veterinarios y consejos para el bienestar de tu compañero peludo.
      </p>
      
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <motion.div
            key={post.id}
            className="blog-card"
            onClick={() => handlePostClick(post)}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="blog-card-image">
              <img src={post.image} alt={post.title} />
            </div>
            <div className="blog-card-content">
              <h2>{post.title}</h2>
              <p className="blog-date">{new Date(post.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p className="blog-excerpt">{post.excerpt}</p>
              <button className="read-more">Leer más</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Blog;