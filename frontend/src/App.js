import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './barberia/components/Header';
import MaxturnosHeader from './maxturnos/components/Header';
import Footer from './barberia/components/Footer';
import MaxturnosFooter from './maxturnos/components/Footer';
import NavBar from './components/negocio/NavBar';
import { useScrollToTop } from './hooks/useScrollToTop';
import { useAuth } from './context/AuthContext';
import NegocioNoEncontrado from './components/shared/NegocioNoEncontrado';

// Páginas de Maucci (inicio)
import MaxturnosHome from './maxturnos/pages/Home';
import LocalesAdheridos from './maxturnos/pages/LocalesAdheridos';
import { ContactModalProvider } from './maxturnos/context/ContactModalContext';
import ContactModal from './maxturnos/components/ContactModal';

// Páginas de Barbería
import BarberiaHome from './barberia/pages/Home';
import BarberiaServices from './barberia/pages/Services';
import BarberiaTeam from './barberia/pages/Team';
import BarberiaReviews from './barberia/pages/Reviews';
import BarberiaBooking from './barberia/pages/Booking';
import BarberiaAbout from './barberia/pages/About';

// Páginas de Negocio
import Horarios from './pages/negocio/Horarios';
import TurnosReservados from './pages/negocio/TurnosReservados';
import Servicios from './pages/negocio/Servicios';
import Personal from './pages/negocio/Personal';
import Resumen from './pages/negocio/Resumen';
import Resenas from './pages/negocio/Resenas';
import Bienvenida from './pages/negocio/Bienvenida';

import './styles/global.css';

// Componente para determinar qué header usar
const AppContent = () => {
  const location = useLocation();
  const { negocioNoEncontrado, user } = useAuth();
  const isMaxturnosPage = location.pathname === '/' || location.pathname === '/locales-adheridos';
  const isNegocioPage = location.pathname.startsWith('/negocio');
  const isAdminWithNegocio = user && user.rol === 'admin' && user.nombreNegocio;
  
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
  
  return (
    <div className="App">
      {isMaxturnosPage ? (
        <ContactModalProvider>
          <MaxturnosHeader />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MaxturnosHome />} />
              <Route path="/locales-adheridos" element={<LocalesAdheridos />} />
              <Route path="/barberia" element={<BarberiaHome />} />
              <Route path="/barberia/servicios" element={<BarberiaServices />} />
              <Route path="/barberia/equipo" element={<BarberiaTeam />} />
              <Route path="/barberia/resenas" element={<BarberiaReviews />} />
              <Route path="/barberia/reservar" element={<BarberiaBooking />} />
              <Route path="/barberia/acerca" element={<BarberiaAbout />} />
            </Routes>
          </main>
          <MaxturnosFooter />
          <ContactModal />
        </ContactModalProvider>
      ) : (
        <>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MaxturnosHome />} />
              <Route path="/locales-adheridos" element={<LocalesAdheridos />} />
              <Route path="/barberia" element={<BarberiaHome />} />
              <Route path="/barberia/servicios" element={<BarberiaServices />} />
              <Route path="/barberia/equipo" element={<BarberiaTeam />} />
              <Route path="/barberia/resenas" element={<BarberiaReviews />} />
              <Route path="/barberia/reservar" element={<BarberiaBooking />} />
              <Route path="/barberia/acerca" element={<BarberiaAbout />} />
            </Routes>
          </main>
          <Footer />
        </>
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
