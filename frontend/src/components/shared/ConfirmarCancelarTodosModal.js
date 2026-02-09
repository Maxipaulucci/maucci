import React from 'react';
import './ConfirmarCancelarTodosModal.css';

const ConfirmarCancelarTodosModal = ({ isOpen, onClose, onConfirm, cantidadTurnos, fecha }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    // Cerrar el modal inmediatamente y dejar que onConfirm procese en segundo plano
    onClose();
    // Llamar a onConfirm sin esperar (se procesará en segundo plano)
    onConfirm();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="confirmar-cancelar-todos-modal-overlay" onClick={handleClose}>
      <div className="confirmar-cancelar-todos-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirmar Cancelación</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="confirmacion-mensaje">
            <div className="icono-advertencia">
              ⚠️
            </div>
            <p className="mensaje-principal">
              ¿Estás seguro de que deseas cancelar todos los <strong>{cantidadTurnos} turno{cantidadTurnos > 1 ? 's' : ''}</strong> del día?
            </p>
            {fecha && (
              <p className="mensaje-fecha">
                {fecha}
              </p>
            )}
            <p className="mensaje-advertencia">
              Esta acción no se puede deshacer. Todos los turnos serán cancelados permanentemente.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancelar-modal" 
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirmar-cancelar-todos" 
            onClick={handleConfirm}
          >
            Confirmar Cancelación
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarCancelarTodosModal;

