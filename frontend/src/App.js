import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MaxturnosHeader from './maxturnos/components/Header';
import MaxturnosFooter from './maxturnos/components/Footer';
import NavBar from './components/negocio/NavBar';
import { useScrollToTop } from './hooks/useScrollToTop';
import { useAuth } from './context/AuthContext';
import NegocioNoEncontrado from './components/shared/NegocioNoEncontrado';

// Páginas de Maucci (inicio)
import MaxturnosHome from './maxturnos/pages/Home';
import LocalesAdheridos from './maxturnos/pages/LocalesAdheridos';
import { ContactModalProvider } from './maxturnos/context/ContactModalContext';
import { ServicesModalProvider } from './maxturnos/context/ServicesModalContext';
import ContactModal from './maxturnos/components/ContactModal';
import ServicesModal from './maxturnos/components/ServicesModal';

// Páginas de Barbería (web pública del negocio)
import LocalNegocioRoutes from './barberia/LocalNegocioRoutes';

// Páginas de Negocio
import Horarios from './pages/negocio/Horarios';
import TurnosReservados from './pages/negocio/TurnosReservados';
import Servicios from './pages/negocio/Servicios';
import Personal from './pages/negocio/Personal';
import Resumen from './pages/negocio/Resumen';
import Resenas from './pages/negocio/Resenas';
import Clientes from './pages/negocio/Clientes';
import Bienvenida from './pages/negocio/Bienvenida';
import SuperAdminPage from './pages/superadmin/SuperAdminPage';

import './styles/global.css';

// Componente para determinar qué header usar
const AppContent = () => {
  const location = useLocation();
  const { negocioNoEncontrado, user } = useAuth();
  const isMaxturnosPage = location.pathname === '/' || location.pathname === '/locales-adheridos';
  const isPublicNegocioPage = location.pathname.startsWith('/local/') || location.pathname.startsWith('/barberia');
  const isSuperAdmin = user && user.isSuperAdmin === true;
  const isAdminWithNegocio = user && user.rol === 'admin' && user.nombreNegocio && !isSuperAdmin;
  
  // Hacer scroll suave al top cuando cambia la ruta
  useScrollToTop();
  
  // Si el negocio no fue encontrado, mostrar solo ese componente
  if (negocioNoEncontrado) {
    return (
      <NegocioNoEncontrado 
        email={negocioNoEncontrado.email} 
        nombreNegocio={negocioNoEncontrado.nombreNegocio} 
      />
    );
  }
  
  // Si es super admin (programador), mostrar panel blanco con Negocios
  if (isSuperAdmin) {
    return (
      <div className="App">
        <Routes>
          <Route path="/superadmin" element={<SuperAdminPage />} />
          <Route path="*" element={<Navigate to="/superadmin" replace />} />
        </Routes>
      </div>
    );
  }

  // Si es un admin con negocio válido, mostrar las páginas de negocio
  if (isAdminWithNegocio) {
    return (
      <div className="App">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/negocio" element={<Navigate to="/negocio/inicio" replace />} />
            <Route path="/negocio/inicio" element={<Bienvenida />} />
            <Route path="/negocio/horarios" element={<Horarios />} />
            <Route path="/negocio/turnos" element={<TurnosReservados />} />
            <Route path="/negocio/clientes" element={<Clientes />} />
            <Route path="/negocio/servicios" element={<Servicios />} />
            <Route path="/negocio/personal" element={<Personal />} />
            <Route path="/negocio/ingresos" element={<Resumen />} />
            <Route path="/negocio/resenas" element={<Resenas />} />
            <Route path="/negocio/*" element={<Navigate to="/negocio/inicio" replace />} />
          </Routes>
        </main>
      </div>
    );
  }
  
  // Web pública de un negocio (/local/:codigo o /barberia legado)
  if (isPublicNegocioPage) {
    return (
      <div className="App">
        <ContactModalProvider>
          <Routes>
            <Route path="/local/:codigo/*" element={<LocalNegocioRoutes />} />
            <Route path="/barberia/*" element={<LocalNegocioRoutes />} />
          </Routes>
          <ContactModal />
        </ContactModalProvider>
      </div>
    );
  }

  return (
    <div className="App">
      {isMaxturnosPage ? (
        <ContactModalProvider>
          <ServicesModalProvider>
            <MaxturnosHeader />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<MaxturnosHome />} />
                <Route path="/locales-adheridos" element={<LocalesAdheridos />} />
              </Routes>
            </main>
            <MaxturnosFooter />
            <ContactModal />
            <ServicesModal />
          </ServicesModalProvider>
        </ContactModalProvider>
      ) : (
        <ContactModalProvider>
          <MaxturnosHeader />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MaxturnosHome />} />
              <Route path="/locales-adheridos" element={<LocalesAdheridos />} />
            </Routes>
          </main>
          <MaxturnosFooter />
          <ContactModal />
        </ContactModalProvider>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
