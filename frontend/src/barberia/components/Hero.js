import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { businessInfo } from '../data/sampleData';
import { resenasService } from '../../services/api';
import { negociosService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import { useEstablecimiento } from '../../context/EstablecimientoContext';
import { obtenerEstadoApertura } from '../utils/horariosUtils';
import './Hero.css';

const Hero = () => {
  const { codigo, to } = useEstablecimiento();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [negocioConfig, setNegocioConfig] = useState(null);
  const [estadoApertura, setEstadoApertura] = useState({
    cerrado: true,
    mensaje: 'Cerrado: por hoy'
  });
  const [isLoading, setIsLoading] = useState(true);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === businessInfo.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? businessInfo.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const aplicarNegocio = (negocio) => {
    if (!negocio) return;
    setNegocioConfig(negocio);
    setEstadoApertura(obtenerEstadoApertura(negocio));
  };

  useEffect(() => {
    const cachedResenas = barberiaCache.getResenas(codigo);
    const cachedNegocio = barberiaCache.getNegocio(codigo);
    const fromCache = (cachedResenas && Array.isArray(cachedResenas)) || cachedNegocio;

    if (cachedResenas && cachedResenas.length > 0) {
      const promedio = cachedResenas.reduce((sum, r) => sum + r.rating, 0) / cachedResenas.length;
      setAverageRating(promedio);
      setTotalReviews(cachedResenas.length);
    } else if (cachedResenas && cachedResenas.length === 0) {
      setAverageRating(0);
      setTotalReviews(0);
    }
    if (cachedNegocio) aplicarNegocio(cachedNegocio);
    if (fromCache) setIsLoading(false);

    const cargarResenas = async () => {
      try {
        const resenasResponse = await resenasService.obtenerResenasPublicas(codigo);
        const resenasData = resenasResponse?.data ?? resenasResponse ?? [];
        if (Array.isArray(resenasData)) barberiaCache.setResenas(codigo, resenasData);
        if (resenasData.length > 0) {
          const promedio = resenasData.reduce((sum, r) => sum + r.rating, 0) / resenasData.length;
          setAverageRating(promedio);
          setTotalReviews(resenasData.length);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
        }
      } catch (err) {
        console.error('Error al cargar reseñas (Hero):', err);
        setAverageRating(0);
        setTotalReviews(0);
      }
    };

    const cargarNegocio = async () => {
      try {
        const negocioResponse = await negociosService.obtenerNegocio(codigo);
        const negocio = negocioResponse?.data ?? negocioResponse;
        if (negocio?.codigo) barberiaCache.setNegocio(codigo, negocio);
        aplicarNegocio(negocio);
      } catch (err) {
        console.error('Error al cargar configuración del negocio (Hero):', err);
      }
    };

    if (!fromCache) setIsLoading(true);
    Promise.all([cargarResenas(), cargarNegocio()]).finally(() => setIsLoading(false));
  }, [codigo]);

  // Recalcular cada minuto con el horario del día actual (bloquesHorario)
  useEffect(() => {
    if (!negocioConfig) return undefined;
    const verificarEstado = () => {
      setEstadoApertura(obtenerEstadoApertura(negocioConfig));
    };
    verificarEstado();
    const interval = setInterval(verificarEstado, 60000);
    return () => clearInterval(interval);
  }, [negocioConfig]);

  const renderStars = (rating) => {
    const ratingNum = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`star ${index < Math.floor(ratingNum) ? 'filled' : 'empty'}`}
      />
    ));
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-info">
            <div className="business-header">
              <h1 className="business-name">{businessInfo.name}</h1>

              <div className="rating-section">
                {!isLoading && (
                  <>
                    <div className="rating">
                      <div className="stars">
                        {renderStars(averageRating)}
                      </div>
                      <span className="rating-text">
                        {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'voto' : 'votos'})
                      </span>
                    </div>
                    <div className={`status ${estadoApertura.cerrado ? 'cerrado' : ''}`}>
                      <FaClock className="status-icon" />
                      <span key={estadoApertura.mensaje}>
                        {estadoApertura.mensaje}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="location">
                <img
                  src="/assets/img/logos_genericos/ubicacion.png"
                  alt="Ubicación"
                  className="location-icon"
                />
                <span>{businessInfo.address}</span>
              </div>
            </div>

            <div className="hero-actions">
              <Link to={to('servicios')} className="btn btn-primary btn-lg">
                Reservar turno
              </Link>
            </div>
          </div>

          <div className="hero-gallery">
            <div className="gallery-container">
              <img
                src={businessInfo.images[currentImageIndex]}
                alt={`${businessInfo.name} - Imagen ${currentImageIndex + 1}`}
                className="gallery-image"
              />

              <button
                className="gallery-nav gallery-nav-prev"
                onClick={prevImage}
                aria-label="Imagen anterior"
              >
                <FaChevronLeft />
              </button>

              <button
                className="gallery-nav gallery-nav-next"
                onClick={nextImage}
                aria-label="Siguiente imagen"
              >
                <FaChevronRight />
              </button>

              <div className="gallery-indicators">
                {businessInfo.images.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => goToImage(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>

              <div className="gallery-counter">
                {currentImageIndex + 1} / {businessInfo.images.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
