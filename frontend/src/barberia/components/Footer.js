import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { businessInfo } from '../data/sampleData';
import { servicioService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import './Footer.css';

const ESTABLECIMIENTO = 'barberia_clasica';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categorias, setCategorias] = useState([]);

  // Usar las mismas categorías que la sección Servicios: se obtienen de los servicios reales (no de negocio.categorias que puede estar en caché o desactualizado)
  useEffect(() => {
    const extraerCategorias = (serviciosRaw) => {
      if (!Array.isArray(serviciosRaw)) return [];
      const unicas = [...new Set(serviciosRaw.map((s) => s.categoria).filter(Boolean))];
      return unicas;
    };

    const cached = barberiaCache.getServicios(ESTABLECIMIENTO);
    if (cached && Array.isArray(cached)) {
      setCategorias(extraerCategorias(cached));
    }

    const cargarCategorias = async () => {
      try {
        const res = await servicioService.obtenerServicios(ESTABLECIMIENTO);
        const datos = res?.data ?? res;
        if (Array.isArray(datos)) {
          setCategorias(extraerCategorias(datos));
        }
      } catch (err) {
        console.error('Error al cargar categorías para el footer:', err);
      }
    };
    cargarCategorias();
  }, []);

  return (
    <footer className="footer barberia-footer">
      <div className="container">
        <div className="footer-content">
          {/* Información de la empresa */}
          <div className="footer-section footer-section-main">
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

          {/* Servicios: categorías del negocio (se actualizan desde el panel). Enlaces llevan a Servicios, arriba, con filtro aplicado. */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Servicios</h4>
            <ul className="footer-links">
              {categorias.map((cat) => (
                <li key={cat}>
                  <Link
                    to="/barberia/servicios"
                    state={{ filter: cat, scrollToTop: true }}
                    className="footer-link"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/barberia/servicios"
                  state={{ filter: 'Todos', scrollToTop: true }}
                  className="footer-link"
                >
                  Ver más...
                </Link>
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

