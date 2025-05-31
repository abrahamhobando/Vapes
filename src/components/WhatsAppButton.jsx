import { FaWhatsapp } from 'react-icons/fa';
import '../styles/WhatsAppButton.css';

const WhatsAppButton = () => {
  // Número de WhatsApp 
  const whatsappNumber = '50686322460'; 
  const whatsappMessage = 'Hola, me gustaría obtener más información sobre sus servicios veterinarios.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a 
      href={whatsappUrl} 
      className="whatsapp-button" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Contáctanos por WhatsApp"
    >
      <FaWhatsapp className="whatsapp-icon" />
      <span className="whatsapp-text">Contáctanos</span>
    </a>
  );
};

export default WhatsAppButton;