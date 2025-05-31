import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import '../styles/Feedback.css';
import { fetchProducts, submitFeedback } from '../services/airtableService';

const Feedback = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  
  const [formData, setFormData] = useState({
    servicio: [],
    calificacion: 0,
    volver: '',
    like: [],
    comentario: '',
    contacto: ''
  });

  
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchProducts();
        // Filtrar solo los servicios disponibles
        const serviciosData = productsData.filter(item => 
          item.esp === 'Servicios' && item.name && item.name.trim() !== ''
        );
        setServices(serviciosData);
      } catch (error) {
        console.error('Error cargando servicios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadServices();
  }, []);
  
  useEffect(() => {
    localStorage.setItem('feedbackFormData', JSON.stringify(formData));
    localStorage.setItem('feedbackStep', step.toString());
  }, [formData, step]);

  
  useEffect(() => {
    const savedFormData = localStorage.getItem('feedbackFormData');
    const savedStep = localStorage.getItem('feedbackStep');
    
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
    
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
  }, []);


  const likeOptions = [
    'Atención del personal',
    'Trato hacia mi mascota',
    'Instalaciones',
    'Tiempo de espera',
    'Precio',
    'Otro'
  ];


  const handleServiceToggle = (serviceId, serviceName) => {
    setFormData(prev => {
      const isSelected = prev.servicio.includes(serviceName);
      
      if (isSelected) {
        return {
          ...prev,
          servicio: prev.servicio.filter(s => s !== serviceName)
        };
      } else {
        return {
          ...prev,
          servicio: [...prev.servicio, serviceName]
        };
      }
    });
  };

 
  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      calificacion: rating
    }));
  };

 
  const handleReturnChange = (option) => {
    setFormData(prev => ({
      ...prev,
      volver: option
    }));
  };


  const handleLikeToggle = (option) => {
    setFormData(prev => {
      const isSelected = prev.like.includes(option);
      
      if (isSelected) {
        return {
          ...prev,
          like: prev.like.filter(item => item !== option)
        };
      } else {
        return {
          ...prev,
          like: [...prev.like, option]
        };
      }
    });
  };

  //
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.servicio.length > 0;
      case 2:
        return formData.calificacion > 0 && formData.volver !== '';
      case 3:
        return formData.like.length > 0;
      case 4:
        return true; // Comentario es opcional
      case 5:
        return true; // Contacto es opcional
      default:
        return false;
    }
  };


  const nextStep = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };


  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };


  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitFeedback(formData);
      
      if (result.success) {

        setShowSuccess(true);
        
        
        setFormData({
          servicio: [],
          calificacion: 0,
          volver: '',
          like: [],
          comentario: '',
          contacto: ''
        });
        localStorage.removeItem('feedbackFormData');
        localStorage.removeItem('feedbackStep');
        
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        alert('Error al enviar el feedback: ' + result.message);
      }
    } catch (error) {
      console.error('Error al enviar el feedback:', error);
      alert('Error al enviar el feedback. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            className="feedback-step"
            key="step1"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
          >
            <h2>¿Qué servicios utilizaste?</h2>
            <p className="step-description">Selecciona uno o varios servicios que hayas utilizado</p>
            
            {isLoading ? (
              <div className="loading-spinner">Cargando servicios...</div>
            ) : (
              <div className="services-grid">
                {services.map((service) => (
                  <div 
                    key={service.id}
                    className={`service-card ${formData.servicio.includes(service.name) ? 'selected' : ''}`}
                    onClick={() => handleServiceToggle(service.id, service.name)}
                  >
                    <div className="service-image">
                      <img src={service.image} alt={service.name} />
                    </div>
                    <div className="service-info">
                      <h3>{service.name}</h3>
                      {formData.servicio.includes(service.name) && (
                        <div className="selected-indicator">
                          <FaCheck />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div 
            className="feedback-step"
            key="step2"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
          >
            <h2>¿Cómo calificarías tu experiencia?</h2>
            
            <div className="rating-container">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star}
                    className={`star ${formData.calificacion >= star ? 'active' : ''}`}
                    onClick={() => handleRatingChange(star)}
                  />
                ))}
              </div>
              <p className="rating-text">
                {formData.calificacion === 1 && 'Muy insatisfecho'}
                {formData.calificacion === 2 && 'Insatisfecho'}
                {formData.calificacion === 3 && 'Neutral'}
                {formData.calificacion === 4 && 'Satisfecho'}
                {formData.calificacion === 5 && 'Muy satisfecho'}
              </p>
            </div>
            
            <div className="return-options">
              <h3>¿Volverías a utilizar nuestros servicios?</h3>
              <div className="options-container">
                <button 
                  className={`option-btn ${formData.volver === 'Sí' ? 'selected' : ''}`}
                  onClick={() => handleReturnChange('Sí')}
                >
                  Sí, definitivamente
                </button>
                <button 
                  className={`option-btn ${formData.volver === 'Tal vez' ? 'selected' : ''}`}
                  onClick={() => handleReturnChange('Tal vez')}
                >
                  Tal vez
                </button>
                <button 
                  className={`option-btn ${formData.volver === 'No' ? 'selected' : ''}`}
                  onClick={() => handleReturnChange('No')}
                >
                  No volvería
                </button>
              </div>
            </div>
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div 
            className="feedback-step"
            key="step3"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
          >
            <h2>¿Qué fue lo que más te gustó?</h2>
            <p className="step-description">Selecciona una o varias opciones</p>
            
            <div className="like-options">
              {likeOptions.map((option) => (
                <div 
                  key={option}
                  className={`like-option ${formData.like.includes(option) ? 'selected' : ''}`}
                  onClick={() => handleLikeToggle(option)}
                >
                  {option}
                  {formData.like.includes(option) && (
                    <span className="check-icon"><FaCheck /></span>
                  )}
                </div>
              ))}
            </div>
            
            {formData.like.includes('Otro') && (
              <div className="other-input">
                <input 
                  type="text" 
                  placeholder="¿Qué otra cosa te gustó?" 
                  name="otherLike"
                  value={formData.otherLike || ''}
                  onChange={handleTextChange}
                />
              </div>
            )}
          </motion.div>
        );
      
      case 4:
        return (
          <motion.div 
            className="feedback-step"
            key="step4"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
          >
            <h2>¿Qué te gustaría mejorar o contarnos?</h2>
            <p className="step-description">Este campo es opcional</p>
            
            <div className="comment-container">
              <textarea 
                name="comentario"
                value={formData.comentario}
                onChange={handleTextChange}
                placeholder="Escribe tu comentario aquí..."
                rows="5"
              ></textarea>
            </div>
          </motion.div>
        );
      
      case 5:
        return (
          <motion.div 
            className="feedback-step"
            key="step5"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
          >
            <h2>¿Quieres que te contactemos?</h2>
            <p className="step-description">Déjanos un dato de contacto (opcional)</p>
            
            <div className="contact-container">
              <input 
                type="text" 
                name="contacto"
                value={formData.contacto}
                onChange={handleTextChange}
                placeholder="Correo, teléfono o red social"
              />
            </div>
            
            <div className="submit-container">
              <button 
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
              </button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  // Si se muestra la pantalla de éxito
  if (showSuccess) {
    return (
      <div className="feedback-success">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h2>¡Gracias por tu opinión! 🐶</h2>
          <p>Nos ayuda a mejorar cada día.</p>
          <p className="redirecting">Redirigiendo a la página principal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>
        
        <div className="step-indicator">
          <span>Paso {step} de 5</span>
        </div>
        
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        
        <div className="navigation-buttons">
          {step > 1 && (
            <button className="nav-btn prev" onClick={prevStep}>
              <FaArrowLeft /> Anterior
            </button>
          )}
          
          <button 
            className="nav-btn next" 
            onClick={nextStep}
            disabled={!canProceed()}
          >
            {step === 5 ? 'Enviar' : 'Siguiente'} <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;