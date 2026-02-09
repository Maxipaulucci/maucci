import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { maxturnosInfo } from '../data/maxturnosData';
import { useContactModal } from '../context/ContactModalContext';
import './Footer.css';

const MaxturnosFooter = () => {
  const currentYear = new Date().getFullYear();
  const { openContactModal } = useContactModal();

  return (
    <footer className="maxturnos-footer">
      <div className="container">
        <div className="footer-content">
          {/* Información de la empresa */}
          <div className="footer-section">
            <h3 className="footer-title">{maxturnosInfo.name}</h3>
            <p className="footer-description">
              {maxturnosInfo.description}
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Enlaces Rápidos</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">Inicio</Link>
              </li>
              <li>
                <Link to="/locales-adheridos" className="footer-link">Locales Adheridos</Link>
              </li>
              <li>
                <button type="button" className="footer-link footer-link-button" onClick={openContactModal}>
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Nuestros Servicios</h4>
            <ul className="footer-links">
              <li>
                <a href="#servicios" className="footer-link">Sistemas de Reservas</a>
              </li>
              <li>
                <a href="#servicios" className="footer-link">Diseño Personalizado</a>
              </li>
              <li>
                <a href="#servicios" className="footer-link">Gestión de Clientes</a>
              </li>
              <li>
                <a href="#servicios" className="footer-link">Notificaciones</a>
              </li>
              <li>
                <a href="#servicios" className="footer-link">Reportes y Estadísticas</a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Contacto</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>{maxturnosInfo.address}</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <a href={`tel:${maxturnosInfo.phone}`}>{maxturnosInfo.phone}</a>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href={`mailto:${maxturnosInfo.email}`}>{maxturnosInfo.email}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="footer-divider"></div>

        {/* Footer inferior */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} {maxturnosInfo.name}. Todos los derechos reservados.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacidad" className="footer-bottom-link">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="footer-bottom-link">
                Términos de Servicio
              </Link>
              <Link to="/cookies" className="footer-bottom-link">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MaxturnosFooter;


