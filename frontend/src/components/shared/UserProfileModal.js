import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaLock, FaSignOutAlt, FaEye, FaEyeSlash, FaTrash, FaHistory } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import './UserProfileModal.css';

const formatFecha = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resetear estado cuando el modal se abre o cierra
  useEffect(() => {
    if (isOpen) {
      setShowChangePassword(false);
      setShowHistorial(false);
      setShowDeleteConfirm(false);
      setPasswordData({ currentPassword: '', newPassword: '', repeatPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowRepeatPassword(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleVerHistorial = async () => {
    setShowHistorial(true);
    setLoadingHistorial(true);
    setError('');
    try {
      const res = await authService.getMiHistorial(user?.email);
      setHistorial(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar historial');
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    logout();
    onClose();
    // Redirigir a la página principal de Maucci
    navigate('/', { replace: true });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.repeatPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la contraseña actual');
      return;
    }

    setIsLoading(true);
    try {
      if (!user || !user.email) {
        setError('No se pudo identificar al usuario');
        return;
      }

      const response = await authService.changePassword(
        user.email,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setSuccess(response.message || 'Cambio de contraseña exitoso');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', repeatPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowRepeatPassword(false);
        setSuccess('');
        setError('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleClose = () => {
    setShowChangePassword(false);
    setShowDeleteConfirm(false);
    setPasswordData({ currentPassword: '', newPassword: '', repeatPassword: '' });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowRepeatPassword(false);
    setError('');
    setSuccess('');
    onClose();
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmarEliminarCuenta = async () => {
    if (!user || !user.email) return;
    
    setIsDeleting(true);
    setError('');
    try {
      await authService.deleteAccount(user.email);
      // Cerrar sesión después de eliminar la cuenta
      logout();
      onClose();
      // Redirigir a la página principal de Maucci
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al eliminar la cuenta');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelarEliminarCuenta = () => {
    setShowDeleteConfirm(false);
  };

  const modalContent = (
    <div className="user-profile-modal-overlay" onClick={handleClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-profile-modal-close" onClick={handleClose}>
          <FaTimes />
        </button>

        {!showChangePassword ? (
          <>
            <div className="user-profile-header user-profile-header-with-icon">
              <button
                type="button"
                className="user-profile-historial-btn"
                onClick={handleVerHistorial}
                title="Historial de turnos"
                aria-label="Ver historial de turnos"
              >
                <FaHistory className="user-profile-historial-icon" />
              </button>
              <h2>Mi Perfil</h2>
              <span className="user-profile-header-spacer" />
            </div>

            {!showHistorial ? (
            <div className="user-profile-content">
              <div className="user-info">
                <p className="user-email-label">Sesión iniciada con el mail:</p>
                <p className="user-email">{user.email}</p>
              </div>

              <div className="user-profile-actions">
                <button
                  className="profile-action-btn change-password-btn"
                  onClick={() => {
                    setShowChangePassword(true);
                    setError('');
                    setSuccess('');
                    setPasswordData({ currentPassword: '', newPassword: '', repeatPassword: '' });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowRepeatPassword(false);
                  }}
                >
                  <FaLock className="btn-icon" />
                  Cambiar contraseña
                </button>

                <button
                  className="profile-action-btn logout-btn"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="btn-icon" />
                  Cerrar sesión
                </button>

                <button
                  className="profile-action-btn delete-account-btn"
                  onClick={handleDeleteAccount}
                >
                  <FaTrash className="btn-icon" />
                  Eliminar cuenta
                </button>
              </div>
            </div>
            ) : (
            <div className="user-profile-content">
              <h3 className="user-historial-title">Historial de turnos</h3>
              {error && <div className="profile-message error">{error}</div>}
              {loadingHistorial ? (
                <p className="user-historial-loading">Cargando...</p>
              ) : historial.length === 0 ? (
                <p className="user-historial-empty">No tenés turnos registrados.</p>
              ) : (
                <ul className="user-historial-list">
                  {historial.map((item) => (
                    <li key={item.id || `${item.establecimiento}-${item.fecha}-${item.hora}`} className="user-historial-item">
                      <span className="user-historial-establecimiento">{item.establecimiento || '—'}</span>
                      <span className="user-historial-fecha">{formatFecha(item.fecha)} {item.hora || ''}</span>
                      <span className="user-historial-servicio">{item.servicioNombre || '—'}</span>
                      <span className="user-historial-profesional">{item.profesionalNombre || '—'}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="profile-action-btn logout-btn user-historial-volver"
                onClick={() => setShowHistorial(false)}
              >
                Volver
              </button>
            </div>
            )}
          </>
        ) : (
          <>
            <div className="user-profile-header">
              <h2>Cambiar Contraseña</h2>
            </div>

            <div className="user-profile-content">
              {error && <div className="profile-message error">{error}</div>}
              {success && <div className="profile-message success">{success}</div>}

              <form onSubmit={handleChangePassword} className="change-password-form">
                <div className="profile-field">
                  <label htmlFor="currentPassword">Contraseña actual</label>
                  <div className="profile-input-wrapper password-input-wrapper">
                    {/* Input oculto para confundir al navegador */}
                    <input
                      type="password"
                      name="fake-current-password"
                      autoComplete="off"
                      tabIndex="-1"
                      style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                      readOnly
                    />
                    <input
                      type="text"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className={`profile-input password-input ${!showCurrentPassword ? 'password-hidden' : ''}`}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                    />
                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isLoading}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="newPassword">Nueva contraseña</label>
                  <div className="profile-input-wrapper password-input-wrapper">
                    {/* Input oculto para confundir al navegador */}
                    <input
                      type="password"
                      name="fake-new-password"
                      autoComplete="off"
                      tabIndex="-1"
                      style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                      readOnly
                    />
                    <input
                      type="text"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className={`profile-input password-input ${!showNewPassword ? 'password-hidden' : ''}`}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                    />
                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="repeatPassword">Repetir nueva contraseña</label>
                  <div className="profile-input-wrapper password-input-wrapper">
                    {/* Input oculto para confundir al navegador */}
                    <input
                      type="password"
                      name="fake-repeat-password"
                      autoComplete="off"
                      tabIndex="-1"
                      style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                      readOnly
                    />
                    <input
                      type="text"
                      id="repeatPassword"
                      name="repeatPassword"
                      value={passwordData.repeatPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className={`profile-input password-input ${!showRepeatPassword ? 'password-hidden' : ''}`}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                    />
                    <button
                      type="button"
                      className="profile-password-toggle"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      disabled={isLoading}
                    >
                      {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="change-password-actions">
                  <button
                    type="button"
                    className="profile-action-btn cancel-btn"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', repeatPassword: '' });
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowRepeatPassword(false);
                      setError('');
                      setSuccess('');
                      // No cerrar el modal, solo volver a la vista principal
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="profile-action-btn submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteConfirm && (
        <div className="user-delete-modal-overlay" onClick={cancelarEliminarCuenta}>
          <div className="user-delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="user-delete-modal-title">¿Estás seguro de que quieres eliminar tu cuenta?</h3>
            <p className="user-delete-modal-message">Esta acción no se puede deshacer. Se eliminarán todos tus datos y reservas asociadas.</p>
            {error && <div className="profile-message error">{error}</div>}
            <div className="user-delete-modal-actions">
              <button
                className="btn-user-delete btn-user-delete-cancel"
                onClick={cancelarEliminarCuenta}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="btn-user-delete btn-user-delete-confirm"
                onClick={confirmarEliminarCuenta}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UserProfileModal;

