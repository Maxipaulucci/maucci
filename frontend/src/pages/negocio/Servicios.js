import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { servicioService, negociosService } from '../../services/api';
import './NegocioPage.css';
import './Servicios.css';

const Servicios = () => {
  const { user } = useAuth();
  const establecimiento = 'barberia_clasica'; // Por ahora hardcodeado, se puede obtener del contexto
  const [isLoading, setIsLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [modoEliminacion, setModoEliminacion] = useState(false);
  const [modoModificacion, setModoModificacion] = useState(false);
  const [modoOrden, setModoOrden] = useState(false);
  const [servicioArrastrado, setServicioArrastrado] = useState(null);
  const [isSavingOrden, setIsSavingOrden] = useState(false);
  const [modoOrdenCategorias, setModoOrdenCategorias] = useState(false);
  const [categoriaArrastrada, setCategoriaArrastrada] = useState(null);
  const [isSavingOrdenCategorias, setIsSavingOrdenCategorias] = useState(false);
  const categoriasOrdenOriginalRef = React.useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [servicioAModificar, setServicioAModificar] = useState(null); // null = agregar, objeto = modificar
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaInput, setCategoriaInput] = useState('');
  const [isSavingCategorias, setIsSavingCategorias] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    duracionHoras: '0',
    duracionMinutos: '0',
    precio: '',
    descripcion: ''
  });

  // Función para convertir datos del backend al formato esperado por el componente
  const convertirServicioABackend = (serviciosBackend) => {
    return serviciosBackend.map(s => ({
      id: s.idServicio,
      name: s.nombre,
      category: s.categoria,
      duration: s.duracion,
      price: s.precio,
      description: s.descripcion
    }));
  };

  const cargarServicios = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await servicioService.obtenerServicios(establecimiento);
      const serviciosData = response.data || response;
      const serviciosConvertidos = convertirServicioABackend(serviciosData);
      setServicios(serviciosConvertidos);
      setError('');
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setError('Error al cargar los servicios. Por favor, recarga la página.');
      setServicios([]);
    } finally {
      setIsLoading(false);
    }
  }, [establecimiento]);

  useEffect(() => {
    cargarServicios();
  }, [cargarServicios]);

  // Cargar categorías desde el backend
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await negociosService.obtenerNegocio(establecimiento);
        const negocio = response.data || response;
        if (negocio && negocio.categorias && negocio.categorias.length > 0) {
          setCategorias(negocio.categorias);
        } else {
          // Si no hay categorías guardadas, inicializar con las categorías de los servicios existentes
          const categoriasUnicas = [...new Set(servicios.map(s => s.category))].filter(Boolean);
          if (categoriasUnicas.length > 0) {
            setCategorias(categoriasUnicas);
            // Guardar las categorías en el backend
            try {
              await negociosService.actualizarCategorias(establecimiento, categoriasUnicas);
            } catch (err) {
              console.error('Error al guardar categorías iniciales:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        // Si falla, usar categorías de servicios existentes
        const categoriasUnicas = [...new Set(servicios.map(s => s.category))].filter(Boolean);
        if (categoriasUnicas.length > 0) {
          setCategorias(categoriasUnicas);
        }
      }
    };
    
    cargarCategorias();
  }, [establecimiento, servicios]);

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
    if (servicios.length === 0) {
      setModoOrden(false);
      return;
    }
    setIsSavingOrden(true);
    setError('');
    try {
      const ids = servicios.map(s => s.id);
      await servicioService.actualizarOrdenServicios(establecimiento, ids);
      setModoOrden(false);
    } catch (err) {
      console.error('Error al guardar orden:', err);
      setError('Error al guardar el orden. Por favor, intenta de nuevo.');
    } finally {
      setIsSavingOrden(false);
    }
  };

  const handleDragStart = (e, servicio) => {
    setServicioArrastrado(servicio);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(servicio.id));
  };

  const handleDragEnd = () => {
    setServicioArrastrado(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, servicioDestino) => {
    e.preventDefault();
    if (!servicioArrastrado || servicioArrastrado.id === servicioDestino.id) return;
    const indiceOrigen = servicios.findIndex(s => s.id === servicioArrastrado.id);
    const indiceDestino = servicios.findIndex(s => s.id === servicioDestino.id);
    if (indiceOrigen === -1 || indiceDestino === -1) return;
    const nuevaLista = [...servicios];
    const [removido] = nuevaLista.splice(indiceOrigen, 1);
    nuevaLista.splice(indiceDestino, 0, removido);
    setServicios(nuevaLista);
  };

  const handleActivarOrdenCategorias = () => {
    categoriasOrdenOriginalRef.current = [...categorias];
    setModoOrdenCategorias(true);
  };
  const handleGuardarOrdenCategorias = async () => {
    if (categorias.length === 0) {
      setModoOrdenCategorias(false);
      return;
    }
    setIsSavingOrdenCategorias(true);
    setError('');
    try {
      await negociosService.actualizarCategorias(establecimiento, categorias);
      setModoOrdenCategorias(false);
    } catch (err) {
      console.error('Error al guardar orden de categorías:', err);
      setError('Error al guardar el orden de categorías. Por favor, intenta de nuevo.');
    } finally {
      setIsSavingOrdenCategorias(false);
    }
  };
  const handleDragStartCategoria = (e, categoria) => {
    setCategoriaArrastrada(categoria);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', categoria);
  };
  const handleDragEndCategoria = () => setCategoriaArrastrada(null);
  const handleDragOverCategoria = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDropCategoria = (e, categoriaDestino) => {
    e.preventDefault();
    if (!categoriaArrastrada || categoriaArrastrada === categoriaDestino) return;
    const indiceOrigen = categorias.indexOf(categoriaArrastrada);
    const indiceDestino = categorias.indexOf(categoriaDestino);
    if (indiceOrigen === -1 || indiceDestino === -1) return;
    const nuevaLista = [...categorias];
    const [removido] = nuevaLista.splice(indiceOrigen, 1);
    nuevaLista.splice(indiceDestino, 0, removido);
    setCategorias(nuevaLista);
  };

  const handleModificarServicio = (servicio) => {
    setServicioAModificar(servicio);
    
    // Parsear la duración del formato "XX min" o "XX:XX"
    let horas = '0';
    let minutos = '0';
    
    if (servicio.duration) {
      if (servicio.duration.includes(':')) {
        // Formato "XX:XX"
        const partes = servicio.duration.split(':');
        horas = partes[0] || '0';
        minutos = partes[1] || '0';
      } else if (servicio.duration.includes('min')) {
        // Formato "XX min"
        const numMinutos = parseInt(servicio.duration.replace(' min', '')) || 0;
        horas = '0';
        minutos = numMinutos.toString();
      }
    }
    
    // Parsear el precio para quitar el símbolo $ y dejar solo el número
    let precioNumero = servicio.price || '';
    if (precioNumero.startsWith('$')) {
      precioNumero = precioNumero.substring(1);
    }
    
    // Cargar datos del servicio en el formulario
    setFormData({
      nombre: servicio.name || '',
      categoria: servicio.category || '',
      duracionHoras: horas,
      duracionMinutos: minutos,
      precio: precioNumero,
      descripcion: servicio.description || ''
    });
    setShowAgregarModal(true);
    setModoModificacion(false); // Salir del modo modificación al abrir el modal
  };

  const handleEliminarServicio = (servicio) => {
    setServicioAEliminar(servicio);
    setShowConfirmModal(true);
  };

  const handleConfirmarEliminacion = async () => {
    if (servicioAEliminar) {
      try {
        setIsLoading(true);
        console.log('Eliminando servicio:', servicioAEliminar.id, 'del establecimiento:', establecimiento);
        
        const response = await servicioService.eliminarServicio(establecimiento, servicioAEliminar.id);
        console.log('Respuesta de eliminación:', response);
        
        // Esperar un momento para asegurar que el backend procesó la eliminación
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Recargar servicios desde el backend
        console.log('Recargando servicios desde el backend...');
        const responseServicios = await servicioService.obtenerServicios(establecimiento);
        console.log('Respuesta de obtener servicios:', responseServicios);
        
        const serviciosData = responseServicios.data || responseServicios;
        console.log('Datos de servicios recibidos:', serviciosData);
        
        if (Array.isArray(serviciosData)) {
          const serviciosConvertidos = convertirServicioABackend(serviciosData);
          console.log('Servicios convertidos:', serviciosConvertidos);
          setServicios(serviciosConvertidos);
        } else {
          console.error('Los datos de servicios no son un array:', serviciosData);
          setError('Error: formato de datos inválido');
        }
        
        setShowConfirmModal(false);
        setServicioAEliminar(null);
        setModoEliminacion(false);
        setError('');
        
        // Mostrar mensaje de éxito si la respuesta lo indica
        if (response && response.message) {
          console.log('Mensaje del servidor:', response.message);
        }
      } catch (err) {
        console.error('Error al eliminar servicio:', err);
        setError('Error al eliminar el servicio. Por favor, intenta nuevamente.');
        setShowConfirmModal(false);
        setServicioAEliminar(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelarEliminacion = () => {
    setShowConfirmModal(false);
    setServicioAEliminar(null);
    setModoEliminacion(false);
  };

  const handleAbrirAgregarModal = () => {
    setServicioAModificar(null); // Asegurar que es modo agregar
    setFormData({
      nombre: '',
      categoria: '',
      duracionHoras: '0',
      duracionMinutos: '0',
      precio: '',
      descripcion: ''
    });
    setShowAgregarModal(true);
  };

  const handleCerrarAgregarModal = () => {
    setShowAgregarModal(false);
    setServicioAModificar(null);
    setFormData({
      nombre: '',
      categoria: '',
      duracionHoras: '0',
      duracionMinutos: '0',
      precio: '',
      descripcion: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePrecioChange = (e) => {
    // Solo permitir números
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData({
      ...formData,
      precio: value
    });
  };

  const handleAgregarCategoria = async () => {
    if (categoriaInput.trim() !== '' && !categorias.includes(categoriaInput.trim())) {
      const nuevaCategoria = categoriaInput.trim();
      const nuevasCategorias = [...categorias, nuevaCategoria];
      setCategorias(nuevasCategorias);
      setCategoriaInput('');
      
      // Guardar en el backend
      try {
        setIsSavingCategorias(true);
        await negociosService.actualizarCategorias(establecimiento, nuevasCategorias);
      } catch (err) {
        console.error('Error al guardar categorías:', err);
        // Revertir el cambio si falla
        setCategorias(categorias);
        setError('Error al guardar la categoría. Por favor, intenta nuevamente.');
      } finally {
        setIsSavingCategorias(false);
      }
    }
  };

  const handleEliminarCategoria = async (categoriaAEliminar) => {
    // Verificar si hay servicios usando esta categoría
    const serviciosConCategoria = servicios.filter(s => s.category === categoriaAEliminar);
    if (serviciosConCategoria.length > 0) {
      setError(`No se puede eliminar la categoría "${categoriaAEliminar}" porque hay ${serviciosConCategoria.length} servicio(s) que la utilizan.`);
      return;
    }
    
    const nuevasCategorias = categorias.filter(c => c !== categoriaAEliminar);
    setCategorias(nuevasCategorias);
    
    // Guardar en el backend
    try {
      setIsSavingCategorias(true);
      await negociosService.actualizarCategorias(establecimiento, nuevasCategorias);
    } catch (err) {
      console.error('Error al guardar categorías:', err);
      // Revertir el cambio si falla
      setCategorias(categorias);
      setError('Error al eliminar la categoría. Por favor, intenta nuevamente.');
    } finally {
      setIsSavingCategorias(false);
    }
  };

  const handleSubmitAgregar = async (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén completos
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    
    if (!formData.categoria.trim()) {
      setError('La categoría es obligatoria.');
      return;
    }
    
    if (!formData.precio.trim()) {
      setError('El precio es obligatorio.');
      return;
    }
    
    if (!formData.descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Formatear duración como "XX min" o "XX:XX" según corresponda
      let duracionFormato = '';
      const horas = parseInt(formData.duracionHoras) || 0;
      const minutos = parseInt(formData.duracionMinutos) || 0;
      
      if (horas > 0 && minutos > 0) {
        duracionFormato = `${horas}:${minutos.toString().padStart(2, '0')}`;
      } else if (horas > 0) {
        duracionFormato = `${horas}:00`;
      } else if (minutos > 0) {
        duracionFormato = `${minutos} min`;
      } else {
        setError('La duración debe ser mayor a 0.');
        setIsSaving(false);
        return;
      }

      // Asegurar que el precio tenga el símbolo $
      let precioFormato = formData.precio.trim();
      if (precioFormato && !precioFormato.startsWith('$')) {
        precioFormato = '$' + precioFormato;
      }

      const servicioData = {
        nombre: formData.nombre.trim(),
        categoria: formData.categoria.trim(),
        duracion: duracionFormato,
        precio: precioFormato,
        descripcion: formData.descripcion.trim()
      };

      if (servicioAModificar) {
        // Modificar servicio existente
        await servicioService.actualizarServicio(
          establecimiento, 
          servicioAModificar.id, 
          servicioData
        );
      } else {
        // Crear nuevo servicio
        await servicioService.crearServicio(establecimiento, servicioData);
      }
      
      // Recargar servicios desde el backend
      const response = await servicioService.obtenerServicios(establecimiento);
      const serviciosData = response.data || response;
      const serviciosConvertidos = convertirServicioABackend(serviciosData);
      setServicios(serviciosConvertidos);
      
      // Cerrar modal y limpiar formulario
      handleCerrarAgregarModal();
      setError('');
    } catch (err) {
      console.error('Error al guardar servicio:', err);
      setError(servicioAModificar 
        ? 'Error al modificar el servicio. Por favor, intenta nuevamente.'
        : 'Error al crear el servicio. Por favor, intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && servicios.length === 0) {
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
          <h1>Servicios</h1>
          <p>Gestiona los servicios que ofrece tu negocio</p>
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
          <div className="servicios-section">
            <h2 className="section-title">Servicios</h2>
            
            {/* Sección de categorías */}
            <div className="categorias-section">
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Categorías
              </label>
              <div className="cualidades-input-container">
                <input
                  type="text"
                  value={categoriaInput}
                  onChange={(e) => setCategoriaInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAgregarCategoria();
                    }
                  }}
                  className="form-input"
                  placeholder="Ingrese una categoría y presione Enter"
                  disabled={isSavingCategorias}
                />
                <button
                  type="button"
                  className="btn-agregar-cualidad"
                  onClick={handleAgregarCategoria}
                  disabled={isSavingCategorias || !categoriaInput.trim() || categorias.includes(categoriaInput.trim())}
                >
                  Agregar
                </button>
              </div>
              {categorias.length > 0 && (
                <div className="cualidades-list" style={{ marginTop: '1rem' }}>
                  {categorias.map((categoria, index) => (
                    <span
                      key={index}
                      className={`cualidad-tag ${modoOrdenCategorias ? 'cualidad-tag-draggable' : ''} ${categoriaArrastrada === categoria ? 'cualidad-tag-dragging' : ''}`}
                      draggable={modoOrdenCategorias}
                      onDragStart={modoOrdenCategorias ? (e) => handleDragStartCategoria(e, categoria) : undefined}
                      onDragEnd={modoOrdenCategorias ? handleDragEndCategoria : undefined}
                      onDragOver={modoOrdenCategorias ? handleDragOverCategoria : undefined}
                      onDrop={modoOrdenCategorias ? (e) => handleDropCategoria(e, categoria) : undefined}
                    >
                      {categoria}
                      {!modoOrdenCategorias && (
                        <button
                          type="button"
                          className="btn-eliminar-cualidad"
                          onClick={() => handleEliminarCategoria(categoria)}
                          disabled={isSavingCategorias}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              {categorias.length > 0 && (
                <div className="categorias-orden-actions">
                  <button
                    type="button"
                    className={`btn-modificar-orden btn-modificar-orden-categorias ${modoOrdenCategorias ? 'btn-modificar-orden-active' : ''}`}
                    onClick={modoOrdenCategorias ? handleGuardarOrdenCategorias : handleActivarOrdenCategorias}
                    disabled={isSavingOrdenCategorias}
                  >
                    {modoOrdenCategorias ? (isSavingOrdenCategorias ? 'Guardando...' : 'Guardar orden') : 'Modificar orden'}
                  </button>
                  {modoOrdenCategorias && (
                    <button
                      type="button"
                      className="btn-cancelar-orden"
                      onClick={() => {
                        setModoOrdenCategorias(false);
                        setCategoriaArrastrada(null);
                        if (categoriasOrdenOriginalRef.current) {
                          setCategorias(categoriasOrdenOriginalRef.current);
                        }
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="servicios-container">
              {servicios.map((servicio) => (
                <div
                  key={servicio.id}
                  className={`servicio-card ${modoOrden ? 'servicio-card-draggable' : ''} ${servicioArrastrado?.id === servicio.id ? 'servicio-card-dragging' : ''}`}
                  draggable={modoOrden}
                  onDragStart={modoOrden ? (e) => handleDragStart(e, servicio) : undefined}
                  onDragEnd={modoOrden ? handleDragEnd : undefined}
                  onDragOver={modoOrden ? handleDragOver : undefined}
                  onDrop={modoOrden ? (e) => handleDrop(e, servicio) : undefined}
                >
                  <div className="servicio-header">
                    <h3 className="servicio-name">{servicio.name}</h3>
                    <span className="servicio-category">{servicio.category}</span>
                  </div>
                  
                  <div className="servicio-details">
                    <div className="servicio-info">
                      <div className="servicio-duration">
                        <div className="info-icon-wrapper">
                          <img 
                            src="/assets/img/logos_genericos/reloj.png" 
                            alt="Duración" 
                            className="info-icon"
                          />
                        </div>
                        <span>{servicio.duration}</span>
                      </div>
                      <div className="servicio-price">
                        <div className="info-icon-wrapper">
                          <img 
                            src="/assets/img/logos_genericos/dinero.png" 
                            alt="Precio" 
                            className="info-icon"
                          />
                        </div>
                        <span>{servicio.price}</span>
                      </div>
                    </div>
                    
                    <p className="servicio-description">{servicio.description}</p>
                  </div>
                  
                  {modoEliminacion && (
                    <button 
                      className="btn-eliminar-servicio"
                      onClick={() => handleEliminarServicio(servicio)}
                    >
                      Eliminar
                    </button>
                  )}
                  {modoModificacion && (
                    <button 
                      className="btn-modificar-servicio"
                      onClick={() => handleModificarServicio(servicio)}
                    >
                      Modificar
                    </button>
                  )}
                </div>
              ))}
              <div className="servicios-orden-actions">
                <button
                  type="button"
                  className={`btn-modificar-orden ${modoOrden ? 'btn-modificar-orden-active' : ''}`}
                  onClick={modoOrden ? handleGuardarOrden : handleActivarOrden}
                  disabled={isSavingOrden || servicios.length === 0}
                >
                  {modoOrden ? (isSavingOrden ? 'Guardando...' : 'Guardar orden') : 'Modificar orden'}
                </button>
                {modoOrden && (
                  <button
                    type="button"
                    className="btn-cancelar-orden"
                    onClick={() => { setModoOrden(false); setServicioArrastrado(null); cargarServicios(); }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="servicios-actions">
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
              ¿Seguro que deseas eliminar el servicio {servicioAEliminar?.name}?
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

      {/* Modal de agregar servicio */}
      {showAgregarModal && (
        <div className="modal-overlay" onClick={handleCerrarAgregarModal}>
          <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {servicioAModificar ? 'Modificar servicio' : 'Agregar nuevo servicio'}
            </h3>
            <form onSubmit={handleSubmitAgregar} className="form-agregar-servicio">
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

              {/* Categoría */}
              <div className="form-group">
                <label htmlFor="categoria" className="form-label">
                  Categoría <span style={{ color: 'red' }}>*</span>
                </label>
                {categorias.length > 0 ? (
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Ingrese la categoría"
                    required
                  />
                )}
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  {categorias.length > 0 
                    ? 'Seleccione una categoría de la lista o agregue una nueva arriba'
                    : 'Agregue categorías arriba para poder seleccionarlas aquí'}
                </small>
              </div>

              {/* Duración */}
              <div className="form-group">
                <label className="form-label">
                  Duración <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="duracionHoras" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                      Horas (0-24)
                    </label>
                    <input
                      type="number"
                      id="duracionHoras"
                      name="duracionHoras"
                      value={formData.duracionHoras}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      max="24"
                      required
                    />
                  </div>
                  <span style={{ fontSize: '1.5rem', marginTop: '1.5rem' }}>:</span>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="duracionMinutos" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                      Minutos (0-60)
                    </label>
                    <input
                      type="number"
                      id="duracionMinutos"
                      name="duracionMinutos"
                      value={formData.duracionMinutos}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      max="60"
                      required
                    />
                  </div>
                </div>
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  Formato: XX:XX (ejemplo: 1:30 para 1 hora y 30 minutos)
                </small>
              </div>

              {/* Precio */}
              <div className="form-group">
                <label htmlFor="precio" className="form-label">
                  Precio <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: '500',
                    pointerEvents: 'none'
                  }}>
                    $
                  </span>
                  <input
                    type="text"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handlePrecioChange}
                    className="form-input"
                    placeholder="2500"
                    required
                    style={{ paddingLeft: '32px' }}
                    inputMode="numeric"
                  />
                </div>
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  Solo números. El símbolo $ se agregará automáticamente.
                </small>
              </div>

              {/* Descripción */}
              <div className="form-group">
                <label htmlFor="descripcion" className="form-label">
                  Descripción <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Escribe la descripción aquí..."
                    maxLength={250}
                    rows={6}
                    required
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '8px', 
                    right: '12px', 
                    fontSize: '0.75rem',
                    color: formData.descripcion.length >= 250 ? '#c33' : '#666',
                    backgroundColor: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px'
                  }}>
                    {formData.descripcion.length}/250
                  </div>
                </div>
                <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                  Máximo 250 caracteres
                </small>
              </div>

              {error && (
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#fee', 
                  color: '#c33', 
                  borderRadius: '4px', 
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              <div className="modal-actions">
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
                  disabled={isSaving || !formData.nombre.trim() || !formData.categoria.trim() || !formData.precio.trim() || !formData.descripcion.trim()}
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

export default Servicios;
