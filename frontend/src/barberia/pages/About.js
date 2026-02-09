import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaStar, FaUsers, FaAward, FaInstagram, FaFacebook } from 'react-icons/fa';
import { businessInfo } from '../data/sampleData';
import { resenasService } from '../../services/api';
import './About.css';

const BarberiaAbout = () => {
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  // Cargar calificación real del negocio
  useEffect(() => {
    const cargarCalificacion = async () => {
      try {
        const negocioCodigo = 'barberia_clasica';
        const resenasResponse = await resenasService.obtenerResenasPublicas(negocioCodigo);
        const resenasData = resenasResponse.data || [];
        
        if (resenasData.length > 0) {
          const promedio = resenasData.reduce((sum, resena) => sum + resena.rating, 0) / resenasData.length;
          setAverageRating(promedio);
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        console.error('Error al cargar calificación:', err);
        setAverageRating(0);
      } finally {
        setIsLoadingRating(false);
      }
    };
    
    cargarCalificacion();
  }, []);
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar 
        key={index} 
        className={`star ${index < Math.floor(rating) ? 'filled' : 'empty'}`} 
      />
    ));
  };

  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>Acerca de {businessInfo.name}</h1>
            <p className="hero-description">
              {businessInfo.description}
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon-container">
                  <img 
                    src="/assets/img/logos_genericos/estrella.png" 
                    alt="Estrella" 
                    className="stat-icon"
                  />
                </div>
                <div className="stat-content">
                  <span className="stat-number">
                    {isLoadingRating ? '...' : averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                  </span>
                  <span className="stat-label">Calificación</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon-container">
                  <img 
                    src="/assets/img/logos_genericos/grupo.png" 
                    alt="Grupo" 
                    className="stat-icon"
                  />
                </div>
                <div className="stat-content">
                  <span className="stat-number">∞</span>
                  <span className="stat-label">Clientes Satisfechos</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon-container">
                  <img 
                    src="/assets/img/logos_genericos/medalla.png" 
                    alt="Medalla" 
                    className="stat-icon"
                  />
                </div>
                <div className="stat-content">
                  <span className="stat-number">5+</span>
                  <span className="stat-label">Años de Experiencia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-image">
            <img 
              src={businessInfo.images[0]} 
              alt={businessInfo.name}
              className="about-image"
            />
          </div>
        </section>

        {/* Nuestra Historia */}
        <section className="about-story">
          <div className="story-content">
            <h2>Nuestra Historia</h2>
            <p>
              Desde nuestros inicios, {businessInfo.name} se ha comprometido a brindar 
              servicios de la más alta calidad en el cuidado personal masculino. 
              Nuestro equipo de profesionales certificados trabaja con pasión y 
              dedicación para asegurar que cada cliente se sienta cómodo y satisfecho.
            </p>
            <p>
              Creemos que un buen corte de pelo y un arreglo de barba no solo mejoran 
              tu apariencia, sino que también aumentan tu confianza y autoestima. 
              Por eso, nos esforzamos por crear un ambiente relajado y profesional 
              donde puedas disfrutar de una experiencia única.
            </p>
          </div>
        </section>

        {/* Nuestros Valores */}
        <section className="about-values">
          <h2>Nuestros Valores</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FaStar />
              </div>
              <h3>Calidad</h3>
              <p>
                Nos comprometemos a brindar servicios de la más alta calidad 
                utilizando las mejores técnicas y productos del mercado.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FaUsers />
              </div>
              <h3>Servicio Personalizado</h3>
              <p>
                Cada cliente es único. Adaptamos nuestros servicios a tus 
                necesidades específicas y preferencias personales.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FaAward />
              </div>
              <h3>Profesionalismo</h3>
              <p>
                Nuestro equipo está formado por profesionales certificados 
                con años de experiencia en la industria.
              </p>
            </div>
          </div>
        </section>

        {/* Información de Contacto */}
        <section className="about-contact">
          <h2>Información de Contacto</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <img 
                src="/assets/img/logos_genericos/ubicacion.png" 
                alt="Ubicación" 
                className="contact-icon"
              />
              <div className="contact-details">
                <h3>Ubicación</h3>
                <p>{businessInfo.address}</p>
              </div>
            </div>
            
            <div className="contact-card">
              <img 
                src="/assets/img/logos_genericos/telefono.png" 
                alt="Teléfono" 
                className="contact-icon"
              />
              <div className="contact-details">
                <h3>Teléfono</h3>
                <p>{businessInfo.phone}</p>
              </div>
            </div>
            
            <div className="contact-card">
              <img 
                src="/assets/img/logos_genericos/mail.png" 
                alt="Email" 
                className="contact-icon"
              />
              <div className="contact-details">
                <h3>Email</h3>
                <p>{businessInfo.email}</p>
              </div>
            </div>
            
            <div className="contact-card">
              <img 
                src="/assets/img/logos_genericos/perfil.png" 
                alt="Redes Sociales" 
                className="contact-icon"
              />
              <div className="contact-details">
                <h3>Redes Sociales</h3>
                <div className="social-links-container">
                  <a 
                    href="https://www.instagram.com/barberiaclasica" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-item"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="social-icon" />
                    <span>Instagram</span>
                  </a>
                  <a 
                    href="https://www.facebook.com/barberiaclasica" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-item"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="social-icon" />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta">
          <div className="cta-content">
            <h2>¿Listo para una nueva experiencia?</h2>
            <p>
              Reserva tu turno hoy y descubre por qué nuestros clientes 
              nos eligen una y otra vez.
            </p>
            <div className="cta-actions">
              <a href="/barberia/reservar" className="btn btn-primary btn-lg">
                Reservar Ahora
              </a>
              <a href="/barberia/servicios" className="btn btn-outline btn-lg">
                Ver Servicios
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BarberiaAbout;

