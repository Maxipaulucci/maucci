import React, { useState } from 'react';
import './CancelarTurnoModal.css';

const CancelarTurnoModal = ({ isOpen, onClose, reserva, onConfirm }) => {
  const [nota, setNota] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !reserva) return null;

  const nombreCliente = reserva.usuarioNombre || reserva.usuarioApellido
    ? `${reserva.usuarioNombre || ''} ${reserva.usuarioApellido || ''}`.trim()
    : reserva.usuarioEmail;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(nota.trim() || null, setIsLoading);
      setNota('');
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNota('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content cancelar-turno-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>¿Seguro que deseas cancelar el turno al cliente {nombreCliente}?</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Información del turno */}
          <div className="reserva-info-modal">
            <div className="reserva-campo-modal">
              <span className="reserva-label-modal">Horario:</span>
              <span className="reserva-valor-modal">{reserva.hora}</span>
            </div>
            <div className="reserva-campo-modal">
              <span className="reserva-label-modal">Servicio:</span>
              <span className="reserva-valor-modal">{reserva.servicio?.name || 'N/A'}</span>
            </div>
            <div className="reserva-campo-modal">
              <span className="reserva-label-modal">Email:</span>
              <span className="reserva-valor-modal">{reserva.usuarioEmail}</span>
            </div>
            <div className="reserva-campo-modal">
              <span className="reserva-label-modal">Nombre:</span>
              <span className="reserva-valor-modal">{nombreCliente}</span>
            </div>
            {reserva.notas && reserva.notas.trim() !== '' && (
              <div className="reserva-campo-modal">
                <span className="reserva-label-modal">Nota original:</span>
                <span className="reserva-valor-modal">{reserva.notas}</span>
              </div>
            )}
          </div>

          {/* Campo para nota de cancelación */}
          <div className="nota-cancelacion">
            <label htmlFor="nota-cancelacion">Nota de cancelación (opcional):</label>
            <textarea
              id="nota-cancelacion"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Escribe una nota explicando la razón de la cancelación..."
              rows="4"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancelar" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirmar-cancelar" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        </div>
        
        {isLoading && (
          <div className="modal-loading-overlay">
            <div className="modal-loading-spinner"></div>
            <p>Cancelando turno...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelarTurnoModal;

