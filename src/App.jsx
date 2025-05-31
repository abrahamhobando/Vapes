import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import InstallPWA from './components/InstallPWA';
import Menu from './pages/Menu';
import Products from './pages/Products';
import Home from './pages/Home';
import Contact from './pages/Contact';
// About page removed
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin'; // Importar AdminLogin
import './App.css';
import './styles/CartAnimation.css';

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          <Toaster position="bottom-center" />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/products" element={<Products />} />
              {/* About route removed */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/login" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              {/* Ruta para el futuro dashboard, también protegida */}
              {/* <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard /> // Suponiendo que Dashboard es otro componente
                  </ProtectedRoute>
                } 
              /> */}
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
          <InstallPWA />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
