import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaInstagram } from 'react-icons/fa';
import { maxturnosInfo } from '../data/maxturnosData';
import { useContactModal } from '../context/ContactModalContext';
import LegalModal from './LegalModal';
import './Footer.css';

const MaxturnosFooter = () => {
  const currentYear = new Date().getFullYear();
  const { openContactModal } = useContactModal();
  const [legalModalType, setLegalModalType] = useState(null);

  return (
    <footer className="maxturnos-footer">
      <div className="container">
        <div className="footer-content">
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

          {/* Información de contacto */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Contacto</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>{maxturnosInfo.address}</span>
              </div>
              <div className="contact-item">
                <a href={`https://instagram.com/${maxturnosInfo.instagram}`} target="_blank" rel="noopener noreferrer" className="footer-instagram-link">
                  <FaInstagram className="contact-icon" aria-hidden="true" />
                  <span>Instagram</span>
                </a>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <a href={`mailto:${maxturnosInfo.email}`}>{maxturnosInfo.email}</a>
              </div>
            </div>
          </div>

          {/* Botones legales: misma altura que Enlaces y Contacto, a la derecha */}
          <div className="footer-section footer-legal-section">
            <button
              type="button"
              className="footer-legal-link"
              onClick={() => setLegalModalType('privacidad')}
            >
              Política de Privacidad
            </button>
            <button
              type="button"
              className="footer-legal-link"
              onClick={() => setLegalModalType('terminos')}
            >
              Términos de Servicio
            </button>
            <button
              type="button"
              className="footer-legal-link"
              onClick={() => setLegalModalType('cookies')}
            >
              Política de Cookies
            </button>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="footer-divider"></div>

        {/* Footer inferior: solo copyright */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} {maxturnosInfo.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
      {legalModalType && (
        <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      )}
    </footer>
  );
};

export default MaxturnosFooter;


