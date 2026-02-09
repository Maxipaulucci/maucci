import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaStar } from 'react-icons/fa';
import './ResenaModal.css';

const ResenaModal = ({ isOpen, onClose, onSubmit }) => {
  const [resena, setResena] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const maxLength = 500;

  // Limpiar el estado cuando el modal se abre o cierra
  useEffect(() => {
    if (isOpen) {
      setResena('');
      setRating(0);
      setHoverRating(0);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (resena.length > maxLength) {
      setError(`La reseña no puede exceder ${maxLength} caracteres`);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(resena.trim(), rating);
      setResena('');
      setRating(0);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al enviar la reseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResena('');
    setRating(0);
    setHoverRating(0);
    setError('');
    onClose();
  };

  const modalContent = (
    <div className="resena-modal-overlay" onClick={handleClose}>
      <div className="resena-modal" onClick={(e) => e.stopPropagation()}>
        <button className="resena-modal-close" onClick={handleClose}>
          <FaTimes />
        </button>

        <h2 className="resena-modal-title">Dejar una reseña</h2>

        {error && (
          <div className="resena-message resena-message-error">
            {error}
          </div>
        )}

        <form className="resena-form" onSubmit={handleSubmit}>
          <div className="resena-rating-wrapper">
            <label className="resena-rating-label">Calificación</label>
            <div className="resena-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`resena-star ${
                    star <= (hoverRating || rating) ? 'filled' : 'empty'
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="resena-textarea-wrapper">
            <textarea
              className="resena-textarea"
              value={resena}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setResena(e.target.value);
                }
              }}
              placeholder="Escribe tu reseña aquí..."
              rows={8}
              maxLength={maxLength}
            />
            <div className="resena-char-count">
              {resena.length}/{maxLength}
            </div>
          </div>

          <div className="resena-form-actions">
            <button
              type="button"
              className="resena-btn resena-btn-cancel"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="resena-btn resena-btn-submit"
              disabled={isLoading || rating === 0}
            >
              {isLoading ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ResenaModal;

