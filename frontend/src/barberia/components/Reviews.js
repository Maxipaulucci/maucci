import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaQuoteRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { resenasService } from '../../services/api';
import { barberiaCache } from '../data/barberiaCache';
import ResenaModal from '../../components/shared/ResenaModal';
import ResenaCompletaModal from '../../components/shared/ResenaCompletaModal';
import './Reviews.css';

const NEGOCIO_CODIGO = 'barberia_clasica';

function formatResenas(resenasData) {
  if (!Array.isArray(resenasData)) return [];
  return resenasData.map((resena) => ({
    id: resena.id,
    name: resena.usuarioNombre && resena.usuarioApellido
      ? `${resena.usuarioNombre} ${resena.usuarioApellido}`
      : (resena.usuarioEmail || '').split('@')[0],
    rating: resena.rating,
    comment: resena.texto || '',
    date: new Date(resena.fechaCreacion).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long'
    }),
    time: new Date(resena.fechaCreacion).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }));
}

const Reviews = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isResenaModalOpen, setIsResenaModalOpen] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isResenaCompletaModalOpen, setIsResenaCompletaModalOpen] = useState(false);
  const reviewsPerPage = 3;
  const MAX_CHARACTERS = 53; // Máximo de caracteres antes de truncar

  // Cargar reseñas: mostrar caché al instante si existe, luego refrescar en segundo plano
  useEffect(() => {
    const cached = barberiaCache.getResenas(NEGOCIO_CODIGO);
    const fromCache = cached && Array.isArray(cached);
    if (fromCache) {
      setReviews(formatResenas(cached));
      setIsLoadingReviews(false);
    }
    cargarResenasAprobadas(fromCache);
  }, []);

  const cargarResenasAprobadas = async (backgroundRefresh = false) => {
    if (!backgroundRefresh) setIsLoadingReviews(true);
    try {
      const response = await resenasService.obtenerResenasPublicas(NEGOCIO_CODIGO);
      const resenasData = response.data || [];
      const reviewsFormatted = formatResenas(resenasData);
      setReviews(reviewsFormatted);
      barberiaCache.setResenas(NEGOCIO_CODIGO, resenasData);
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Ocultar el mensaje de error cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated()) {
      setShowAuthError(false);
    }
  }, [isAuthenticated]);

  const nextReviews = () => {
    setCurrentReviewIndex((prev) => {
      const nextIndex = prev + reviewsPerPage;
      return nextIndex >= reviews.length ? 0 : nextIndex;
    });
  };

  const prevReviews = () => {
    setCurrentReviewIndex((prev) => {
      if (prev === 0) {
        // Ir a la última página válida
        const totalPages = Math.ceil(reviews.length / reviewsPerPage);
        const lastPageIndex = (totalPages - 1) * reviewsPerPage;
        return Math.max(0, lastPageIndex);
      }
      return prev - reviewsPerPage;
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar 
        key={index} 
        className={`star ${index < rating ? 'filled' : 'empty'}`} 
      />
    ));
  };

  const currentReviews = reviews.slice(currentReviewIndex, currentReviewIndex + reviewsPerPage);

  // Calcular estadísticas
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  const totalReviews = reviews.length;

  const handleDejarResena = () => {
    if (!isAuthenticated()) {
      setShowAuthError(true);
    } else {
      setShowAuthError(false);
      setIsResenaModalOpen(true);
    }
  };

  const handleSubmitResena = async (resena, rating) => {
    if (!user || !user.email) {
      throw new Error('Debes estar autenticado para enviar una reseña');
    }
    await resenasService.crearResena(NEGOCIO_CODIGO, user.email, rating, resena);
    
    // Cerrar el modal
    setIsResenaModalOpen(false);
    
    // Mostrar notificación de éxito
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 5000); // Ocultar después de 5 segundos
    
    // Recargar las reseñas después de enviar una nueva
    await cargarResenasAprobadas();
  };

  const truncateText = (text) => {
    if (!text) return '';
    if (text.length <= MAX_CHARACTERS) return text;
    return text.substring(0, MAX_CHARACTERS).trim();
  };

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setIsResenaCompletaModalOpen(true);
  };

  return (
    <section className="reviews" id="resenas">
      <div className="container">
        <div className="section-header">
          <h2>Lo que dicen nuestros clientes</h2>
          <p>La satisfacción de nuestros clientes es nuestra mayor recompensa</p>
        </div>

        {/* Estadísticas de reseñas */}
        {!isLoadingReviews && (
        <div className="reviews-stats">
          <div className="stats-card">
            <div className="stats-rating">
              <div className="rating-number">{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</div>
              <div className="rating-stars">
                {renderStars(Math.floor(averageRating))}
              </div>
              <div className="rating-text">Basado en {totalReviews} reseñas</div>
            </div>
          </div>
          
          <div className="stats-breakdown">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(review => review.rating === rating).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="rating-bar">
                  <span className="rating-label">{rating} estrellas</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Carrusel de reseñas */}
        {!isLoadingReviews && (
        <div className="reviews-carousel">
          {reviews.length > 0 ? (
            <>
              <button 
                className="carousel-btn carousel-btn-prev"
                onClick={prevReviews}
                aria-label="Reseñas anteriores"
              >
                <FaChevronLeft />
              </button>

              <div className="reviews-grid">
                {currentReviews.map(review => {
                  const isTruncated = review.comment && review.comment.length > MAX_CHARACTERS;
                  const displayText = truncateText(review.comment);
                  
                  return (
                    <div 
                      key={review.id} 
                      className="review-card"
                      onClick={() => handleReviewClick(review)}
                    >
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-details">
                            <h4 className="reviewer-name">{review.name}</h4>
                            <div className="review-date">
                              {review.date} a las {review.time}
                            </div>
                          </div>
                        </div>
                        
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <FaQuoteLeft className="quote-icon quote-icon-left" />
                        <p className="review-text">
                          {displayText}
                          {isTruncated && (
                            <span className="review-ver-mas">... ver más</span>
                          )}
                        </p>
                        <FaQuoteRight className="quote-icon quote-icon-right" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                className="carousel-btn carousel-btn-next"
                onClick={nextReviews}
                aria-label="Siguientes reseñas"
              >
                <FaChevronRight />
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Aún no hay reseñas. ¡Sé el primero en dejar una reseña!
            </div>
          )}
        </div>
        )}

        {/* Indicadores del carrusel */}
        {!isLoadingReviews && reviews.length > 0 && (
        <div className="carousel-indicators">
          {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }, (_, index) => (
            <button
              key={index}
              className={`indicator ${Math.floor(currentReviewIndex / reviewsPerPage) === index ? 'active' : ''}`}
              onClick={() => setCurrentReviewIndex(index * reviewsPerPage)}
              aria-label={`Ir a página ${index + 1}`}
            />
          ))}
        </div>
        )}

        {/* Call to action - mismo estilo que Acerca de */}
        <div className="reviews-cta">
          <div className="reviews-cta-content">
            <h2>¿Tuviste una gran experiencia?</h2>
            <p>Ayúdanos compartiendo tu opinión y ayúdanos a mejorar</p>
            {showAuthError && (
              <div className="reviews-auth-error">
                Debes tener la sesión iniciada para dejar una reseña
              </div>
            )}
            <div className="reviews-cta-actions">
              <button className="btn btn-primary btn-lg" onClick={handleDejarResena}>
                Dejar una Reseña
              </button>
            </div>
          </div>
        </div>
      </div>
      <ResenaModal 
        isOpen={isResenaModalOpen} 
        onClose={() => setIsResenaModalOpen(false)}
        onSubmit={handleSubmitResena}
      />
      
      <ResenaCompletaModal
        isOpen={isResenaCompletaModalOpen}
        onClose={() => {
          setIsResenaCompletaModalOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
      />
      
      {/* Notificación de éxito */}
      {showSuccessNotification && (
        <div className="resena-success-notification">
          <div className="resena-success-notification-content">
            <span className="resena-success-icon">✓</span>
            <span className="resena-success-message">Reseña enviada esperando aprobación</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;


