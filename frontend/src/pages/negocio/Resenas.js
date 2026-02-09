import React, { useState, useEffect } from 'react';
import { FaStar, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { resenasService, negociosService } from '../../services/api';
import './NegocioPage.css';

const Resenas = () => {
  const { user } = useAuth();
  // Código del negocio - usar directamente barberia_clasica
  const establecimiento = 'barberia_clasica';
  const [resenas, setResenas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resenaToDelete, setResenaToDelete] = useState(null);
  const [ordenResenas, setOrdenResenas] = useState('reciente-antigua');
  const [isLoadingOrden, setIsLoadingOrden] = useState(false);

  useEffect(() => {
    cargarResenas();
    cargarOrdenResenas();
  }, []);

  const cargarOrdenResenas = async () => {
    try {
      const response = await negociosService.obtenerNegocio(establecimiento);
      if (response.data && response.data.ordenResenas) {
        setOrdenResenas(response.data.ordenResenas);
      }
    } catch (err) {
      console.error('Error al cargar ordenamiento de reseñas:', err);
      // Si hay error, usar el valor por defecto
    }
  };

  const handleCambiarOrdenResenas = async (nuevoOrden) => {
    setIsLoadingOrden(true);
    setError('');
    try {
      await negociosService.actualizarOrdenResenas(establecimiento, nuevoOrden);
      setOrdenResenas(nuevoOrden);
    } catch (err) {
      setError(err.message || 'Error al actualizar ordenamiento de reseñas');
    } finally {
      setIsLoadingOrden(false);
    }
  };

  const cargarResenas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await resenasService.obtenerResenasPorNegocio(establecimiento);
      const resenasData = response.data || [];
      console.log('Reseñas cargadas:', resenasData);
      // Log para verificar que tienen nombre y apellido
      resenasData.forEach((resena, index) => {
        console.log(`Reseña ${index + 1}:`, {
          id: resena.id,
          email: resena.usuarioEmail,
          nombre: resena.usuarioNombre,
          apellido: resena.usuarioApellido
        });
      });
      setResenas(resenasData);
    } catch (err) {
      setError(err.message || 'Error al cargar reseñas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAprobarResena = async (id, aprobar) => {
    try {
      await resenasService.aprobarResena(id, aprobar, establecimiento);
      await cargarResenas(); // Recargar las reseñas
    } catch (err) {
      setError(err.message || 'Error al actualizar reseña');
    }
  };

  const handleEliminarResena = (id) => {
    setResenaToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmarEliminarResena = async () => {
    if (!resenaToDelete) return;
    
    try {
      await resenasService.eliminarResena(resenaToDelete, establecimiento);
      await cargarResenas(); // Recargar las reseñas
      setShowDeleteModal(false);
      setResenaToDelete(null);
    } catch (err) {
      setError(err.message || 'Error al eliminar reseña');
      setShowDeleteModal(false);
      setResenaToDelete(null);
    }
  };

  const cancelarEliminarResena = () => {
    setShowDeleteModal(false);
    setResenaToDelete(null);
  };

  const handleVolverAPendiente = async (id) => {
    try {
      // Enviar null para poner en pendiente
      await resenasService.aprobarResena(id, null, establecimiento);
      await cargarResenas(); // Recargar las reseñas
    } catch (err) {
      setError(err.message || 'Error al actualizar reseña');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar 
        key={index} 
        className={`resena-star-icon ${index < rating ? 'filled' : 'empty'}`} 
      />
    ));
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar reseñas: pendientes son las que no tienen aprobada definida o es null
  const resenasPendientes = resenas.filter(r => r.aprobada === null || r.aprobada === undefined || (r.aprobada !== true && r.aprobada !== false));
  const resenasAprobadas = resenas.filter(r => r.aprobada === true);
  const resenasRechazadas = resenas.filter(r => r.aprobada === false);

  return (
    <div className="negocio-page">
      <div className="negocio-page-container">
        <h1>Reseñas</h1>
        
        {error && (
          <div className="resenas-error">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="resenas-loading">Cargando reseñas...</div>
        ) : (
          <>
            {/* Reseñas pendientes */}
            <div className="resenas-section">
              <h2>Reseñas pendientes ({resenasPendientes.length})</h2>
              {resenasPendientes.length === 0 ? (
                <p className="resenas-empty">No hay reseñas pendientes</p>
              ) : (
                <div className="resenas-list">
                  {resenasPendientes.map((resena) => {
                    console.log('Reseña pendiente:', {
                      id: resena.id,
                      email: resena.usuarioEmail,
                      nombre: resena.usuarioNombre,
                      apellido: resena.usuarioApellido,
                      tieneNombre: !!resena.usuarioNombre,
                      tieneApellido: !!resena.usuarioApellido
                    });
                    return (
                    <div key={resena.id} className="resena-item resena-pendiente">
                      <div className="resena-item-header">
                        <div className="resena-item-info">
                          <div className="resena-rating-display">
                            {renderStars(resena.rating)}
                          </div>
                          <div className="resena-meta">
                            <span className="resena-email">{resena.usuarioEmail}</span>
                            {(resena.usuarioNombre || resena.usuarioApellido) ? (
                              <span className="resena-nombre">
                                {resena.usuarioNombre || ''} {resena.usuarioApellido || ''}
                              </span>
                            ) : (
                              <span className="resena-nombre" style={{ color: 'orange', fontStyle: 'italic' }}>
                                (Nombre no disponible)
                              </span>
                            )}
                            <span className="resena-fecha">{formatFecha(resena.fechaCreacion)}</span>
                          </div>
                        </div>
                        <div className="resena-actions">
                          <button
                            className="btn-resena btn-resena-aprobar"
                            onClick={() => handleAprobarResena(resena.id, true)}
                          >
                            <FaCheck /> Aprobar
                          </button>
                          <button
                            className="btn-resena btn-resena-rechazar"
                            onClick={() => handleAprobarResena(resena.id, false)}
                          >
                            <FaTimes /> Rechazar
                          </button>
                        </div>
                      </div>
                      {resena.texto && (
                        <div className="resena-texto">
                          {resena.texto}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reseñas aprobadas */}
            <div className="resenas-section">
              <h2>Reseñas aprobadas ({resenasAprobadas.length})</h2>
              {resenasAprobadas.length === 0 ? (
                <p className="resenas-empty">No hay reseñas aprobadas</p>
              ) : (
                <div className="resenas-list">
                  {resenasAprobadas.map((resena) => (
                    <div key={resena.id} className="resena-item resena-aprobada">
                      <div className="resena-item-header">
                        <div className="resena-item-info">
                          <div className="resena-rating-display">
                            {renderStars(resena.rating)}
                          </div>
                          <div className="resena-meta">
                            <span className="resena-email">{resena.usuarioEmail}</span>
                            {(resena.usuarioNombre || resena.usuarioApellido) && (
                              <span className="resena-nombre">
                                {resena.usuarioNombre || ''} {resena.usuarioApellido || ''}
                              </span>
                            )}
                            <span className="resena-fecha">{formatFecha(resena.fechaCreacion)}</span>
                          </div>
                        </div>
                        <div className="resena-actions">
                          <span className="resena-status aprobada">Aprobada</span>
                          <button
                            className="btn-resena btn-resena-pendiente"
                            onClick={() => handleVolverAPendiente(resena.id)}
                            title="Volver a pendientes"
                          >
                            Pendiente
                          </button>
                        </div>
                      </div>
                      {resena.texto && (
                        <div className="resena-texto">
                          {resena.texto}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reseñas rechazadas */}
            <div className="resenas-section">
              <div className="resenas-section-header">
                <h2>Reseñas rechazadas ({resenasRechazadas.length})</h2>
                <span className="resenas-info-text">se eliminarán automáticamente luego de 24 horas</span>
              </div>
              {resenasRechazadas.length === 0 ? (
                <p className="resenas-empty">No hay reseñas rechazadas</p>
              ) : (
                <div className="resenas-list">
                  {resenasRechazadas.map((resena) => (
                    <div key={resena.id} className="resena-item resena-rechazada">
                      <div className="resena-item-header">
                        <div className="resena-item-info">
                          <div className="resena-rating-display">
                            {renderStars(resena.rating)}
                          </div>
                          <div className="resena-meta">
                            <span className="resena-email">{resena.usuarioEmail}</span>
                            {(resena.usuarioNombre || resena.usuarioApellido) && (
                              <span className="resena-nombre">
                                {resena.usuarioNombre || ''} {resena.usuarioApellido || ''}
                              </span>
                            )}
                            <span className="resena-fecha">{formatFecha(resena.fechaCreacion)}</span>
                          </div>
                        </div>
                        <div className="resena-actions">
                          <span className="resena-status rechazada">Rechazada</span>
                          <button
                            className="btn-resena btn-resena-pendiente"
                            onClick={() => handleVolverAPendiente(resena.id)}
                            title="Volver a pendientes"
                          >
                            Pendiente
                          </button>
                          <button
                            className="btn-resena btn-resena-eliminar"
                            onClick={() => handleEliminarResena(resena.id)}
                            title="Eliminar reseña"
                          >
                            <FaTimes /> Eliminar
                          </button>
                        </div>
                      </div>
                      {resena.texto && (
                        <div className="resena-texto">
                          {resena.texto}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sección de ordenamiento de reseñas */}
            <div className="resenas-section">
              <h2>Posición de las reseñas:</h2>
              <div className="resenas-orden-options">
                <label className="resena-orden-option">
                  <input
                    type="radio"
                    name="ordenResenas"
                    value="antigua-reciente"
                    checked={ordenResenas === 'antigua-reciente'}
                    onChange={(e) => handleCambiarOrdenResenas(e.target.value)}
                    disabled={isLoadingOrden}
                  />
                  <span>De la más antigua a la más reciente</span>
                </label>
                <label className="resena-orden-option">
                  <input
                    type="radio"
                    name="ordenResenas"
                    value="reciente-antigua"
                    checked={ordenResenas === 'reciente-antigua'}
                    onChange={(e) => handleCambiarOrdenResenas(e.target.value)}
                    disabled={isLoadingOrden}
                  />
                  <span>De la más reciente a la más antigua</span>
                </label>
                <label className="resena-orden-option">
                  <input
                    type="radio"
                    name="ordenResenas"
                    value="mayor-menor"
                    checked={ordenResenas === 'mayor-menor'}
                    onChange={(e) => handleCambiarOrdenResenas(e.target.value)}
                    disabled={isLoadingOrden}
                  />
                  <span>De mayor a menor puntaje</span>
                </label>
                <label className="resena-orden-option">
                  <input
                    type="radio"
                    name="ordenResenas"
                    value="menor-mayor"
                    checked={ordenResenas === 'menor-mayor'}
                    onChange={(e) => handleCambiarOrdenResenas(e.target.value)}
                    disabled={isLoadingOrden}
                  />
                  <span>De menor a mayor puntaje</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar reseña */}
      {showDeleteModal && (
        <div className="resena-delete-modal-overlay" onClick={cancelarEliminarResena}>
          <div className="resena-delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="resena-delete-modal-title">¿Estás seguro de que quieres eliminar esta reseña?</h3>
            <p className="resena-delete-modal-message">Esta acción no se puede deshacer.</p>
            <div className="resena-delete-modal-actions">
              <button
                className="btn-resena-delete btn-resena-delete-cancel"
                onClick={cancelarEliminarResena}
              >
                Cancelar
              </button>
              <button
                className="btn-resena-delete btn-resena-delete-confirm"
                onClick={confirmarEliminarResena}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resenas;

