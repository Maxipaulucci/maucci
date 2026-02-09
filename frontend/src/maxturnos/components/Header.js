import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone, FaEnvelope } from 'react-icons/fa';
import { maxturnosInfo } from '../data/maxturnosData';
import { scrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../context/AuthContext';
import { useContactModal } from '../context/ContactModalContext';
import AuthModal from '../../components/shared/AuthModal';
import UserProfileModal from '../../components/shared/UserProfileModal';
import './Header.css';

const MaxturnosHeader = () => {
  const { isAuthenticated } = useAuth();
  const { openContactModal } = useContactModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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

  return (
    <header className="maxturnos-header">
      {/* Barra superior con información de contacto */}
      <div className="header-top">
        <div className="container">
          <div className="header-info">
            <div className="header-contact-group">
              <a href={`tel:${maxturnosInfo.phone}`} className="header-contact-item">
                <FaPhone className="header-contact-icon" aria-hidden="true" />
                <span>{maxturnosInfo.phone}</span>
              </a>
              <a href={`mailto:${maxturnosInfo.email}`} className="header-contact-item">
                <FaEnvelope className="header-contact-icon" aria-hidden="true" />
                <span>{maxturnosInfo.email}</span>
              </a>
            </div>
            <div className="user-logo" onClick={() => {
              if (isAuthenticated()) {
                setIsProfileModalOpen(true);
              } else {
                setIsAuthModalOpen(true);
              }
            }}>
              <svg className="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#000000"/>
                <path d="M12 14C7.58172 14 4 15.7909 4 18V20H20V18C20 15.7909 16.4183 14 12 14Z" fill="#000000"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="header-nav">
        <div className="container">
          <div className="nav-content">
            {/* Logo */}
            <Link to="/" className="logo" onClick={handleNavClick}>
              <h1>{maxturnosInfo.name}</h1>
            </Link>

            {/* Navegación desktop */}
            <ul className="nav-menu">
              <li>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={handleNavClick}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/locales-adheridos" className={`nav-link ${isActive('/locales-adheridos') ? 'active' : ''}`} onClick={handleNavClick}>
                  Locales Adheridos
                </Link>
              </li>
            </ul>

            {/* Botón de contacto */}
            <button type="button" className="btn btn-primary btn-contact" onClick={openContactModal}>
              ¡Contáctanos!
            </button>

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
                <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={handleNavClick}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/locales-adheridos" className={`mobile-nav-link ${isActive('/locales-adheridos') ? 'active' : ''}`} onClick={handleNavClick}>
                  Locales Adheridos
                </Link>
              </li>
              <li>
                <button type="button" className="btn btn-primary btn-contact-mobile" onClick={() => { handleNavClick(); openContactModal(); }}>
                  ¡Contáctanos!
                </button>
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

export default MaxturnosHeader;

