import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaBreadSlice, FaCookie, FaGlassWhiskey, FaPercentage, FaSearch, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ProductCardSkeleton } from '../components/Skeleton';
import SEO from '../components/SEO';
import '../styles/Menu.css';
// Import the Airtable service
import { fetchProducts, getCategories } from '../services/airtableService';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { addToCart } = useCart();
  const menuSectionRef = useRef(null);
  const categoryFiltersRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch products from Airtable
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchProducts();
        // Filtrar solo los elementos marcados como 'Servicios' en el campo Esp
        const serviciosData = productsData.filter(product => product.esp === 'Servicios');
        setProducts(serviciosData);
        
        // Generate categories from filtered products
        const categoriesData = getCategories(serviciosData);
        setCategories(categoriesData);
        
        // Set initial filtered products
        setFilteredProducts(serviciosData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
   
    if (menuSectionRef.current) {

      setTimeout(() => {
        menuSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(item => item.category === activeCategory));
    }
  }, [activeCategory, products]);

  // Efecto para manejar la búsqueda en tiempo real con tolerancia a errores ortográficos
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      setFilteredProducts(activeCategory === 'all' ? products : products.filter(item => item.category === activeCategory));
      return;
    }

    const delaySearch = setTimeout(() => {
      // Función para normalizar texto (quitar acentos y convertir a minúsculas)
      const normalizeText = (text) => {
        return text.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      };
      
      const searchTermNormalized = normalizeText(searchTerm);
      

      const results = products.filter(product => {
        const nameNormalized = normalizeText(product.name);
        const descriptionNormalized = normalizeText(product.description);
        
        return nameNormalized.includes(searchTermNormalized) ||
               descriptionNormalized.includes(searchTermNormalized);
      });
      

      setSearchResults(results);
      setShowSearchResults(true);
      
 
      if (activeCategory === 'all') {
        setFilteredProducts(results);
      } else {
        setFilteredProducts(results.filter(item => item.category === activeCategory));
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, products, activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
 
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchResultClick = (product) => {

    setSearchTerm('');
    setShowSearchResults(false);
    
    // Desplazarse al producto seleccionado
    setTimeout(() => {

      const productElements = document.querySelectorAll('.product-card');
      let productElement = null;
      
      productElements.forEach(element => {

        if (element.textContent.includes(product.name)) {
          productElement = element;
        }
      });
      
      if (productElement) {
  
        productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        

        productElement.classList.add('highlight-product');
        setTimeout(() => {
          productElement.classList.remove('highlight-product');
        }, 2000);
      }
    }, 100);
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };


  const renderCategoryIcon = (iconName) => {
    if (!iconName) return null;
    
    switch(iconName) {
      case 'FaBreadSlice':
        return <FaBreadSlice />;
      case 'FaPercentage':
        return <FaPercentage />;
      case 'FaGlassWhiskey':
        return <FaGlassWhiskey />;
      case 'FaCookie':
        return <FaCookie />;
      default:
        return null;
    }
  };

  return (
    <div className="menu-page">
      <SEO 
        title="Servicios" 
        description="Explora todos nuestros servicios veterinarios profesionales. Ofrecemos atención médica, baños, peluquería y hotel canino para el cuidado integral de tu mascota."
      />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container" style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="hero-content">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Nuestros Servicios
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Descubre todos nuestros servicios veterinarios para el cuidado de tu mascota
            </motion.p>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Menu Section */}
      <section className="section menu-section" ref={menuSectionRef}>
        <div className="container">
          {/* Category Filters */}
          <div className="category-filters" ref={categoryFiltersRef}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.icon && <span className="category-icon">{renderCategoryIcon(category.icon)}</span>}
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                ref={searchInputRef}
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="search-result-image">
                      <img src={result.image} alt={result.name} />
                    </div>
                    <div className="search-result-info">
                      <h4>{result.name}</h4>
                      <p className="search-result-price">₡{result.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <motion.div 
              className="products-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Display skeleton cards while loading */}
              {[...Array(8)].map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="products-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id} 
                    className="product-card"
                    variants={itemVariants}
                  >
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
                        <button 
                          className="add-to-cart-btn"
                          onClick={(e) => addToCart(product, e.currentTarget)}
                          disabled={product.invent <= 0}
                        >
                          {product.invent > 0 ? 'Agregar' : 'Agotado'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-products-message">
                  <p>No hay productos disponibles en esta categoría.</p>
                </div>
              )}
            </motion.div>
          )}
          
          {/* CTA Card */}
          <div className="cta-card-container">
            <div className="cta-card">
              <h3>¿No encuentras el servicio que buscas?</h3>
              <p>Contáctanos para el cuidado personalizado de tu mascota</p>
              <Link to="/contact" className="cta-card-button">
                Escríbenos <FaArrowRight className="arrow-icon" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;