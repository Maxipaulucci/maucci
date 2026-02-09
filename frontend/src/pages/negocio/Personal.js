import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { personalService } from '../../services/api';
import './NegocioPage.css';
import './Personal.css';

const Personal = () => {
  const { user } = useAuth();
  const establecimiento = 'barberia_clasica'; // Por ahora hardcodeado, se puede obtener del contexto
  const [isLoading, setIsLoading] = useState(true);
  const [miembros, setMiembros] = useState([]);
  const [modoEliminacion, setModoEliminacion] = useState(false);
  const [modoModificacion, setModoModificacion] = useState(false);
  const [modoOrden, setModoOrden] = useState(false);
  const [miembroArrastrado, setMiembroArrastrado] = useState(null);
  const [isSavingOrden, setIsSavingOrden] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [miembroAEliminar, setMiembroAEliminar] = useState(null);
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [miembroAModificar, setMiembroAModificar] = useState(null); // null = agregar, objeto = modificar
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    foto: null,
    fotoPreview: null,
    nombre: '',
    rol: '',
    cualidades: []
  });
  const [cualidadInput, setCualidadInput] = useState('');

  // Función para convertir datos del backend al formato esperado por el componente
  const convertirPersonalABackend = (personalBackend) => {
    return personalBackend.map(p => ({
      id: p.idPersonal,
      name: p.nombre,
      role: p.rol,
      avatar: p.avatar || null,
      specialties: p.specialties || []
    }));
  };

  const cargarPersonal = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await personalService.obtenerPersonal(establecimiento);
      const personalData = response.data || response;
      const personalConvertido = convertirPersonalABackend(personalData);
      setMiembros(personalConvertido);
      setError('');
    } catch (err) {
      console.error('Error al cargar personal:', err);
      setError('Error al cargar el personal. Por favor, recarga la página.');
      setMiembros([]);
    } finally {
      setIsLoading(false);
    }
  }, [establecimiento]);

  useEffect(() => {
    cargarPersonal();
  }, [cargarPersonal]);

  const handleActivarEliminacion = () => {
    setModoEliminacion(true);
    setModoModificacion(false);
    setModoOrden(false);
  };

  const handleActivarModificacion = () => {
    setModoModificacion(true);
    setModoEliminacion(false);
    setModoOrden(false);
  };

  const handleActivarOrden = () => {
    setModoOrden(true);
    setModoEliminacion(false);
    setModoModificacion(false);
  };

  const handleGuardarOrden = async () => {
    if (miembros.length === 0) {
      setModoOrden(false);
      return;
    }
    setIsSavingOrden(true);
    setError('');
    try {
      const ids = miembros.map(m => m.id);
      await personalService.actualizarOrdenPersonal(establecimiento, ids);
      setModoOrden(false);
    } catch (err) {
      console.error('Error al guardar orden:', err);
      setError('Error al guardar el orden. Por favor, intenta de nuevo.');
    } finally {
      setIsSavingOrden(false);
    }
  };

  const handleDragStart = (e, miembro) => {
    setMiembroArrastrado(miembro);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(miembro.id));
  };

  const handleDragEnd = () => setMiembroArrastrado(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, miembroDestino) => {
    e.preventDefault();
    if (!miembroArrastrado || miembroArrastrado.id === miembroDestino.id) return;
    const indiceOrigen = miembros.findIndex(m => m.id === miembroArrastrado.id);
    const indiceDestino = miembros.findIndex(m => m.id === miembroDestino.id);
    if (indiceOrigen === -1 || indiceDestino === -1) return;
    const nuevaLista = [...miembros];
    const [removido] = nuevaLista.splice(indiceOrigen, 1);
    nuevaLista.splice(indiceDestino, 0, removido);
    setMiembros(nuevaLista);
  };

  const handleModificarMiembro = (miembro) => {
    setMiembroAModificar(miembro);
    // Cargar datos del miembro en el formulario
    setFormData({
      foto: null,
      fotoPreview: miembro.avatar || null,
      nombre: miembro.name || '',
      rol: miembro.role || '',
      cualidades: miembro.specialties || []
    });
    setCualidadInput('');
    setShowAgregarModal(true);
    setModoModificacion(false); // Salir del modo modificación al abrir el modal
  };

  const handleEliminarMiembro = (miembro) => {
    setMiembroAEliminar(miembro);
    setShowConfirmModal(true);
  };

  const handleConfirmarEliminacion = async () => {
    if (miembroAEliminar) {
      try {
        setIsLoading(true);
        console.log('Eliminando personal:', miembroAEliminar.id, 'del establecimiento:', establecimiento);
        
        const response = await personalService.eliminarPersonal(establecimiento, miembroAEliminar.id);
        console.log('Respuesta de eliminación:', response);
        
        // Esperar un momento para asegurar que el backend procesó la eliminación
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Recargar personal desde el backend
        console.log('Recargando personal desde el backend...');
        const responsePersonal = await personalService.obtenerPersonal(establecimiento);
        console.log('Respuesta de obtener personal:', responsePersonal);
        
        const personalData = responsePersonal.data || responsePersonal;
        console.log('Datos de personal recibidos:', personalData);
        
        if (Array.isArray(personalData)) {
          const personalConvertido = convertirPersonalABackend(personalData);
          console.log('Personal convertido:', personalConvertido);
          setMiembros(personalConvertido);
        } else {
          console.error('Los datos de personal no son un array:', personalData);
          setError('Error: formato de datos inválido');
        }
        
        setShowConfirmModal(false);
        setMiembroAEliminar(null);
        setModoEliminacion(false);
        setError('');
        
        // Mostrar mensaje de éxito si la respuesta lo indica
        if (response && response.message) {
          console.log('Mensaje del servidor:', response.message);
        }
      } catch (err) {
        console.error('Error al eliminar personal:', err);
        console.error('Detalles del error:', err.message, err.data);
        setError('Error al eliminar el personal: ' + (err.message || 'Error desconocido'));
        setShowConfirmModal(false);
        setMiembroAEliminar(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelarEliminacion = () => {
    setShowConfirmModal(false);
    setMiembroAEliminar(null);
  };

  const handleAbrirAgregarModal = () => {
    setMiembroAModificar(null); // Asegurar que es modo agregar
    setFormData({
      foto: null,
      fotoPreview: null,
      nombre: '',
      rol: '',
      cualidades: []
    });
    setCualidadInput('');
    setShowAgregarModal(true);
  };

  const handleCerrarAgregarModal = () => {
    setShowAgregarModal(false);
    setMiembroAModificar(null);
    setFormData({
      foto: null,
      fotoPreview: null,
      nombre: '',
      rol: '',
      cualidades: []
    });
    setCualidadInput('');
    setError('');
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          foto: file,
          fotoPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAgregarCualidad = () => {
    if (cualidadInput.trim() !== '') {
      setFormData({
        ...formData,
        cualidades: [...formData.cualidades, cualidadInput.trim()]
      });
      setCualidadInput('');
    }
  };

  const handleEliminarCualidad = (index) => {
    setFormData({
      ...formData,
      cualidades: formData.cualidades.filter((_, i) => i !== index)
    });
  };

  const handleSubmitAgregar = async (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén completos
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    
    if (!formData.rol.trim()) {
      setError('El rol es obligatorio.');
      return;
    }
    
    if (!formData.fotoPreview) {
      setError('La foto de perfil es obligatoria.');
      return;
    }
    
    if (formData.cualidades.length === 0) {
      setError('Debe agregar al menos una cualidad.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const personalData = {
        nombre: formData.nombre.trim(),
        rol: formData.rol.trim(),
        avatar: formData.fotoPreview, // Ya validado que existe
        specialties: formData.cualidades
      };

      if (miembroAModificar) {
        // Modificar personal existente
        console.log('Modificando personal:', miembroAModificar.id, 'con datos:', personalData);
        const updateResponse = await personalService.actualizarPersonal(
          establecimiento, 
          miembroAModificar.id, 
          personalData
        );
        console.log('Respuesta de actualización:', updateResponse);
      } else {
        // Crear nuevo personal
        console.log('Creando nuevo personal con datos:', personalData);
        const createResponse = await personalService.crearPersonal(establecimiento, personalData);
        console.log('Respuesta de creación:', createResponse);
      }
      
      // Esperar un momento para asegurar que el backend procesó la operación
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Recargar personal desde el backend
      console.log('Recargando personal desde el backend...');
      const response = await personalService.obtenerPersonal(establecimiento);
      const personalDataResponse = response.data || response;
      const personalConvertido = convertirPersonalABackend(personalDataResponse);
      setMiembros(personalConvertido);
      console.log('Personal recargado exitosamente');
      
      // Cerrar modal y limpiar formulario
      console.log('Cerrando modal...');
      setShowAgregarModal(false);
      setMiembroAModificar(null);
      setFormData({
        foto: null,
        fotoPreview: null,
        nombre: '',
        rol: '',
        cualidades: []
      });
      setCualidadInput('');
      setError('');
      console.log('Modal cerrado');
    } catch (err) {
      console.error('Error al guardar personal:', err);
      console.error('Detalles del error:', err.message, err.data);
      setError(miembroAModificar 
        ? 'Error al modificar el personal: ' + (err.message || 'Error desconocido')
        : 'Error al crear el personal: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="negocio-page">
        <div className="container">
          <div className="loading">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="negocio-page">
      <div className="container">
        <div className="page-header">
          <h1>Personal</h1>
          <p>Gestiona el personal de tu negocio</p>
        </div>

        <div className="page-content">
          {error && (
            <div className="error-message" style={{ 
              padding: '1rem', 
              backgroundColor: '#fee', 
              color: '#c33', 
              borderRadius: '4px', 
              marginBottom: '1rem' 
            }}>
              {error}
            </div>
          )}
          <div className="personal-section">
            <h2 className="section-title">Miembros del personal</h2>
            
            <div className="miembros-container">
              {miembros.map((miembro) => (
                <div
                  key={miembro.id}
                  className={`miembro-card ${modoOrden ? 'miembro-card-draggable' : ''} ${miembroArrastrado?.id === miembro.id ? 'miembro-card-dragging' : ''}`}
                  draggable={modoOrden}
                  onDragStart={modoOrden ? (e) => handleDragStart(e, miembro) : undefined}
                  onDragEnd={modoOrden ? handleDragEnd : undefined}
                  onDragOver={modoOrden ? handleDragOver : undefined}
                  onDrop={modoOrden ? (e) => handleDrop(e, miembro) : undefined}
                >
                  <div className="miembro-avatar">
                    {miembro.avatar ? (
                      <img src={miembro.avatar} alt={miembro.name} />
                    ) : (
                      <div className="miembro-avatar-placeholder">
                        {miembro.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="miembro-info">
                    <h3 className="miembro-nombre">{miembro.name}</h3>
                    <p className="miembro-rol">{miembro.role}</p>
                    {miembro.specialties && miembro.specialties.length > 0 && (
                      <div className="miembro-especialidades">
                        {miembro.specialties.map((specialty, index) => (
                          <span key={index} className="especialidad-tag">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {modoEliminacion && (
                    <button 
                      className="btn-eliminar-miembro"
                      onClick={() => handleEliminarMiembro(miembro)}
                    >
                      Eliminar
                    </button>
                  )}
                  {modoModificacion && (
                    <button 
                      className="btn-modificar-miembro"
                      onClick={() => handleModificarMiembro(miembro)}
                    >
                      Modificar
                    </button>
                  )}
                </div>
              ))}
              <div className="personal-orden-actions">
                <button
                  type="button"
                  className={`btn-modificar-orden ${modoOrden ? 'btn-modificar-orden-active' : ''}`}
                  onClick={modoOrden ? handleGuardarOrden : handleActivarOrden}
                  disabled={isSavingOrden || miembros.length === 0}
                >
                  {modoOrden ? (isSavingOrden ? 'Guardando...' : 'Guardar orden') : 'Modificar orden'}
                </button>
                {modoOrden && (
                  <button
                    type="button"
                    className="btn-cancelar-orden"
                    onClick={() => { setModoOrden(false); setMiembroArrastrado(null); cargarPersonal(); }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="personal-actions">
              <button 
                className="btn-eliminar"
                onClick={handleActivarEliminacion}
              >
                Eliminar
              </button>
              <button 
                className="btn-modificar"
                onClick={handleActivarModificacion}
              >
                Modificar
              </button>
              <button 
                className="btn-agregar"
                onClick={handleAbrirAgregarModal}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancelarEliminacion}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Confirmar eliminación</h3>
            <p className="modal-message">
              ¿Seguro que deseas eliminar a {miembroAEliminar?.name}?
            </p>
            <div className="modal-actions">
              <button 
                className="btn-cancelar"
                onClick={handleCancelarEliminacion}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar"
                onClick={handleConfirmarEliminacion}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de agregar/modificar personal */}
      {showAgregarModal && (
        <div className="modal-overlay" onClick={handleCerrarAgregarModal}>
          <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {miembroAModificar ? 'Modificar personal' : 'Agregar nuevo personal'}
            </h3>
            <form onSubmit={handleSubmitAgregar} className="form-agregar-personal">
              {/* Foto de perfil */}
              <div className="form-group">
                <label htmlFor="foto" className="form-label">
                  Foto de perfil <span style={{ color: 'red' }}>*</span>
                </label>
                <div className="foto-upload-container">
                  {formData.fotoPreview ? (
                    <div className="foto-preview">
                      <img src={formData.fotoPreview} alt="Preview" />
                      <button
                        type="button"
                        className="btn-cambiar-foto"
                        onClick={() => document.getElementById('foto').click()}
                      >
                        Cambiar foto
                      </button>
                    </div>
                  ) : (
                    <div className="foto-placeholder">
                      <label htmlFor="foto" className="foto-upload-label">
                        <span>+</span>
                        <span>Seleccionar foto</span>
                      </label>
                    </div>
                  )}
                  <input
                    type="file"
                    id="foto"
                    name="foto"
                    accept="image/*"
                    onChange={handleFotoChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {!formData.fotoPreview && (
                  <small style={{ color: '#c33', display: 'block', marginTop: '0.5rem' }}>
                    La foto de perfil es obligatoria
                  </small>
                )}
              </div>

              {/* Nombre */}
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">
                  Nombre <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingrese el nombre"
                  required
                />
              </div>

              {/* Rol */}
              <div className="form-group">
                <label htmlFor="rol" className="form-label">
                  Rol <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingrese el rol"
                  required
                />
              </div>

              {/* Cualidades */}
              <div className="form-group">
                <label htmlFor="cualidades" className="form-label">
                  Cualidades <span style={{ color: 'red' }}>*</span>
                </label>
                {formData.cualidades.length === 0 && (
                  <small style={{ color: '#c33', display: 'block', marginBottom: '0.5rem' }}>
                    Debe agregar al menos una cualidad
                  </small>
                )}
                <div className="cualidades-input-container">
                  <input
                    type="text"
                    id="cualidades"
                    value={cualidadInput}
                    onChange={(e) => setCualidadInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAgregarCualidad();
                      }
                    }}
                    className="form-input"
                    placeholder="Ingrese una cualidad y presione Enter"
                  />
                  <button
                    type="button"
                    className="btn-agregar-cualidad"
                    onClick={handleAgregarCualidad}
                  >
                    Agregar
                  </button>
                </div>
                {formData.cualidades.length > 0 && (
                  <div className="cualidades-list">
                    {formData.cualidades.map((cualidad, index) => (
                      <span key={index} className="cualidad-tag">
                        {cualidad}
                        <button
                          type="button"
                          className="btn-eliminar-cualidad"
                          onClick={() => handleEliminarCualidad(index)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones del formulario */}
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn-cancelar"
                  onClick={handleCerrarAgregarModal}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-confirmar btn-guardar"
                  disabled={isSaving || !formData.nombre.trim() || !formData.rol.trim() || !formData.fotoPreview || formData.cualidades.length === 0}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;



