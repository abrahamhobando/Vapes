import React, { useEffect, useState } from 'react';
import '../styles/Loader.css';

const Loader = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    
    const totalTime = 2000; // 2 segundos de tiempo de carga
    const interval = 50; // Actualizar cada 50ms
    const steps = totalTime / interval;
    
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
    
      const newProgress = Math.min(100, Math.floor((currentStep / steps) * 100));
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(progressInterval);
       
        setTimeout(() => setLoading(false), 200);
      }
    }, interval);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className={`loader-container ${!loading ? 'loader-hidden' : ''}`}>
      <div className="loader-content">
        <h2 className="loader-title">Dariel Pet Care</h2>
        <div className="loader-progress-container">
          <div 
            className="loader-progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="loader-paw-prints">
          {[...Array(5)].map((_, index) => (
            <div 
              key={index} 
              className="paw-print" 
              style={{
                animationDelay: `${index * 0.2}s`,
                opacity: progress > (index * 20) ? 1 : 0.3
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;