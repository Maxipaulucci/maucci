import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { businessInfo } from '../data/sampleData';
import { resenasService } from '../../services/api';
import { negociosService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import './Hero.css';

const NEGOCIO_CODIGO = 'barberia_clasica';

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [horaCierre, setHoraCierre] = useState('20:00');
  const [diasDisponibles, setDiasDisponibles] = useState(null); // null = no restringir por día
  const [estaCerrado, setEstaCerrado] = useState(false);
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

  // Aplicar datos de negocio al estado (hora cierre, días, abierto/cerrado)
  const aplicarNegocio = (negocio) => {
    if (!negocio) return;
    const finHorario = negocio.horarios?.fin || '20:00';
    setHoraCierre(finHorario);
    setDiasDisponibles(negocio.diasDisponibles && Array.isArray(negocio.diasDisponibles) ? negocio.diasDisponibles : null);
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const horaActualMinutos = horaActual * 60 + minutosActuales;
    const [horasCierre, minutosCierre] = finHorario.split(':').map(Number);
    const horaCierreMinutos = (horasCierre || 20) * 60 + (minutosCierre || 0);
    let cerrado = horaActualMinutos >= horaCierreMinutos;
    if (negocio.diasDisponibles?.length > 0) {
      const diaHoy = ahora.getDay();
      if (!negocio.diasDisponibles.includes(diaHoy)) cerrado = true;
    }
    setEstaCerrado(cerrado);
  };

  // Cargar reseñas y negocio: mostrar caché al instante si existe (calificación y abierto/cerrado), luego refrescar en segundo plano
  useEffect(() => {
    const cachedResenas = barberiaCache.getResenas(NEGOCIO_CODIGO);
    const cachedNegocio = barberiaCache.getNegocio(NEGOCIO_CODIGO);
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
        const resenasResponse = await resenasService.obtenerResenasPublicas(NEGOCIO_CODIGO);
        const resenasData = resenasResponse?.data ?? resenasResponse ?? [];
        if (Array.isArray(resenasData)) barberiaCache.setResenas(NEGOCIO_CODIGO, resenasData);
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
        const negocioResponse = await negociosService.obtenerNegocio(NEGOCIO_CODIGO);
        const negocio = negocioResponse?.data ?? negocioResponse;
        if (negocio?.codigo) barberiaCache.setNegocio(NEGOCIO_CODIGO, negocio);
        aplicarNegocio(negocio);
      } catch (err) {
        console.error('Error al cargar configuración del negocio (Hero):', err);
      }
    };

    if (!fromCache) setIsLoading(true);
    Promise.all([cargarResenas(), cargarNegocio()]).finally(() => setIsLoading(false));
  }, []);

  // Verificar cada minuto si está cerrado (hora y día laboral)
  useEffect(() => {
    const verificarEstado = () => {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutosActuales = ahora.getMinutes();
      const horaActualMinutos = horaActual * 60 + minutosActuales;
      const [horasCierre, minutosCierre] = horaCierre.split(':').map(Number);
      const horaCierreMinutos = (horasCierre || 20) * 60 + (minutosCierre || 0);
      let cerrado = horaActualMinutos >= horaCierreMinutos;
      if (diasDisponibles && diasDisponibles.length > 0) {
        const diaHoy = ahora.getDay();
        if (!diasDisponibles.includes(diaHoy)) cerrado = true;
      }
      setEstaCerrado(cerrado);
    };
    verificarEstado();
    const interval = setInterval(verificarEstado, 60000);
    return () => clearInterval(interval);
  }, [horaCierre, diasDisponibles]);

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
          {/* Información principal */}
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
                    <div className={`status ${estaCerrado ? 'cerrado' : ''}`}>
                      <FaClock className="status-icon" />
                      <span key={horaCierre}>
                        {estaCerrado 
                          ? 'Cerrado por hoy' 
                          : `Abierto hasta las ${horaCierre}`
                        }
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
              <Link to="/barberia/reservar" className="btn btn-primary btn-lg">
                Reservar turno
              </Link>
              <Link to="/barberia/servicios" className="btn btn-outline btn-lg">
                Ver Servicios
              </Link>
            </div>
          </div>

          {/* Galería de imágenes */}
          <div className="hero-gallery">
            <div className="gallery-container">
              <img 
                src={businessInfo.images[currentImageIndex]} 
                alt={`${businessInfo.name} - Imagen ${currentImageIndex + 1}`}
                className="gallery-image"
              />
              
              {/* Controles de navegación */}
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
              
              {/* Indicadores */}
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
              
              {/* Contador de imágenes */}
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


