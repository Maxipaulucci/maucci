import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaEnvelope, FaClock } from 'react-icons/fa';
import { maxturnosInfo } from '../../maxturnos/data/maxturnosData';
import { businessInfo } from '../data/sampleData';
import { scrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../context/AuthContext';
import { useContactModal } from '../../maxturnos/context/ContactModalContext';
import { negociosService, servicioService, personalService, resenasService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import AuthModal from '../../components/shared/AuthModal';
import UserProfileModal from '../../components/shared/UserProfileModal';
import './Header.css';

const BARBERIA_ESTABLECIMIENTO = 'barberia_clasica';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { openContactModal } = useContactModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHorariosModalOpen, setIsHorariosModalOpen] = useState(false);
  const [diasDisponibles, setDiasDisponibles] = useState([]);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavClick = () => {
    scrollToTop();
    setIsMenuOpen(false);
  };

  // Prefetch servicios y personal al estar en barbería (para que Servicios/Equipo carguen al instante)
  useEffect(() => {
    if (!location.pathname.startsWith('/barberia')) return;
    servicioService.obtenerServicios(BARBERIA_ESTABLECIMIENTO).then((r) => {
      const data = r.data ?? r;
      if (data && Array.isArray(data)) barberiaCache.setServicios(BARBERIA_ESTABLECIMIENTO, data);
    }).catch(() => {});
    personalService.obtenerPersonal(BARBERIA_ESTABLECIMIENTO).then((r) => {
      const data = r.data ?? r;
      if (data && Array.isArray(data)) barberiaCache.setPersonal(BARBERIA_ESTABLECIMIENTO, data);
    }).catch(() => {});
    resenasService.obtenerResenasPublicas(BARBERIA_ESTABLECIMIENTO).then((r) => {
      const data = r.data ?? r;
      if (data && Array.isArray(data)) barberiaCache.setResenas(BARBERIA_ESTABLECIMIENTO, data);
    }).catch(() => {});
    negociosService.obtenerNegocio(BARBERIA_ESTABLECIMIENTO).then((r) => {
      const data = r.data ?? r;
      if (data && data.codigo) barberiaCache.setNegocio(BARBERIA_ESTABLECIMIENTO, data);
    }).catch(() => {});
  }, [location.pathname]);

  // Función para formatear los horarios (estático); devuelve [línea1, línea2] para poder mostrar Sáb en segunda línea en responsive
  const formatearHorarios = () => {
    return ['Lun-Vie: 09:00 - 20:00', 'Sáb: 09:00 - 18:00'];
  };
  const horarios = formatearHorarios();

  return (
    <header className="header">
      {/* Barra superior con información de contacto */}
      <div className="header-top">
        <div className="container">
          <div className="header-info">
            {/* Email de contacto: abre modal de consulta. En responsive solo ícono + "Maucci" */}
            <button type="button" className="header-contact-item" onClick={openContactModal} aria-label="Enviar consulta">
              <FaEnvelope className="header-contact-icon" aria-hidden="true" />
              <span className="header-contact-email-full">{maxturnosInfo.email}</span>
              <span className="header-contact-maucci-label">Maucci</span>
            </button>
            
            {/* Horarios - Desktop: texto visible en el centro */}
            <div className="info-item info-item-center header-horarios-desktop">
              <div className="info-icon-container">
                <img 
                  src="/assets/img/logos_genericos/reloj.png" 
                  alt="Reloj" 
                  className="info-icon-img"
                />
              </div>
              <span className="horario-text-wrapper">
                <span className="horario-linea1">{horarios[0]}</span>
                <span className="horario-linea2">{horarios[1]}</span>
              </span>
            </div>
            {/* Horarios - Responsive: botón que abre modal (mismo estilo que botón mail) */}
            <button
              type="button"
              className="header-contact-item header-horarios-mobile"
              onClick={() => setIsHorariosModalOpen(true)}
              aria-label="Ver horarios"
            >
              <FaClock className="header-contact-icon" aria-hidden="true" />
              <span>Horarios</span>
            </button>
            
            {/* Perfil - Derecha */}
            <div 
              className="user-logo" 
              style={{ backgroundColor: '#ffffff' }}
              onClick={() => {
                if (isAuthenticated()) {
                  setIsProfileModalOpen(true);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
            >
              <img 
                src="/assets/img/logos_genericos/perfil.png" 
                alt="Perfil" 
                className="user-icon"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="header-nav">
        <div className="container">
          <div className="nav-content">
            {/* Logo */}
            <Link to="/barberia" className="logo" onClick={handleNavClick}>
              <h1>{businessInfo.name}</h1>
            </Link>

            {/* Navegación desktop */}
            <ul className="nav-menu">
              <li>
                <Link 
                  to="/barberia" 
                  className={`nav-link ${isActive('/barberia') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/servicios" 
                  className={`nav-link ${isActive('/barberia/servicios') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/equipo" 
                  className={`nav-link ${isActive('/barberia/equipo') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Equipo
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/resenas" 
                  className={`nav-link ${isActive('/barberia/resenas') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Reseñas
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/acerca" 
                  className={`nav-link ${isActive('/barberia/acerca') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Acerca de
                </Link>
              </li>
            </ul>

            {/* Botón de reserva */}
            <Link to="/barberia/reservar" className="btn btn-primary btn-reserve" onClick={handleNavClick}>
              Reservar turno
            </Link>

            {/* Botón hamburguesa para móvil */}
            <button 
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="container">
            <ul className="mobile-nav-menu">
              <li>
                <Link 
                  to="/barberia" 
                  className={`mobile-nav-link ${isActive('/barberia') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/servicios" 
                  className={`mobile-nav-link ${isActive('/barberia/servicios') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/equipo" 
                  className={`mobile-nav-link ${isActive('/barberia/equipo') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Equipo
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/resenas" 
                  className={`mobile-nav-link ${isActive('/barberia/resenas') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Reseñas
                </Link>
              </li>
              <li>
                <Link 
                  to="/barberia/acerca" 
                  className={`mobile-nav-link ${isActive('/barberia/acerca') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* Modal de horarios (solo se usa en responsive al tocar el botón Horarios) */}
      {isHorariosModalOpen && (
        <div className="header-horarios-modal-overlay" onClick={() => setIsHorariosModalOpen(false)} aria-hidden="false">
          <div className="header-horarios-modal" onClick={e => e.stopPropagation()}>
            <div className="header-horarios-modal-header">
              <h3 className="header-horarios-modal-title">Horarios</h3>
              <button type="button" className="header-horarios-modal-close" onClick={() => setIsHorariosModalOpen(false)} aria-label="Cerrar">×</button>
            </div>
            <div className="header-horarios-modal-body">
              <p className="header-horarios-modal-line">{horarios[0]}</p>
              <p className="header-horarios-modal-line">{horarios[1]}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

