import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaHistory, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './TurnosInfoTip.css';

const TurnosInfoTip = () => {
  const { user } = useAuth();
  const [showTip, setShowTip] = useState(false);

  // Solo para clientes en la web pública; no en panel de negocio ni superadmin
  const esAdminOSuperAdmin =
    user?.rol === 'admin' || user?.isSuperAdmin === true;

  if (!user || esAdminOSuperAdmin) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="turnos-info-tip-btn"
        onClick={() => setShowTip(true)}
        aria-label="Información sobre gestión de turnos"
        title="Información"
      >
        <FaInfoCircle className="turnos-info-tip-icon" aria-hidden="true" />
      </button>

      {showTip && (
        <div
          className="turnos-info-tip-overlay"
          onClick={() => setShowTip(false)}
          role="presentation"
        >
          <div
            className="turnos-info-tip-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="turnos-info-tip-title"
          >
            <h3 id="turnos-info-tip-title" className="turnos-info-tip-title">
              Gestión de turnos
            </h3>
            <p className="turnos-info-tip-message">
              Podrás gestionar tus turnos desde tu perfil a través del logo{' '}
              <span className="turnos-info-tip-historial" aria-label="historial">
                <FaHistory className="turnos-info-tip-historial-icon" aria-hidden="true" />
              </span>
              .
            </p>
            <div className="turnos-info-tip-actions">
              <button
                type="button"
                className="turnos-info-tip-entendido"
                onClick={() => setShowTip(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default TurnosInfoTip;
