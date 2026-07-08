import React from 'react';
import { useServicesModal } from '../context/ServicesModalContext';
import './ServicesModal.css';

const SERVICIOS = [
  'Sistemas de Reservas',
  'Diseño Personalizado',
  'Gestión de Clientes',
  'Notificaciones',
  'Reportes y Estadísticas',
];

const ServicesModal = () => {
  const { isOpen, closeServicesModal } = useServicesModal();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeServicesModal();
  };

  return (
    <div className="services-modal-overlay" onClick={handleOverlayClick}>
      <div className="services-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="services-modal-header">
          <h2>Nuestros servicios</h2>
          <button type="button" className="services-modal-close" onClick={closeServicesModal} aria-label="Cerrar">
            ×
          </button>
        </div>
        <ul className="services-modal-list">
          {SERVICIOS.map((nombre) => (
            <li key={nombre} className="services-modal-item">
              {nombre}
            </li>
          ))}
        </ul>
        <div className="services-modal-actions">
          <button type="button" className="services-modal-btn-cerrar" onClick={closeServicesModal}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;
