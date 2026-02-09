import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { businessInfo } from '../data/sampleData';
import { scrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../context/AuthContext';
import { negociosService } from '../../services/api';
import AuthModal from '../../components/shared/AuthModal';
import UserProfileModal from '../../components/shared/UserProfileModal';
import './Header.css';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  // Cargar días disponibles del negocio
  useEffect(() => {
    const cargarDiasDisponibles = async () => {
      try {
        const negocioCodigo = 'barberia_clasica';
        const negocioResponse = await negociosService.obtenerNegocio(negocioCodigo);
        const negocio = negocioResponse.data || negocioResponse;
        
        if (negocio && negocio.diasDisponibles) {
          setDiasDisponibles(negocio.diasDisponibles);
        }
      } catch (err) {
        console.error('Error al cargar días disponibles del negocio:', err);
      }
    };
    
    cargarDiasDisponibles();
  }, []);

  // Función para formatear los días disponibles
  const formatearDiasDisponibles = () => {
    if (!diasDisponibles || diasDisponibles.length === 0) {
      return 'Lunes a sábados';
    }
    
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diasNombres = diasDisponibles.map(dia => nombresDias[dia]).sort();
    
    // Si son días consecutivos, formatear como rango
    if (diasNombres.length === 6 && diasNombres.includes('Lunes') && diasNombres.includes('Sábado')) {
      return 'Lunes a sábados';
    }
    
    // Si son todos los días excepto domingo
    if (diasNombres.length === 6 && !diasNombres.includes('Domingo')) {
      return 'Lunes a sábados';
    }
    
    // Si son lunes a viernes
    if (diasNombres.length === 5 && !diasNombres.includes('Sábado') && !diasNombres.includes('Domingo')) {
      return 'Lunes a viernes';
    }
    
    // En otros casos, mostrar los días separados por comas
    return diasNombres.join(', ');
  };

  // Función para formatear los horarios (estático)
  const formatearHorarios = () => {
    return 'Lun-Vie: 09:00 - 20:00 | Sáb: 09:00 - 18:00';
  };

  return (
    <header className="header">
      {/* Barra superior con información de contacto */}
      <div className="header-top">
        <div className="container">
          <div className="header-info">
            {/* Días disponibles - Izquierda */}
            <div className="info-item">
              <div className="info-icon-container">
                <img 
                  src="/assets/img/logos_genericos/calendario.png" 
                  alt="Calendario" 
                  className="info-icon-img calendario-logo"
                />
              </div>
              <span>{formatearDiasDisponibles()}</span>
            </div>
            
            {/* Horarios - Centro */}
            <div className="info-item info-item-center">
              <div className="info-icon-container">
                <img 
                  src="/assets/img/logos_genericos/reloj.png" 
                  alt="Reloj" 
                  className="info-icon-img"
                />
              </div>
              <span>{formatearHorarios()}</span>
            </div>
            
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
              <li>
                <Link 
                  to="/barberia/reservar" 
                  className="btn btn-primary btn-reserve-mobile"
                  onClick={handleNavClick}
                >
                  Reservar turno
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </header>
  );
};

export default Header;

