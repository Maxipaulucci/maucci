import React from 'react';
import { FaRocket, FaUsers, FaChartLine, FaMobileAlt } from 'react-icons/fa';
import { maxturnosInfo } from '../data/maxturnosData';
import { useContactModal } from '../context/ContactModalContext';
import { useServicesModal } from '../context/ServicesModalContext';
import './Hero.css';

const MaxturnosHero = () => {
  const { openContactModal } = useContactModal();
  const { openServicesModal } = useServicesModal();
  return (
    <section className="maxturnos-hero">
      <div className="container">
        <div className="hero-content">
          {/* Contenido principal */}
          <div className="hero-text">
            <h1 className="hero-title">
              {maxturnosInfo.name}
            </h1>
            <p className="hero-tagline">
              {maxturnosInfo.tagline}
            </p>
            <p className="hero-description">
              {maxturnosInfo.description}
            </p>
            
            {/* Botón principal */}
            <div className="hero-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={openContactModal}>
                ¡Contáctanos!
              </button>
              <button type="button" className="btn btn-outline btn-lg" onClick={openServicesModal}>
                Ver Servicios
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="hero-stats">
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">50+</span>
                <span className="stat-label">Negocios</span>
              </div>
            </div>
            
            <div className="stat-item">
              <FaChartLine className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">40%</span>
                <span className="stat-label">Más Ventas</span>
              </div>
            </div>
            
            <div className="stat-item">
              <FaMobileAlt className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Disponible</span>
              </div>
            </div>
            
            <div className="stat-item">
              <FaRocket className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">100%</span>
                <span className="stat-label">Satisfacción</span>
              </div>
            </div>
          </div>
        </div>

        {/* Imagen/Ilustración */}
        <div className="hero-visual">
          <div className="visual-container">
            <div className="mockup-phone">
              <div className="phone-screen">
                <div className="app-preview">
                  <div className="app-header">
                    <div className="app-title">Barbería</div>
                    <div className="app-rating">⭐ 5.0</div>
                  </div>
                  <div className="app-services">
                    <div className="service-item">✂️ Corte de Pelo</div>
                    <div className="service-item">🧔 Corte de Barba</div>
                    <div className="service-item">🎨 Coloración</div>
                  </div>
                  <div className="app-button">Reservar Ahora</div>
                </div>
              </div>
            </div>
            
            <div className="mockup-laptop">
              <div className="laptop-screen">
                <div className="dashboard-preview">
                  <div className="dashboard-header">Panel de Negocio</div>
                  <div className="dashboard-stats">
                    <div className="dashboard-stat">
                      <span className="stat-label">Reservas Hoy</span>
                      <span className="stat-value">12</span>
                    </div>
                    <div className="dashboard-stat">
                      <span className="stat-label">Ingresos</span>
                      <span className="stat-value">$45.000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MaxturnosHero;


