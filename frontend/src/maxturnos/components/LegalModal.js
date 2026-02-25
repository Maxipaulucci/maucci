import React from 'react';
import { legalContent } from '../data/legalContent';
import './LegalModal.css';

const LegalModal = ({ type, onClose }) => {
  const item = legalContent[type];
  if (!item) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="legal-modal-overlay" onClick={handleOverlayClick}>
      <div className="legal-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <h2>{item.title}</h2>
          <button
            type="button"
            className="legal-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="legal-modal-body">
          {item.content}
        </div>
        <div className="legal-modal-footer">
          <button type="button" className="legal-modal-btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
