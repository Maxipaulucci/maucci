import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { businessInfo } from '../data/sampleData';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Información de la empresa */}
          <div className="footer-section">
            <h3 className="footer-title">{businessInfo.name}</h3>
            <p className="footer-description">
              {businessInfo.description}
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
                <Link to="/barberia" className="footer-link">Inicio</Link>
              </li>
              <li>
                <Link to="/barberia/servicios" className="footer-link">Servicios</Link>
              </li>
              <li>
                <Link to="/barberia/equipo" className="footer-link">Equipo</Link>
              </li>
              <li>
                <Link to="/barberia/resenas" className="footer-link">Reseñas</Link>
              </li>
              <li>
                <Link to="/barberia/acerca" className="footer-link">Acerca de</Link>
              </li>
              <li>
                <Link to="/barberia/reservar" className="btn btn-primary">Reservar turno</Link>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Servicios</h4>
            <ul className="footer-links">
              <li>
                <Link to="/barberia/servicios" className="footer-link">Cortes</Link>
              </li>
              <li>
                <Link to="/barberia/servicios" className="footer-link">Barba</Link>
              </li>
              <li>
                <Link to="/barberia/servicios" className="footer-link">Paquetes</Link>
              </li>
              <li>
                <Link to="/barberia/servicios" className="footer-link">Tratamientos</Link>
              </li>
              <li>
                <Link to="/barberia/servicios" className="footer-link">Color</Link>
              </li>
              <li>
                <Link to="/barberia/servicios" className="footer-link">Ver más...</Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Contacto</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>{businessInfo.address}</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <a href={`tel:${businessInfo.phone}`}>{businessInfo.phone}</a>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href={`mailto:${businessInfo.email}`}>{businessInfo.email}</a>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Horarios</h4>
            <div className="hours-info">
              <div className="hours-item">
                <span className="hours-icon">🕐</span>
                <div className="hours-details">
                  <span className="day">Lunes a Viernes</span>
                  <span className="time">{businessInfo.hours.tuesday}</span>
                </div>
              </div>
              <div className="hours-item">
                <span className="hours-icon">🕐</span>
                <div className="hours-details">
                  <span className="day">Sábado</span>
                  <span className="time">{businessInfo.hours.saturday}</span>
                </div>
              </div>
              <div className="hours-item">
                <span className="hours-icon">🕐</span>
                <div className="hours-details">
                  <span className="day">Domingo</span>
                  <span className="time">{businessInfo.hours.sunday}</span>
                </div>
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
              © {currentYear} {businessInfo.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

