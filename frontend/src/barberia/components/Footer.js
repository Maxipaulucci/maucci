import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { businessInfo } from '../data/sampleData';
import { servicioService, negociosService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import { useEstablecimiento } from '../../context/EstablecimientoContext';
import { obtenerLineasHorarios } from '../utils/horariosUtils';
import './Footer.css';

const Footer = () => {
  const { codigo: establecimiento, to } = useEstablecimiento();
  const currentYear = new Date().getFullYear();
  const [categorias, setCategorias] = useState([]);
  const [lineasHorarios, setLineasHorarios] = useState([]);

  useEffect(() => {
    const extraerCategorias = (serviciosRaw) => {
      if (!Array.isArray(serviciosRaw)) return [];
      const unicas = [...new Set(serviciosRaw.map((s) => s.categoria).filter(Boolean))];
      return unicas;
    };

    const cached = barberiaCache.getServicios(establecimiento);
    if (cached && Array.isArray(cached)) {
      setCategorias(extraerCategorias(cached));
    }

    const cargarCategorias = async () => {
      try {
        const res = await servicioService.obtenerServicios(establecimiento);
        const datos = res?.data ?? res;
        if (Array.isArray(datos)) {
          setCategorias(extraerCategorias(datos));
        }
      } catch (err) {
        console.error('Error al cargar categorías para el footer:', err);
      }
    };
    cargarCategorias();
  }, [establecimiento]);

  useEffect(() => {
    const aplicar = (negocio) => {
      if (negocio) {
        setLineasHorarios(obtenerLineasHorarios(negocio));
      }
    };

    const cachedNegocio = barberiaCache.getNegocio(establecimiento);
    if (cachedNegocio) aplicar(cachedNegocio);

    const cargarHorarios = async () => {
      try {
        const res = await negociosService.obtenerNegocio(establecimiento);
        const negocio = res?.data ?? res;
        if (negocio?.codigo) {
          barberiaCache.setNegocio(establecimiento, negocio);
          aplicar(negocio);
        }
      } catch (err) {
        if (!cachedNegocio) {
          setLineasHorarios(['Horarios no disponibles']);
        }
        console.error('Error al cargar horarios para el footer:', err);
      }
    };
    cargarHorarios();
  }, [establecimiento]);

  const parsearLineaHorario = (linea) => {
    const sep = linea.indexOf(': ');
    if (sep === -1) {
      return { dia: linea, tiempo: '' };
    }
    return {
      dia: linea.slice(0, sep),
      tiempo: linea.slice(sep + 2)
    };
  };

  return (
    <footer className="footer barberia-footer">
      <div className="container">
        <div className="footer-content">
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

          <div className="footer-section">
            <h4 className="footer-subtitle">Horarios</h4>
            <div className="hours-info">
              {lineasHorarios.length === 0 ? (
                <div className="hours-item">
                  <span className="hours-icon">🕐</span>
                  <div className="hours-details">
                    <span className="day">Cargando...</span>
                  </div>
                </div>
              ) : (
                lineasHorarios.map((linea) => {
                  const { dia, tiempo } = parsearLineaHorario(linea);
                  return (
                    <div key={linea} className="hours-item">
                      <span className="hours-icon">🕐</span>
                      <div className="hours-details">
                        <span className="day">{dia}</span>
                        {tiempo ? <span className="time">{tiempo}</span> : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Servicios</h4>
            <ul className="footer-links">
              {categorias.map((cat) => (
                <li key={cat}>
                  <Link
                    to={to('servicios')}
                    state={{ filter: cat, scrollToTop: true }}
                    className="footer-link"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={to('servicios')}
                  state={{ filter: 'Todos', scrollToTop: true }}
                  className="footer-link"
                >
                  Ver más...
                </Link>
              </li>
            </ul>
          </div>

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

        <div className="footer-divider"></div>

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
