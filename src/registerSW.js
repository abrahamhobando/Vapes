// Registro del Service Worker para PWA

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado con éxito:', registration);
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
    }
  }
};