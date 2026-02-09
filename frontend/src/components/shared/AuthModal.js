import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTimes, FaKey } from 'react-icons/fa';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, setNegocioNoEncontradoState } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' o 'register'
  const [tipoRegistro, setTipoRegistro] = useState(null); // null, 'usuario' o 'negocio'
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatNewPassword, setShowRepeatNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false); // true si es recuperación de contraseña
  const [showForgotPasswordEmail, setShowForgotPasswordEmail] = useState(false); // mostrar campo de email para recuperación
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false); // mostrar modal de cambio de contraseña
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verifiedCode, setVerifiedCode] = useState(''); // código verificado para usar en reset
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nombreNegocio: '',
    email: '',
    password: '',
    repeatPassword: '',
    codigoVerificacion: ''
  });

  // Limpiar el estado cuando el modal se abre o cierra
  useEffect(() => {
    if (isOpen) {
      // Resetear todo cuando se abre el modal
      setFormData({
        nombre: '',
        apellido: '',
        nombreNegocio: '',
        email: '',
        password: '',
        repeatPassword: '',
        codigoVerificacion: ''
      });
      setError('');
      setSuccess('');
      setNeedsVerification(false);
      setIsPasswordReset(false);
      setShowForgotPasswordEmail(false);
      setShowResetPasswordModal(false);
      setVerificationEmail('');
      setVerifiedCode('');
      setShowPassword(false);
      setShowRepeatPassword(false);
      setShowNewPassword(false);
      setShowRepeatNewPassword(false);
      setActiveTab('login');
      setTipoRegistro(null);
      
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body cuando el modal se cierra
      document.body.style.overflow = '';
    }
    
    // Cleanup: restaurar scroll al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Función para normalizar nombre/apellido: primera letra mayúscula, resto minúscula
  const normalizarNombre = (texto) => {
    if (!texto || texto.trim().length === 0) return texto;
    const textoTrimmed = texto.trim();
    return textoTrimmed.charAt(0).toUpperCase() + textoTrimmed.slice(1).toLowerCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores al escribir
    if (error) setError('');
  };

  // Normalizar nombre/apellido cuando el campo pierde el foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'nombre' || name === 'apellido') {
      const normalizedValue = normalizarNombre(value);
      setFormData(prev => ({
        ...prev,
        [name]: normalizedValue
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tipoRegistro) {
      setError('Por favor selecciona un tipo de registro');
      return;
    }

    if (formData.password !== formData.repeatPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.nombre || !formData.apellido) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Validar nombre del negocio si el tipo de registro es 'negocio'
    if (tipoRegistro === 'negocio' && !formData.nombreNegocio) {
      setError('Por favor ingresa el nombre del negocio');
      return;
    }

    setIsLoading(true);
    try {
      // Normalizar nombre y apellido antes de enviar (por si acaso)
      const nombreNormalizado = normalizarNombre(formData.nombre);
      const apellidoNormalizado = normalizarNombre(formData.apellido);
      
      const response = await authService.register(
        nombreNormalizado, 
        apellidoNormalizado, 
        formData.email, 
        formData.password,
        tipoRegistro,
        tipoRegistro === 'negocio' ? formData.nombreNegocio : null
      );
      setSuccess(response.message);
      setNeedsVerification(true);
      setVerificationEmail(formData.email);
      // Limpiar contraseñas pero mantener el email
      setFormData(prev => ({
        ...prev,
        password: '',
        repeatPassword: ''
      }));
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Verificar si la respuesta indica que el negocio no fue encontrado
      if (response.data && response.data.negocioNoEncontrado) {
        // Establecer el estado de negocio no encontrado
        setNegocioNoEncontradoState({
          email: response.data.email,
          nombreNegocio: response.data.nombreNegocio
        });
        // Cerrar el modal
        onClose();
        return;
      }
      
      setSuccess(response.message);
      // Guardar el usuario en el contexto y cerrar modal
      login(formData.email, response.data?.rol, response.data?.nombreNegocio);
      
      // Si es admin, redirigir directamente a inicio
      if (response.data?.rol === 'admin') {
        onClose();
        // Redirigir inmediatamente usando navigate para evitar recarga completa
        navigate('/negocio/inicio', { replace: true });
      } else {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      // Verificar si el error contiene información de negocio no encontrado
      if (err.data && err.data.negocioNoEncontrado) {
        setNegocioNoEncontradoState({
          email: err.data.email,
          nombreNegocio: err.data.nombreNegocio
        });
        onClose();
        return;
      }
      
      setError(err.message || 'Error al iniciar sesión');
      // Si requiere verificación, mostrar opción para verificar
      if (err.message && err.message.includes('verifica tu email')) {
        setNeedsVerification(true);
        setVerificationEmail(formData.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Mostrar el formulario para ingresar email
    setShowForgotPasswordEmail(true);
    setError('');
    setSuccess('');
    setFormData(prev => ({
      ...prev,
      email: '',
      password: '',
      repeatPassword: '',
      codigoVerificacion: ''
    }));
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.forgotPassword(formData.email);
      setSuccess(response.message);
      setShowForgotPasswordEmail(false);
      setNeedsVerification(true);
      setIsPasswordReset(true);
      setVerificationEmail(formData.email);
      setFormData(prev => ({
        ...prev,
        codigoVerificacion: '',
        password: '',
        repeatPassword: ''
      }));
    } catch (err) {
      setError(err.message || 'Error al enviar código de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.codigoVerificacion || formData.codigoVerificacion.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      if (isPasswordReset) {
        // Si es recuperación de contraseña, usar el endpoint específico para verificar el código
        // Este endpoint no verifica si el email está verificado, solo valida el código
        try {
          await authService.verifyPasswordResetCode(verificationEmail, formData.codigoVerificacion);
          // Guardar el código verificado y cerrar este modal para abrir el de cambio de contraseña
          setVerifiedCode(formData.codigoVerificacion);
          // Cerrar el modal actual
          setNeedsVerification(false);
          setIsPasswordReset(false);
          setShowForgotPasswordEmail(false);
          setError('');
          setSuccess('');
          setFormData({
            nombre: '',
            apellido: '',
            nombreNegocio: '',
            email: '',
            password: '',
            repeatPassword: '',
            codigoVerificacion: ''
          });
          // Abrir el nuevo modal de cambio de contraseña
          setShowResetPasswordModal(true);
        } catch (verifyErr) {
          // Si falla la verificación, mostrar error
          throw verifyErr;
        }
      } else {
        // Verificación normal de email
        const response = await authService.verifyEmail(verificationEmail, formData.codigoVerificacion);
        setSuccess(response.message);
        // Después de verificar, cambiar a la pestaña de login (NO iniciar sesión automáticamente)
        setNeedsVerification(false);
        setIsPasswordReset(false);
        setActiveTab('login');
        setFormData({
          nombre: '',
          apellido: '',
          nombreNegocio: '',
          email: verificationEmail,
          password: '',
          repeatPassword: '',
          codigoVerificacion: ''
        });
      }
    } catch (err) {
      setError(err.message || 'Error al verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.password || !formData.repeatPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.repeatPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(
        verificationEmail,
        verifiedCode,
        formData.password
      );
      setSuccess(response.message);
      // Después de restablecer, cerrar el modal y volver al login
      setTimeout(() => {
        setShowResetPasswordModal(false);
        setNeedsVerification(false);
        setIsPasswordReset(false);
        setActiveTab('login');
        setFormData({
          nombre: '',
          apellido: '',
          nombreNegocio: '',
          email: verificationEmail,
          password: '',
          repeatPassword: '',
          codigoVerificacion: ''
        });
        setShowNewPassword(false);
        setShowRepeatNewPassword(false);
        setVerifiedCode('');
        setVerificationEmail('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');

    setIsLoading(true);
    try {
      if (isPasswordReset) {
        // Si es recuperación, usar el endpoint de forgot-password
        const response = await authService.forgotPassword(verificationEmail);
        setSuccess(response.message);
      } else {
        // Reenvío normal de código de verificación
        const response = await authService.resendCode(verificationEmail);
        setSuccess(response.message);
      }
    } catch (err) {
      setError(err.message || 'Error al reenviar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (showResetPasswordModal) {
      // Si estamos en el modal de cambio de contraseña
      handleResetPassword(e);
    } else if (needsVerification) {
      // Verificar código
      handleVerifyEmail(e);
    } else if (activeTab === 'register') {
      handleRegister(e);
    } else {
      handleLogin(e);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTipoRegistro(null);
    setNeedsVerification(false);
    setIsPasswordReset(false);
    setShowForgotPasswordEmail(false);
    setError('');
    setSuccess('');
    setFormData({ nombre: '', apellido: '', nombreNegocio: '', email: '', password: '', repeatPassword: '', codigoVerificacion: '' });
    setShowPassword(false);
    setShowRepeatPassword(false);
    setShowNewPassword(false);
    setShowRepeatNewPassword(false);
  };

  const handleClose = () => {
    setNeedsVerification(false);
    setIsPasswordReset(false);
    setShowForgotPasswordEmail(false);
    setShowResetPasswordModal(false);
    setVerifiedCode('');
    setError('');
    setSuccess('');
    setFormData({ nombre: '', apellido: '', nombreNegocio: '', email: '', password: '', repeatPassword: '', codigoVerificacion: '' });
    setShowPassword(false);
    setShowRepeatPassword(false);
    setShowNewPassword(false);
    setShowRepeatNewPassword(false);
    onClose();
  };

  // Manejar el scroll de la rueda del mouse dentro del modal
  const handleWheel = (e) => {
    // Siempre prevenir el scroll del body cuando estamos sobre el modal
    e.stopPropagation();
    
    const modal = e.currentTarget.closest('.auth-modal');
    if (!modal) return;
    
    const form = modal.querySelector('.auth-form');
    if (!form) return;
    
    const { scrollTop, scrollHeight, clientHeight } = form;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px de tolerancia
    
    // Si está en el top y scrolleando hacia arriba, prevenir
    if (isAtTop && e.deltaY < 0) {
      e.preventDefault();
      return;
    }
    
    // Si está en el bottom y scrolleando hacia abajo, prevenir
    if (isAtBottom && e.deltaY > 0) {
      e.preventDefault();
      return;
    }
    
    // Si el formulario no necesita scroll, prevenir
    if (scrollHeight <= clientHeight) {
      e.preventDefault();
      return;
    }
  };

  // Si estamos en el modal de cambio de contraseña, mostrar ese modal
  if (showResetPasswordModal) {
    const resetPasswordModalContent = (
      <div className="auth-modal-overlay" onClick={handleClose} onWheel={handleWheel}>
        <div className="auth-modal" onClick={(e) => e.stopPropagation()} onWheel={handleWheel} onWheelCapture={handleWheel}>
          <button className="auth-modal-close" onClick={handleClose}>
            <FaTimes />
          </button>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="auth-message auth-message-error">
              {error}
            </div>
          )}
          {success && (
            <div className="auth-message auth-message-success">
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-verification-header">
              <h3>Cambiar contraseña</h3>
              <p>Ingresa tu nueva contraseña</p>
            </div>

            <div className="auth-field">
              <label htmlFor="newPasswordReset">Nueva contraseña:</label>
              <div className="auth-input-wrapper password-input-wrapper">
                <input
                  type="password"
                  name="fake-new-password-reset"
                  autoComplete="off"
                  tabIndex="-1"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                  readOnly
                />
                <input
                  type="text"
                  id="newPasswordReset"
                  name="password"
                  placeholder="Nueva contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`auth-input-no-icon password-input ${!showNewPassword ? 'password-hidden' : ''}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-bwignore="true"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="repeatNewPasswordReset">Repita su nueva contraseña:</label>
              <div className="auth-input-wrapper password-input-wrapper">
                <input
                  type="password"
                  name="fake-repeat-new-password-reset"
                  autoComplete="off"
                  tabIndex="-1"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                  readOnly
                />
                <input
                  type="text"
                  id="repeatNewPasswordReset"
                  name="repeatPassword"
                  placeholder="Repite la nueva contraseña"
                  value={formData.repeatPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`auth-input-no-icon password-input ${!showRepeatNewPassword ? 'password-hidden' : ''}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-bwignore="true"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowRepeatNewPassword(!showRepeatNewPassword)}
                  disabled={isLoading}
                >
                  {showRepeatNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>
          </form>
        </div>
      </div>
    );

    return createPortal(resetPasswordModalContent, document.body);
  }

  const modalContent = (
    <div className="auth-modal-overlay" onClick={handleClose} onWheel={handleWheel}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()} onWheel={handleWheel} onWheelCapture={handleWheel}>
        <button className="auth-modal-close" onClick={handleClose}>
          <FaTimes />
        </button>
        
        {/* Pestañas - Solo mostrar si no está en modo verificación ni en recuperación de contraseña */}
        {!needsVerification && !showForgotPasswordEmail && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => handleTabChange('register')}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="auth-message auth-message-error">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-message auth-message-success">
            {success}
          </div>
        )}

        {/* Formulario para ingresar email (recuperación de contraseña) */}
        {showForgotPasswordEmail ? (
          <form className="auth-form" onSubmit={handleForgotPasswordSubmit}>
            <div className="auth-verification-header">
              <h3>Ingresa tu mail</h3>
            </div>

            <div className="auth-field">
              <label htmlFor="forgotPasswordEmail">Email</label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="text"
                  id="forgotPasswordEmail"
                  name="email"
                  placeholder="ejemplo@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-bwignore="true"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar código'}
            </button>

            <div className="auth-back-to-login">
              <button
                type="button"
                className="auth-back-btn"
                onClick={() => {
                  setShowForgotPasswordEmail(false);
                  setError('');
                  setSuccess('');
                  setFormData(prev => ({
                    ...prev,
                    email: ''
                  }));
                }}
                disabled={isLoading}
              >
                Volver a iniciar sesión
              </button>
            </div>
          </form>
        ) : needsVerification ? (
          /* Formulario de verificación */
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-verification-header">
              <h3>{isPasswordReset ? 'Recuperar contraseña' : 'Verifica tu email'}</h3>
              <p>{isPasswordReset ? 'Hemos enviado un código de recuperación a:' : 'Hemos enviado un código de verificación a:'}</p>
              <p className="auth-verification-email">{verificationEmail}</p>
            </div>

            <div className="auth-field">
              <label htmlFor="codigoVerificacion">Código de verificación</label>
              <div className="auth-input-wrapper">
                <FaKey className="auth-input-icon" />
                <input
                  type="text"
                  id="codigoVerificacion"
                  name="codigoVerificacion"
                  placeholder="000000"
                  value={formData.codigoVerificacion}
                  onChange={handleInputChange}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  disabled={isPasswordReset && formData.password && formData.repeatPassword}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar'}
            </button>

            <div className="auth-resend-code">
              <p>¿No recibiste el código?</p>
              <button
                type="button"
                className="auth-resend-btn"
                onClick={isPasswordReset ? handleForgotPassword : handleResendCode}
                disabled={isLoading}
              >
                Reenviar código
              </button>
            </div>
          </form>
        ) : (
          /* Formulario normal (login/register) */
          <form className={`auth-form ${activeTab === 'register' ? 'auth-form-scrollable' : ''}`} onSubmit={handleSubmit}>
            {/* Opciones de tipo de registro (solo visible en registro) */}
            {activeTab === 'register' && !tipoRegistro && (
              <>
                {/* Espaciador antes de las opciones para igualar altura con login */}
                <div style={{ height: '180px' }}></div>
                
                <div className="auth-register-options">
                  <div className="auth-register-options-buttons">
                    <button
                      type="button"
                      className="auth-register-option-btn"
                      onClick={() => setTipoRegistro('usuario')}
                    >
                      Registrar usuario
                    </button>
                    <button
                      type="button"
                      className="auth-register-option-btn"
                      onClick={() => setTipoRegistro('negocio')}
                    >
                      Registrar negocio
                    </button>
                  </div>
                </div>

                {/* Espaciador después de las opciones para igualar altura con login */}
                <div style={{ height: '180px' }}></div>
              </>
            )}

            {/* Formulario completo (solo visible en login o cuando se seleccionó tipo de registro) */}
            {(activeTab === 'login' || (activeTab === 'register' && tipoRegistro)) && (
              <>
                {/* Nombre y Apellido (solo visible en registro cuando se seleccionó tipo) */}
                {activeTab === 'register' && tipoRegistro && (
                  <>
                    <div className="auth-field">
                      <label htmlFor="nombre">Nombre</label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          placeholder="Tu nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          disabled={isLoading}
                          className="auth-input-no-icon"
                          autoComplete="off"
                          autoCapitalize="words"
                          autoCorrect="off"
                          spellCheck="false"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
                          data-bwignore="true"
                        />
                      </div>
                    </div>

                    <div className="auth-field">
                      <label htmlFor="apellido">Apellido</label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          id="apellido"
                          name="apellido"
                          placeholder="Tu apellido"
                          value={formData.apellido}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          disabled={isLoading}
                          className="auth-input-no-icon"
                          autoComplete="off"
                          autoCapitalize="words"
                          autoCorrect="off"
                          spellCheck="false"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
                          data-bwignore="true"
                        />
                      </div>
                    </div>

                    {/* Nombre del negocio (solo visible cuando tipoRegistro es 'negocio') */}
                    {tipoRegistro === 'negocio' && (
                      <div className="auth-field">
                        <label htmlFor="nombreNegocio">Nombre del negocio</label>
                        <div className="auth-input-wrapper">
                          <input
                            type="text"
                            id="nombreNegocio"
                            name="nombreNegocio"
                            placeholder="Nombre del negocio"
                            value={formData.nombreNegocio}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className="auth-input-no-icon"
                            autoComplete="off"
                            autoCapitalize="words"
                            autoCorrect="off"
                            spellCheck="false"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-form-type="other"
                            data-bwignore="true"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Email */}
                <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="auth-input-icon" />
                {/* Input oculto para confundir al navegador */}
                <input
                  type="text"
                  name="fake-email"
                  autoComplete="off"
                  tabIndex="-1"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                  readOnly
                />
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="ejemplo@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-bwignore="true"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="auth-field">
              <label htmlFor="password">Contraseña</label>
              <div className="auth-input-wrapper password-input-wrapper">
                {/* Input oculto para confundir al navegador */}
                <input
                  type="password"
                  name="fake-password"
                  autoComplete="off"
                  tabIndex="-1"
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                  readOnly
                />
                <input
                  type="text"
                  id="password"
                  name="password"
                  placeholder={activeTab === 'login' ? 'Tu contraseña' : 'Crea una contraseña'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`auth-input-no-icon password-input ${!showPassword ? 'password-hidden' : ''}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-bwignore="true"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

                {/* Repetir contraseña (solo visible en registro) */}
                {activeTab === 'register' && (
                  <div className="auth-field">
                    <label htmlFor="repeatPassword">Repetir contraseña</label>
                    <div className="auth-input-wrapper password-input-wrapper">
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
                        placeholder="Repite la contraseña"
                        value={formData.repeatPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className={`auth-input-no-icon password-input ${!showRepeatPassword ? 'password-hidden' : ''}`}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        data-bwignore="true"
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        disabled={isLoading}
                      >
                        {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Espaciador fijo antes del botón en login para empujarlo hacia abajo */}
                {activeTab === 'login' && <div style={{ height: '180px' }}></div>}

                {/* Contenedor para texto y botón en login */}
                {activeTab === 'login' && !needsVerification && !showForgotPasswordEmail ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '0' }}>
                      {/* Texto "¿Olvidaste tu contraseña?" solo en login */}
                      <p 
                        className="auth-forgot-password"
                        onClick={handleForgotPassword}
                        style={{ 
                          cursor: 'pointer', 
                          color: '#6b7280', 
                          fontStyle: 'italic',
                          fontSize: '0.875rem',
                          textAlign: 'left',
                          marginBottom: '0',
                          marginTop: '0',
                          paddingLeft: '0',
                          paddingBottom: '0'
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </p>

                      {/* Botón de envío */}
                      <button 
                        type="submit" 
                        className={`auth-submit-btn ${activeTab === 'login' ? 'auth-submit-btn-login' : ''}`}
                        disabled={isLoading}
                        style={{ marginTop: '0' }}
                      >
                        {isLoading 
                          ? (activeTab === 'login' ? 'Iniciando sesión...' : 'Registrando...')
                          : (activeTab === 'login' ? 'Iniciar sesión' : 'Registrarse')
                        }
                      </button>
                    </div>
                    {/* Espaciador después del botón para mantener la misma altura que registro */}
                    <div style={{ height: '180px' }}></div>
                  </>
                ) : (
                  <>
                    {/* Botón de envío para registro */}
                    <button 
                      type="submit" 
                      className={`auth-submit-btn ${activeTab === 'login' ? 'auth-submit-btn-login' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading 
                        ? (activeTab === 'login' ? 'Iniciando sesión...' : 'Registrando...')
                        : (activeTab === 'login' ? 'Iniciar sesión' : 'Registrarse')
                      }
                    </button>
                    {/* Espaciador después del botón para mantener la misma altura que registro */}
                    {activeTab === 'login' && <div style={{ height: '180px' }}></div>}
                  </>
                )}
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;

