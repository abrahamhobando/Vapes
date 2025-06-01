import React, { useState, useEffect } from 'react';
import '../styles/AgeVerification.css';

const AgeVerification = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya confirmó ser mayor de edad
    const isAdultVerified = localStorage.getItem('isAdultVerified');
    
    // Si no hay confirmación, mostrar el modal
    if (!isAdultVerified) {
      setIsModalOpen(true);
    }
  }, []);

  const handleYesClick = () => {
    // Guardar en localStorage que el usuario es mayor de edad
    localStorage.setItem('isAdultVerified', 'true');
    setIsModalOpen(false);
  };

  const handleNoClick = () => {
    // No guardar nada en localStorage para que vuelva a preguntar en la próxima carga
    setIsModalOpen(false);
    // Informar al usuario que el contenido es solo para mayores
    alert('Lo sentimos, este sitio es solo para mayores de edad.');
  };

  if (!isModalOpen) return null;

  return (
    <div className="age-verification-overlay">
      <div className="age-verification-modal">
        <div className="age-verification-content">
          <h2>Verificación de Edad</h2>
          <div className="neon-divider"></div>
          <p>Este sitio contiene productos de vapeo destinados exclusivamente para mayores de edad.</p>
          <p className="age-question">¿Tienes 18 años o más?</p>
          
          <div className="age-verification-buttons">
            <button 
              className="btn-yes" 
              onClick={handleYesClick}
            >
              Sí, soy mayor de edad
            </button>
            <button 
              className="btn-no" 
              onClick={handleNoClick}
            >
              No, soy menor de edad
            </button>
          </div>
          
          <p className="age-disclaimer">
            Al acceder a este sitio, confirmas que cumples con la edad legal 
            para comprar productos de vapeo en tu país o región.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
