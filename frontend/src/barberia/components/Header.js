import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaEnvelope } from 'react-icons/fa';
import { maxturnosInfo } from '../../maxturnos/data/maxturnosData';
import { businessInfo } from '../data/sampleData';
import { scrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../context/AuthContext';
import { useContactModal } from '../../maxturnos/context/ContactModalContext';
import { negociosService, servicioService, personalService, resenasService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import { useEstablecimiento } from '../../context/EstablecimientoContext';
import { obtenerLineasHorarios } from '../utils/horariosUtils';
import AuthModal from '../../components/shared/AuthModal';
import UserProfileModal from '../../components/shared/UserProfileModal';
import './Header.css';

const Header = () => {
  const { codigo, basePath, to } = useEstablecimiento();
  const { isAuthenticated } = useAuth();
  const { openContactModal } = useContactModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHorariosModalOpen, setIsHorariosModalOpen] = useState(false);
  const [lineasHorarios, setLineasHorarios] = useState(['Cargando horarios...']);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname === `${path}/`;
  };

  const handleNavClick = () => {
    scrollToTop();
    setIsMenuOpen(false);
  };

  const aplicarHorariosDesdeNegocio = (negocio) => {
    if (negocio) {
      setLineasHorarios(obtenerLineasHorarios(negocio));
    }
  };

  const cargarHorariosNegocio = async () => {
    const cached = barberiaCache.getNegocio(codigo);
    if (cached) {
      aplicarHorariosDesdeNegocio(cached);
    }

    try {
      const response = await negociosService.obtenerNegocio(codigo);
      const negocio = response.data ?? response;
      if (negocio?.codigo) {
        barberiaCache.setNegocio(codigo, negocio);
        aplicarHorariosDesdeNegocio(negocio);
      }
    } catch (err) {
      if (!cached) {
        setLineasHorarios(['No se pudieron cargar los horarios']);
      }
    }
  };

  // Prefetch datos del negocio y horarios reales desde el panel
  useEffect(() => {
    const isNegocioPublico = location.pathname.startsWith('/local/') || location.pathname.startsWith('/barberia');
    if (!isNegocioPublico) return;

    cargarHorariosNegocio();

    servicioService.obtenerServicios(codigo).then((r) => {
      const data = r.data ?? r;
      if (data && Array.isArray(data)) barberiaCache.setServicios(codigo, data);
    }).catch(() => {});
    personalService.obtenerPersonal(codigo).then((r) => {
      const data = r.data ?? r;
      if (data && Array.isArray(data)) barberiaCache.setPersonal(codigo, data);
    }).catch(() => {});
    resenasService.obtenerResenasPublicas(codigo).then((r) => {
      const data = r.data ?? r;
      if (data && Array.isArray(data)) barberiaCache.setResenas(codigo, data);
    }).catch(() => {});
  }, [location.pathname, codigo]);

  const abrirModalHorarios = () => {
    setIsHorariosModalOpen(true);
    cargarHorariosNegocio();
  };

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
            
            {/* Horarios: botón con reloj que abre modal con datos del panel */}
            <button
              type="button"
              className="header-contact-item header-horarios-btn info-item-center"
              onClick={abrirModalHorarios}
              aria-label="Ver horarios"
            >
              <span className="header-horarios-btn-icon-wrap" aria-hidden="true">
                <img
                  src="/assets/img/logos_genericos/reloj.png"
                  alt=""
                  className="header-horarios-btn-icon"
                />
              </span>
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
            <Link to={basePath} className="logo" onClick={handleNavClick}>
              <h1>{businessInfo.name}</h1>
            </Link>

            {/* Navegación desktop */}
            <ul className="nav-menu">
              <li>
                <Link 
                  to={basePath}
                  className={`nav-link ${isActive(basePath) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to={to('servicios')}
                  className={`nav-link ${isActive(to('servicios')) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link 
                  to={to('equipo')}
                  className={`nav-link ${isActive(to('equipo')) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Equipo
                </Link>
              </li>
              <li>
                <Link 
                  to={to('resenas')}
                  className={`nav-link ${isActive(to('resenas')) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Reseñas
                </Link>
              </li>
              <li>
                <Link 
                  to={to('acerca')}
                  className={`nav-link ${isActive(to('acerca')) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Acerca de
                </Link>
              </li>
            </ul>

            {/* Botón de reserva */}
            <Link to={to('reservar')} className="btn btn-primary btn-reserve" onClick={handleNavClick}>
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
                  to={basePath}
                  className={`mobile-nav-link ${isActive(basePath) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to={to('servicios')}
                  className={`mobile-nav-link ${isActive(to('servicios')) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link 
                  to={to('equipo')}
                  className={`mobile-nav-link ${isActive(to('equipo')) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Equipo
                </Link>
              </li>
              <li>
                <Link 
                  to={to('resenas')}
                  className={`mobile-nav-link ${isActive(to('resenas')) ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  Reseñas
                </Link>
              </li>
              <li>
                <Link 
                  to={to('acerca')}
                  className={`mobile-nav-link ${isActive(to('acerca')) ? 'active' : ''}`}
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

      {isHorariosModalOpen && (
        <div className="header-horarios-modal-overlay" onClick={() => setIsHorariosModalOpen(false)} aria-hidden="false">
          <div className="header-horarios-modal" onClick={e => e.stopPropagation()}>
            <div className="header-horarios-modal-header">
              <h3 className="header-horarios-modal-title">Horarios</h3>
              <button type="button" className="header-horarios-modal-close" onClick={() => setIsHorariosModalOpen(false)} aria-label="Cerrar">×</button>
            </div>
            <div className="header-horarios-modal-body">
              {lineasHorarios.map((linea, index) => (
                <p key={index} className="header-horarios-modal-line">{linea}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
