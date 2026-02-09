import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from '../shared/UserProfileModal';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="negocio-header-nav">
      <div className="container">
        <div className="negocio-nav-content">
          {/* Logo */}
          <div className="negocio-logo">
          </div>

          {/* Navegación desktop */}
          <ul className="negocio-nav-menu">
            <li>
              <Link 
                to="/negocio/horarios" 
                className={`negocio-nav-link ${isActive('/negocio/horarios') ? 'active' : ''}`}
              >
                Horarios
              </Link>
            </li>
            <li>
              <Link 
                to="/negocio/turnos" 
                className={`negocio-nav-link ${isActive('/negocio/turnos') ? 'active' : ''}`}
              >
                Turnos reservados
              </Link>
            </li>
            <li>
              <Link 
                to="/negocio/servicios" 
                className={`negocio-nav-link ${isActive('/negocio/servicios') ? 'active' : ''}`}
              >
                Servicios
              </Link>
            </li>
            <li>
              <Link 
                to="/negocio/personal" 
                className={`negocio-nav-link ${isActive('/negocio/personal') ? 'active' : ''}`}
              >
                Personal
              </Link>
            </li>
            <li>
              <Link 
                to="/negocio/ingresos" 
                className={`negocio-nav-link ${isActive('/negocio/ingresos') ? 'active' : ''}`}
              >
                Resumen
              </Link>
            </li>
            <li>
              <Link 
                to="/negocio/resenas" 
                className={`negocio-nav-link ${isActive('/negocio/resenas') ? 'active' : ''}`}
              >
                Reseñas
              </Link>
            </li>
          </ul>

          {/* Botón de perfil */}
          <div className="user-logo" onClick={() => setIsProfileModalOpen(true)}>
            <svg className="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#000000"/>
              <path d="M12 14C7.58172 14 4 15.7909 4 18V20H20V18C20 15.7909 16.4183 14 12 14Z" fill="#000000"/>
            </svg>
          </div>
        </div>
      </div>
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </nav>
  );
};

export default NavBar;
