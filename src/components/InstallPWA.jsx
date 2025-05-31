import { useState, useEffect } from 'react';
import '../styles/InstallPWA.css';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar si la app ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('Resultado de la instalación:', result);
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('Error al instalar la PWA:', error);
    }
  };

  if (!showInstallButton) return null;

  return (
    <div className="install-banner">
      <div className="install-content">
        <p>¡Instala nuestra app para una mejor experiencia!</p>
        <button onClick={handleInstallClick} className="install-button">
          Instalar App
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;