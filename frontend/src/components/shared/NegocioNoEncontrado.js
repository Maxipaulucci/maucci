import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import './NegocioNoEncontrado.css';

const NegocioNoEncontrado = ({ email, nombreNegocio }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await authService.deleteAccount(email);
      // Cerrar sesión después de eliminar la cuenta
      logout();
      // Redirigir a la página principal de Maucci
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al eliminar la cuenta');
      setIsDeleting(false);
    }
  };

  return (
    <div className="negocio-no-encontrado-container">
      <div className="negocio-no-encontrado-content">
        {!showDeleteConfirm ? (
          <>
            <div className="negocio-no-encontrado-icon">⚠️</div>
            <h1 className="negocio-no-encontrado-title">Negocio no encontrado</h1>
            <p className="negocio-no-encontrado-message">
              Negocio: <strong>"{nombreNegocio || 'No especificado'}"</strong> asociado al mail: <strong>"{email}"</strong> no encontrado en la base de datos.
            </p>
            <p className="negocio-no-encontrado-contact">
              Si quieres tener tu negocio dentro de la aplicación ponte en contacto con nosotros!
            </p>
            <div className="negocio-no-encontrado-buttons">
              <button 
                className="negocio-no-encontrado-btn"
                onClick={() => {
                  logout();
                  navigate('/', { replace: true });
                }}
              >
                Cerrar sesión
              </button>
              <button 
                className="negocio-no-encontrado-btn-delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar cuenta
              </button>
            </div>
          </>
        ) : (
          <div className="negocio-no-encontrado-confirm">
            <h2 className="negocio-no-encontrado-confirm-title">
              ¿Seguro que quieres eliminar tu cuenta?
            </h2>
            <p className="negocio-no-encontrado-confirm-message">
              Esto habilitará nuevamente el registro con el mail: <strong>"{email}"</strong>
            </p>
            {error && (
              <p className="negocio-no-encontrado-error">{error}</p>
            )}
            <div className="negocio-no-encontrado-confirm-buttons">
              <button 
                className="negocio-no-encontrado-btn-confirm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Confirmar'}
              </button>
              <button 
                className="negocio-no-encontrado-btn-cancel"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError('');
                }}
                disabled={isDeleting}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NegocioNoEncontrado;


