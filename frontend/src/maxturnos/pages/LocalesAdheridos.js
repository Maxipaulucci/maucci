import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContactModal } from '../context/ContactModalContext';
import { negociosService } from '../../services/api';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import './LocalesAdheridos.css';

const LocalesAdheridos = () => {
  const { openContactModal } = useContactModal();
  const [localesAdheridos, setLocalesAdheridos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await negociosService.obtenerLocalesAdheridos();
        const data = Array.isArray(res.data) ? res.data : [];
        setLocalesAdheridos(data);
      } catch (err) {
        setError(err.message || 'Error al cargar locales adheridos');
        setLocalesAdheridos([]);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, []);

  const renderStars = (rating) => {
    const r = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, index) => {
      const fill = Math.min(1, Math.max(0, r - index));
      return (
        <span key={index} className="star-wrapper">
          <FaStar className="star empty" aria-hidden="true" />
          <span className="star-fill" style={{ width: `${fill * 100}%` }}>
            <FaStar className="star filled" aria-hidden="true" />
          </span>
        </span>
      );
    });
  };

  return (
    <div className="locales-adheridos">
      <div className="container">
        <div className="page-header">
          <h1>Locales Adheridos</h1>
          <p>Descubre los negocios que ya confían en Maucci para gestionar sus reservas</p>
        </div>

        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{localesAdheridos.length}</div>
              <div className="stat-label">{localesAdheridos.length === 1 ? 'Local Adherido' : 'Locales Adheridos'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <div className="stat-label">Reservas Mensuales</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Satisfacción</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Disponibilidad</div>
            </div>
          </div>
        </div>

        {isLoading && <p className="locales-adheridos-status">Cargando locales...</p>}
        {error && <p className="locales-adheridos-status locales-adheridos-error">{error}</p>}
        {!isLoading && !error && localesAdheridos.length === 0 && (
          <p className="locales-adheridos-status">Aún no hay locales adheridos publicados.</p>
        )}

        <div className="locales-grid">
          {localesAdheridos.map((local) => (
            <div key={local.codigo} className="local-card">
              <div className="local-image">
                <img src={local.imagen} alt={local.nombre} />
                <div className="local-category">{local.categoria || 'Negocio'}</div>
              </div>
              
              <div className="local-content">
                <div className="local-header">
                  <h3 className="local-name">{local.nombre}</h3>
                  <div className="local-rating">
                    <div className="stars">
                      {renderStars(local.rating)}
                    </div>
                    <span className="rating-text">
                      {(local.rating ?? 0).toFixed(1)} ({local.reviewCount || 0} {(local.reviewCount || 0) === 1 ? 'voto' : 'votos'})
                    </span>
                  </div>
                </div>
                
                {local.descripcion && (
                  <p className="local-description">{local.descripcion}</p>
                )}
                
                <div className="local-info">
                  {local.direccion && (
                    <div className="info-item">
                      <img src="/assets/img/logos_genericos/ubicacion.png" alt="" className="info-icon local-card-icon" aria-hidden="true" />
                      <span>{local.direccion}</span>
                    </div>
                  )}
                  {local.telefono && (
                    <div className="info-item">
                      <img src="/assets/img/logos_genericos/telefono.png" alt="" className="info-icon local-card-icon" aria-hidden="true" />
                      <span>{local.telefono}</span>
                    </div>
                  )}
                  {local.horarios && (
                    <div className="info-item">
                      <img src="/assets/img/logos_genericos/reloj.png" alt="" className="info-icon local-card-icon" aria-hidden="true" />
                      <span>{local.horarios}</span>
                    </div>
                  )}
                </div>
                
                <div className="local-actions">
                  <Link 
                    to={local.website || `/local/${local.codigo}`}
                    className="btn btn-primary"
                  >
                    Ver Página
                    <FaExternalLinkAlt className="btn-icon" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>¿Quieres que tu negocio aparezca aquí?</h2>
            <p>Únete a la red de locales que ya están creciendo con Maucci. Crea tu sistema de turnos personalizado.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={openContactModal}>
              ¡Contáctanos Ahora!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalesAdheridos;
