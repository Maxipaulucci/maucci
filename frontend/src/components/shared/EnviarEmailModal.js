import React, { useState } from 'react';
import './EnviarEmailModal.css';

const EnviarEmailModal = ({ isOpen, onClose, reserva, onConfirm }) => {
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  if (!isOpen || !reserva) return null;

  const handleConfirm = () => {
    if (asunto.trim() && mensaje.trim()) {
      onConfirm(asunto.trim(), mensaje.trim());
      setAsunto('');
      setMensaje('');
    }
  };

  const handleClose = () => {
    setAsunto('');
    setMensaje('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content enviar-email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Enviando email a la dirección: {reserva.usuarioEmail}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="email-field">
            <label htmlFor="email-asunto">Asunto:</label>
            <input
              id="email-asunto"
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Escribe el asunto del email..."
            />
          </div>

          <div className="email-field">
            <label htmlFor="email-mensaje">Mensaje:</label>
            <textarea
              id="email-mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe el mensaje..."
              rows="8"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={handleClose}>
            Cancelar
          </button>
          <button 
            className="btn-confirmar-enviar" 
            onClick={handleConfirm}
            disabled={!asunto.trim() || !mensaje.trim()}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnviarEmailModal;






