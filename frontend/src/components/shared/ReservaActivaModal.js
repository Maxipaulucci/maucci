import React from 'react';
import './CancelarTurnoModal.css';
import './ReservaActivaModal.css';

const ReservaActivaModal = ({ isOpen, onClose, reservaActiva }) => {
  if (!isOpen) return null;

  const fechaTxt = (() => {
    if (!reservaActiva?.fecha) return '';
    try {
      const d = new Date(reservaActiva.fecha);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  })();

  return (
    <div className="modal-overlay reserva-activa-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content reserva-activa-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Advertencia de turno activo"
      >
        <button type="button" className="modal-close reserva-activa-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <div className="modal-body">
          <p className="reserva-activa-aviso">
            No podés reservar otro turno porque ya tenés uno activo.
            Cuando ese turno haya pasado, vas a poder reservar de nuevo.
          </p>
          {(fechaTxt || reservaActiva?.hora) && (
            <p className="reserva-activa-detalle">
              Tu turno activo
              {fechaTxt ? `: ${fechaTxt}` : ''}
              {reservaActiva?.hora ? ` a las ${reservaActiva.hora}` : ''}
              {reservaActiva?.establecimiento ? ` (${reservaActiva.establecimiento})` : ''}.
            </p>
          )}
          <p className="reserva-activa-hint">
            Podés seguir mirando la sección de reservas, pero no vas a poder confirmar una nueva.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservaActivaModal;
