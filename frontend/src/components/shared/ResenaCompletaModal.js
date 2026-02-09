import React from 'react';
import { FaStar, FaQuoteLeft, FaQuoteRight, FaTimes } from 'react-icons/fa';
import './ResenaCompletaModal.css';

const ResenaCompletaModal = ({ isOpen, onClose, review }) => {
  if (!isOpen || !review) return null;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar 
        key={index} 
        className={`star ${index < rating ? 'filled' : 'empty'}`} 
      />
    ));
  };

  return (
    <div className="resena-modal-overlay" onClick={onClose}>
      <div className="resena-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="resena-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="resena-modal-header">
          <div className="resena-modal-user-info">
            <div className="resena-modal-user-details">
              <h3 className="resena-modal-name">{review.name}</h3>
              <div className="resena-modal-date">
                {review.date} a las {review.time}
              </div>
            </div>
          </div>
          
          <div className="resena-modal-rating">
            {renderStars(review.rating)}
          </div>
        </div>
        
        <div className="resena-modal-body">
          <FaQuoteLeft className="resena-modal-quote-icon resena-modal-quote-icon-left" />
          <p className="resena-modal-text">{review.comment}</p>
          <FaQuoteRight className="resena-modal-quote-icon resena-modal-quote-icon-right" />
        </div>
      </div>
    </div>
  );
};

export default ResenaCompletaModal;

