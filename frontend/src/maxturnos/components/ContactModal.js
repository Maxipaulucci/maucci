import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContactModal } from '../context/ContactModalContext';
import { maxturnosInfo } from '../data/maxturnosData';
import './ContactModal.css';

const MAX_CHARS = 500;

const ContactModal = () => {
  const { isOpen, closeContactModal } = useContactModal();
  const { isAuthenticated } = useAuth();
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  if (!isOpen) return null;

  const asuntoTrim = asunto.trim();
  const mensajeTrim = mensaje.trim();
  const puedeEnviar = isAuthenticated() && asuntoTrim.length > 0 && mensajeTrim.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    const subject = encodeURIComponent(asuntoTrim);
    const body = encodeURIComponent(mensajeTrim);
    window.location.href = `mailto:${maxturnosInfo.email}?subject=${subject}&body=${body}`;
    setAsunto('');
    setMensaje('');
    closeContactModal();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeContactModal();
  };

  return (
    <div className="contact-modal-overlay" onClick={handleOverlayClick}>
      <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="contact-modal-header">
          <h2>Enviar consulta</h2>
          <button type="button" className="contact-modal-close" onClick={closeContactModal} aria-label="Cerrar">
            ×
          </button>
        </div>
        <p className="contact-modal-email-text">
          Enviar consulta al mail <strong>{maxturnosInfo.email}</strong>
        </p>
        <form onSubmit={handleSubmit} className="contact-modal-form">
          <input
            type="text"
            id="contacto-asunto"
            className="contact-modal-input"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Asunto"
            maxLength={200}
          />
          <label htmlFor="contacto-mensaje" className="contact-modal-label">
            Mensaje
          </label>
          <textarea
            id="contacto-mensaje"
            className="contact-modal-textarea"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Escribí tu mensaje aquí..."
            rows={5}
            maxLength={MAX_CHARS}
          />
          <div className="contact-modal-counter">
            {mensaje.length} / {MAX_CHARS} caracteres
          </div>
          {!isAuthenticated() && (
            <p className="contact-modal-error">
              Debes tener la sesión iniciada para contactarte
            </p>
          )}
          <div className="contact-modal-actions">
            <button type="button" className="contact-modal-btn-cancelar" onClick={closeContactModal}>
              Cancelar
            </button>
            <button
              type="submit"
              className="contact-modal-btn-enviar"
              disabled={!puedeEnviar}
            >
              Enviar consulta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
