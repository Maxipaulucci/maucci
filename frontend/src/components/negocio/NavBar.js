import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from '../shared/UserProfileModal';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { to: '/negocio/horarios', label: 'Horarios' },
    { to: '/negocio/servicios', label: 'Servicios' },
    { to: '/negocio/personal', label: 'Personal' },
    { to: '/negocio/resenas', label: 'Reseñas' },
    { to: '/negocio/clientes', label: 'Clientes' },
    { to: '/negocio/turnos', label: 'Turnos reservados' },
    { to: '/negocio/ingresos', label: 'Resumen' },
  ];

  return (
    <nav className={`negocio-header-nav ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container">
        <div className="negocio-nav-content">
          {/* Botón hamburguesa (solo visible en móvil) */}
          <button
            type="button"
            className="negocio-nav-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Logo */}
          <div className="negocio-logo">
          </div>

          {/* Navegación desktop */}
          <ul className="negocio-nav-menu">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`negocio-nav-link ${isActive(to) ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
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
