import React from 'react';
import { useContactModal } from '../context/ContactModalContext';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import './LocalesAdheridos.css';

const LocalesAdheridos = () => {
  const { openContactModal } = useContactModal();
  // Datos del ejemplo real de barbería
  const localesAdheridos = [
    {
      id: 1,
      name: "Barbería Clásica",
      category: "Barbería Clásica",
      address: "Dirección Falsa 123",
      phone: "+54 11 1234-5678",
      rating: 3.3,
      reviewCount: 8,
      hours: "Mar-Sáb: 10:00-20:00",
      image: "/assets/img/establecimientos/barberia_ejemplo/portada/portada1.jpg",
      website: "/barberia",
      description: "Barbería integral que da servicio personalizado a todo tipo de edades, garantizando comodidad. Nuestra premisa es transmitirles a ustedes la pasión que sentimos por lo que hacemos todos los días."
    }
  ];

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
        {/* Header de la página */}
        <div className="page-header">
          <h1>Locales Adheridos</h1>
          <p>Descubre los negocios que ya confían en Maucci para gestionar sus reservas</p>
        </div>

        {/* Estadísticas */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{localesAdheridos.length}</div>
              <div className="stat-label">Local Adherido</div>
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

        {/* Grid de locales */}
        <div className="locales-grid">
          {localesAdheridos.map(local => (
            <div key={local.id} className="local-card">
              <div className="local-image">
                <img src={local.image} alt={local.name} />
                <div className="local-category">{local.category}</div>
              </div>
              
              <div className="local-content">
                <div className="local-header">
                  <h3 className="local-name">{local.name}</h3>
                  <div className="local-rating">
                    <div className="stars">
                      {renderStars(local.rating)}
                    </div>
                    <span className="rating-text">
                      {typeof local.rating === 'number' ? local.rating.toFixed(1) : local.rating} ({local.reviewCount} {local.reviewCount === 1 ? 'voto' : 'votos'})
                    </span>
                  </div>
                </div>
                
                <p className="local-description">{local.description}</p>
                
                <div className="local-info">
                  <div className="info-item">
                    <img src="/assets/img/logos_genericos/ubicacion.png" alt="" className="info-icon local-card-icon" aria-hidden="true" />
                    <span>{local.address}</span>
                  </div>
                  <div className="info-item">
                    <img src="/assets/img/logos_genericos/telefono.png" alt="" className="info-icon local-card-icon" aria-hidden="true" />
                    <span>{local.phone}</span>
                  </div>
                  <div className="info-item">
                    <img src="/assets/img/logos_genericos/reloj.png" alt="" className="info-icon local-card-icon" aria-hidden="true" />
                    <span>{local.hours}</span>
                  </div>
                </div>
                
                <div className="local-actions">
                  <a 
                    href={local.website} 
                    className="btn btn-primary"
                    target={local.website.startsWith('http') ? '_blank' : '_self'}
                    rel={local.website.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    Ver Página
                    <FaExternalLinkAlt className="btn-icon" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
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
