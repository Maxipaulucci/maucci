import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../../context/AuthContext';
import { reservasService, personalService } from '../../services/api';
import CancelarTurnoModal from '../../components/shared/CancelarTurnoModal';
import EnviarEmailModal from '../../components/shared/EnviarEmailModal';
import ConfirmarCancelarTodosModal from '../../components/shared/ConfirmarCancelarTodosModal';
import ModificarTurnoModal from '../../components/shared/ModificarTurnoModal';
import Notification from '../../components/shared/Notification';
import './NegocioPage.css';
import './TurnosReservados.css';

const TurnosReservados = () => {
  const { user } = useAuth();
  // Obtener código del negocio (por ahora hardcodeado como 'barberia_clasica', 
  // en el futuro se puede obtener del usuario o configuración)
  const establecimiento = 'barberia_clasica';
  
  // Inicializar con el primer día del mes actual
  const hoy = new Date();
  const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const [date, setDate] = useState(mesActual); // Fecha del mes actual
  const [selectedDate, setSelectedDate] = useState(null); // Día seleccionado en el calendario
  const [reservasPorDia, setReservasPorDia] = useState({});
  const [reservasDelDia, setReservasDelDia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const [error, setError] = useState('');
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showModificarModal, setShowModificarModal] = useState(false);
  const [showConfirmarCancelarTodosModal, setShowConfirmarCancelarTodosModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [notification, setNotification] = useState(null);
  const [modoVisualizacion, setModoVisualizacion] = useState(null); // null, 'personal', 'general'
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [team, setTeam] = useState([]); // Estado para el equipo cargado desde el backend

  // Función para convertir datos del backend al formato esperado
  const convertirPersonalABackend = (personalBackend) => {
    return personalBackend.map(p => ({
      id: p.idPersonal,
      name: p.nombre,
      role: p.rol,
      avatar: p.avatar || '/assets/img/establecimientos/barberia_ejemplo/personal/personal1.jpg',
      specialties: p.specialties || []
    }));
  };

  // Cargar personal desde el backend
  useEffect(() => {
    const cargarPersonal = async () => {
      try {
        const response = await personalService.obtenerPersonal(establecimiento);
        const personalData = response.data || response;
        const personalConvertido = convertirPersonalABackend(personalData);
        setTeam(personalConvertido);
      } catch (err) {
        console.error('Error al cargar personal:', err);
        setTeam([]);
      }
    };
    
    cargarPersonal();
  }, [establecimiento]);

  // Cargar reservas del mes actual
  useEffect(() => {
    if (modoVisualizacion === 'personal' && profesionalSeleccionado) {
      cargarReservasDelMes(date, profesionalSeleccionado.id);
    } else if (modoVisualizacion === 'general') {
      cargarReservasDelMes(date, null);
    }
  }, [date, modoVisualizacion, profesionalSeleccionado]);

  // Cargar reservas del día seleccionado
  useEffect(() => {
    if (selectedDate) {
      cargarReservasDelDia(selectedDate);
    } else {
      setReservasDelDia([]);
    }
  }, [selectedDate]);

  const cargarReservasDelMes = async (fecha, profesionalId = null) => {
    setIsLoading(true);
    setError('');
    try {
      const año = fecha.getFullYear();
      const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11
      
      // Obtener todas las reservas del mes
      const response = await reservasService.obtenerReservasPorMes(establecimiento, año, mes);
      let reservas = response.data?.reservas || response.reservas || [];
      
      // Si hay un profesional seleccionado, filtrar por ese profesional
      if (profesionalId !== null) {
        reservas = reservas.filter(r => r.profesional?.id === profesionalId);
      }
      
      // Contar reservas por día
      const contadores = {};
      reservas.forEach(reserva => {
        const fechaReserva = new Date(reserva.fecha);
        const fechaStr = formatearFecha(fechaReserva);
        contadores[fechaStr] = (contadores[fechaStr] || 0) + 1;
      });
      
      setReservasPorDia(contadores);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError('Error al cargar las reservas del mes');
      setReservasPorDia({});
    } finally {
      setIsLoading(false);
    }
  };

  const cargarReservasDelDia = async (fecha) => {
    setIsLoadingReservas(true);
    try {
      // Formatear fecha como YYYY-MM-DD para la API
      const fechaStr = formatearFecha(fecha);
      
      // Obtener reservas del día, con filtro de profesional si está seleccionado
      const profesionalId = modoVisualizacion === 'personal' && profesionalSeleccionado 
        ? profesionalSeleccionado.id 
        : null;
      
      const response = await reservasService.obtenerReservas(
        establecimiento, 
        fechaStr,
        profesionalId
      );
      
      const reservas = response.data || response || [];
      setReservasDelDia(reservas);
    } catch (err) {
      console.error('Error al cargar reservas del día:', err);
      setReservasDelDia([]);
    } finally {
      setIsLoadingReservas(false);
    }
  };

  // Función para formatear fecha como YYYY-MM-DD (sin problemas de zona horaria)
  const formatearFecha = (fecha) => {
    // Usar getFullYear, getMonth, getDate para evitar problemas de zona horaria
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Función para verificar si una fecha es pasada
  // Compara directamente año, mes y día sin problemas de zona horaria
  const esFechaPasada = (fecha) => {
    const hoy = new Date();
    const añoHoy = hoy.getFullYear();
    const mesHoy = hoy.getMonth();
    const diaHoy = hoy.getDate();
    
    const añoFecha = fecha.getFullYear();
    const mesFecha = fecha.getMonth();
    const diaFecha = fecha.getDate();
    
    // Comparar año, mes y día directamente
    if (añoFecha < añoHoy) return true;
    if (añoFecha > añoHoy) return false;
    if (mesFecha < mesHoy) return true;
    if (mesFecha > mesHoy) return false;
    return diaFecha < diaHoy;
  };

  // Verificar si el mes es anterior al mes actual
  const esMesAnterior = (fecha) => {
    const hoy = new Date();
    const añoHoy = hoy.getFullYear();
    const mesHoy = hoy.getMonth();
    const añoFecha = fecha.getFullYear();
    const mesFecha = fecha.getMonth();
    
    return añoFecha < añoHoy || (añoFecha === añoHoy && mesFecha < mesHoy);
  };

  // Verificar si estamos en el mes actual
  const esMesActual = (fecha) => {
    const hoy = new Date();
    const añoHoy = hoy.getFullYear();
    const mesHoy = hoy.getMonth();
    const añoFecha = fecha.getFullYear();
    const mesFecha = fecha.getMonth();
    
    return añoFecha === añoHoy && mesFecha === mesHoy;
  };

  // Calcular total de turnos desde hoy en adelante
  const calcularTotalTurnosFuturos = () => {
    const hoy = formatearFecha(new Date());
    let total = 0;
    Object.keys(reservasPorDia).forEach(fechaStr => {
      if (fechaStr >= hoy) {
        total += reservasPorDia[fechaStr] || 0;
      }
    });
    return total;
  };

  // Función personalizada para el contenido de cada día
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const fechaStr = formatearFecha(date);
      const cantidad = reservasPorDia[fechaStr] || 0;
      
      if (cantidad > 0) {
        return (
          <div className="reservas-badge">
            {cantidad}
          </div>
        );
      }
    }
    return null;
  };

  // Función para marcar días con reservas y deshabilitar días pasados
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const clases = [];
      const fechaStr = formatearFecha(date);
      const cantidad = reservasPorDia[fechaStr] || 0;
      
      // Normalizar fechas para comparación (solo año, mes, día, sin horas)
      const normalizarFecha = (fecha) => {
        return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      };
      
      // Verificar si este día está seleccionado
      const fechaNormalizada = normalizarFecha(date);
      const selectedDateNormalizada = selectedDate ? normalizarFecha(selectedDate) : null;
      const esSeleccionado = selectedDateNormalizada && 
        fechaNormalizada.getTime() === selectedDateNormalizada.getTime();
      
      // Solo agregar 'dia-con-reservas' si tiene reservas Y NO está seleccionado
      // Cuando está seleccionado, react-calendar ya aplica 'react-calendar__tile--active'
      // y queremos que use el estilo de día activo (fondo azul oscuro)
      if (cantidad > 0 && !esSeleccionado) {
        clases.push('dia-con-reservas');
      }
      
      // Marcar días pasados
      if (esFechaPasada(date)) {
        clases.push('dia-pasado');
      }
      
      return clases.length > 0 ? clases.join(' ') : null;
    }
    return null;
  };

  // Deshabilitar días pasados
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      // Verificar si la fecha es pasada comparando año, mes y día
      // Esto funciona correctamente para cualquier mes
      return esFechaPasada(date);
    }
    return false;
  };

  // Navegar al mes anterior (solo si no es el mes actual o anterior)
  const mesAnterior = () => {
    const nuevaFecha = new Date(date);
    nuevaFecha.setMonth(date.getMonth() - 1);
    // Solo permitir si no es un mes anterior al actual
    if (!esMesAnterior(nuevaFecha)) {
      setDate(nuevaFecha);
    }
  };

  // Navegar al mes siguiente
  const mesSiguiente = () => {
    const nuevaFecha = new Date(date);
    nuevaFecha.setMonth(date.getMonth() + 1);
    setDate(nuevaFecha);
  };

  // Obtener nombre del mes en español
  const obtenerNombreMes = (fecha) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[fecha.getMonth()];
  };

  // Manejar clic en un día del calendario
  const handleDateClick = (clickedDate) => {
    // Normalizar la fecha para comparación (solo año, mes, día)
    const normalizarFecha = (fecha) => {
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    };
    
    const fechaNormalizada = normalizarFecha(clickedDate);
    const selectedNormalizada = selectedDate ? normalizarFecha(selectedDate) : null;
    
    // Si se hace clic en el mismo día, deseleccionar
    if (selectedNormalizada && 
        selectedNormalizada.getTime() === fechaNormalizada.getTime()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(fechaNormalizada);
    }
  };

  // Formatear fecha para mostrar
  const formatearFechaMostrar = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const diaSemana = dias[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${diaSemana}, ${dia} de ${mes} de ${año}`;
  };

  // Manejar cancelar turno
  const handleCancelarTurno = (reserva) => {
    setReservaSeleccionada(reserva);
    setShowCancelarModal(true);
  };

  const handleConfirmarCancelar = async (nota, setIsLoading) => {
    try {
      if (setIsLoading) setIsLoading(true);
      await reservasService.cancelarReserva(reservaSeleccionada.id, nota, establecimiento);
      // Recargar las reservas del día
      if (selectedDate) {
        await cargarReservasDelDia(selectedDate);
      }
      // Recargar el mes para actualizar los contadores
      const profesionalId = modoVisualizacion === 'personal' && profesionalSeleccionado 
        ? profesionalSeleccionado.id 
        : null;
      await cargarReservasDelMes(date, profesionalId);
      setShowCancelarModal(false);
      setReservaSeleccionada(null);
      setNotification({ message: 'Turno cancelado exitosamente', type: 'success' });
    } catch (err) {
      console.error('Error al cancelar turno:', err);
      setNotification({ message: 'Error al cancelar el turno. Por favor intenta nuevamente.', type: 'error' });
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  // Manejar enviar email
  const handleEnviarEmail = (reserva) => {
    setReservaSeleccionada(reserva);
    setShowEmailModal(true);
  };

  const handleModificarTurno = (reserva) => {
    setReservaSeleccionada(reserva);
    setShowModificarModal(true);
  };

  const handleModificarTurnoSuccess = async () => {
    setReservaSeleccionada(null);
    setNotification({ message: 'Turno modificado correctamente', type: 'success' });
    if (selectedDate) await cargarReservasDelDia(selectedDate);
    const profesionalId = modoVisualizacion === 'personal' && profesionalSeleccionado ? profesionalSeleccionado.id : null;
    await cargarReservasDelMes(date, profesionalId);
  };

  // Manejar cancelar todos los turnos del día
  const handleCancelarTodosLosTurnos = () => {
    if (!selectedDate || reservasDelDia.length === 0) return;
    setShowConfirmarCancelarTodosModal(true);
  };

  const handleConfirmarCancelarTodos = async () => {
    if (!selectedDate || reservasDelDia.length === 0) return;
    
    // Guardar una copia de las reservas antes de cancelar
    const reservasACancelar = [...reservasDelDia];
    const cantidadTurnos = reservasACancelar.length;
    const fechaStr = formatearFecha(selectedDate);
    
    // ACTUALIZACIÓN OPTIMISTA: Eliminar turnos de la UI inmediatamente
    setReservasDelDia([]);
    setReservasPorDia(prev => ({
      ...prev,
      [fechaStr]: 0
    }));
    
    // Cerrar el modal
    setShowConfirmarCancelarTodosModal(false);
    
    // Mostrar notificación inmediatamente
    setTimeout(() => {
      setNotification({ 
        message: `${cantidadTurnos} turno${cantidadTurnos > 1 ? 's' : ''} eliminado${cantidadTurnos > 1 ? 's' : ''} correctamente!`, 
        type: 'success' 
      });
    }, 200);
    
    // Procesar cancelaciones en segundo plano (sin bloquear la UI ni mostrar loading)
    (async () => {
      try {
        // Cancelar todos los turnos del día en paralelo
        // Los emails se enviarán en segundo plano desde el backend
        const promesasCancelacion = reservasACancelar.map(reserva => 
          reservasService.cancelarReserva(reserva.id, 'Cancelación masiva de todos los turnos del día', establecimiento)
            .catch(err => {
              console.error(`Error al cancelar reserva ${reserva.id}:`, err);
              return { error: true, id: reserva.id };
            })
        );
        
        // Esperar a que todas las cancelaciones se completen (en segundo plano)
        await Promise.allSettled(promesasCancelacion);
        
        // Recargar los datos en segundo plano para sincronizar (sin mostrar loading)
        await cargarReservasDelDia(selectedDate);
        
        // Recargar el mes para actualizar los contadores
        const profesionalId = modoVisualizacion === 'personal' && profesionalSeleccionado 
          ? profesionalSeleccionado.id 
          : null;
        await cargarReservasDelMes(date, profesionalId);
      } catch (err) {
        console.error('Error al cancelar todos los turnos:', err);
        // Solo mostrar error si realmente falló algo crítico
        // No interrumpir la experiencia del usuario
      }
    })();
  };

  const handleConfirmarEnviarEmail = async (asunto, mensaje) => {
    try {
      await reservasService.enviarEmailACliente(reservaSeleccionada.id, asunto, mensaje);
      setShowEmailModal(false);
      setReservaSeleccionada(null);
      setNotification({ message: 'Email enviado exitosamente', type: 'success' });
    } catch (err) {
      console.error('Error al enviar email:', err);
      setNotification({ message: 'Error al enviar el email. Por favor intenta nuevamente.', type: 'error' });
    }
  };

  // Manejar selección de modo de visualización
  const handleSeleccionarModo = (modo) => {
    setModoVisualizacion(modo);
    setProfesionalSeleccionado(null);
    setSelectedDate(null);
    setReservasDelDia([]);
    if (modo === 'general') {
      // Cargar reservas generales inmediatamente
      cargarReservasDelMes(date, null);
    }
  };

  // Manejar selección de profesional
  const handleSeleccionarProfesional = (profesional) => {
    setProfesionalSeleccionado(profesional);
    // Cargar reservas del profesional seleccionado
    cargarReservasDelMes(date, profesional.id);
  };

  // Volver a la selección de modo
  const handleVolverAModo = () => {
    setModoVisualizacion(null);
    setProfesionalSeleccionado(null);
    setSelectedDate(null);
    setReservasDelDia([]);
    setReservasPorDia({});
  };

  return (
    <div className="negocio-page">
      <div className="negocio-page-container">
        <h1>Turnos Reservados</h1>
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Selección de modo de visualización */}
        {modoVisualizacion === null && (
          <div className="modo-seleccion-container">
            <h2>Selecciona cómo quieres ver los turnos:</h2>
            <div className="modo-opciones">
              <button 
                className="modo-opcion-btn"
                onClick={() => handleSeleccionarModo('personal')}
              >
                Seleccionar Personal
              </button>
              <button 
                className="modo-opcion-btn"
                onClick={() => handleSeleccionarModo('general')}
              >
                Seleccionar General
              </button>
            </div>
          </div>
        )}

        {/* Selección de profesional */}
        {modoVisualizacion === 'personal' && !profesionalSeleccionado && (
          <div className="profesionales-container">
            <div className="profesionales-header">
              <button 
                className="btn-volver"
                onClick={handleVolverAModo}
              >
                ← Volver
              </button>
              <h2>Selecciona un profesional:</h2>
            </div>
            <div className="profesionales-grid">
              {team.map((profesional) => (
                <div 
                  key={profesional.id}
                  className="profesional-card"
                  onClick={() => handleSeleccionarProfesional(profesional)}
                >
                  <div className="profesional-avatar">
                    {profesional.avatar ? (
                      <img src={profesional.avatar} alt={profesional.name} />
                    ) : (
                      <div className="profesional-avatar-placeholder">
                        {profesional.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="profesional-nombre">{profesional.name}</h3>
                  {profesional.role && (
                    <p className="profesional-rol">{profesional.role}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendario (solo se muestra si hay un modo seleccionado) */}
        {(modoVisualizacion === 'general' || (modoVisualizacion === 'personal' && profesionalSeleccionado)) && (
          <div className="calendario-container">
            {(modoVisualizacion === 'personal' && profesionalSeleccionado) && (
              <div className="calendario-header-top">
                <button 
                  className="btn-volver"
                  onClick={() => {
                    setProfesionalSeleccionado(null);
                    setSelectedDate(null);
                    setReservasDelDia([]);
                  }}
                >
                  ← Volver a profesionales
                </button>
                <h3 className="profesional-actual">
                  Turnos de: {profesionalSeleccionado.name}
                </h3>
              </div>
            )}
            {modoVisualizacion === 'general' && (
              <div className="calendario-header-top">
                <button 
                  className="btn-volver"
                  onClick={handleVolverAModo}
                >
                  ← Volver
                </button>
                <h3 className="profesional-actual">
                  Todos los turnos del negocio
                </h3>
              </div>
            )}
            <div className="calendario-header">
            {!esMesActual(date) && !esMesAnterior(date) && (
              <button 
                onClick={mesAnterior} 
                className="btn-navegacion"
                disabled={isLoading}
              >
                ← Anterior
              </button>
            )}
            {(esMesActual(date) || esMesAnterior(date)) && <div></div>} {/* Espaciador cuando no hay botón */}
            <h2 className="mes-actual">
              {obtenerNombreMes(date)} {date.getFullYear()}
            </h2>
            <button 
              onClick={mesSiguiente} 
              className="btn-navegacion"
              disabled={isLoading}
            >
              Siguiente →
            </button>
          </div>

          {isLoading ? (
            <div className="loading-calendario">
              <p>Cargando reservas...</p>
            </div>
          ) : (
            <Calendar
              onChange={(newDate) => {
                // No permitir seleccionar días pasados
                if (esFechaPasada(newDate)) {
                  return;
                }
                
                // Crear una nueva fecha normalizada (solo año, mes, día)
                const fechaLocal = new Date(
                  newDate.getFullYear(),
                  newDate.getMonth(),
                  newDate.getDate()
                );
                
                // Si el mes o año cambió, actualizar el mes
                const mesCambio = fechaLocal.getMonth() !== date.getMonth();
                const añoCambio = fechaLocal.getFullYear() !== date.getFullYear();
                if (mesCambio || añoCambio) {
                  setDate(fechaLocal);
                }
                // Siempre actualizar el día seleccionado
                handleDateClick(fechaLocal);
              }}
              value={selectedDate || date}
              view="month"
              tileContent={tileContent}
              tileClassName={tileClassName}
              tileDisabled={tileDisabled}
              locale="es"
              showNeighboringMonth={false}
              minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())} // No permitir seleccionar fechas pasadas
              formatShortWeekday={(locale, date) => {
                const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
                return weekdays[date.getDay()];
              }}
            />
          )}

          <div className="calendario-leyenda">
            <div className="leyenda-item">
              <span className="leyenda-badge">
                {selectedDate 
                  ? (reservasPorDia[formatearFecha(selectedDate)] || 0)
                  : calcularTotalTurnosFuturos()}
              </span>
              <span>
                {selectedDate 
                  ? 'Turnos reservados para este día'
                  : 'Total de turnos desde hoy en adelante'}
              </span>
            </div>
          </div>
        </div>
        )}

        {/* Sección de reservas del día seleccionado */}
        {selectedDate && (modoVisualizacion === 'general' || (modoVisualizacion === 'personal' && profesionalSeleccionado)) && (
          <div className="reservas-dia-container">
            <h2 className="reservas-dia-titulo">
              Turnos del {formatearFechaMostrar(selectedDate)}
            </h2>
            
            {/* Botón para cancelar todos los turnos del día */}
            {!isLoadingReservas && reservasDelDia.length > 0 && (
              <div className="cancelar-todos-container">
                <button 
                  className="btn-cancelar-todos"
                  onClick={handleCancelarTodosLosTurnos}
                >
                  Cancelar todos los turnos del día
                </button>
              </div>
            )}
            
            {isLoadingReservas ? (
              <div className="loading-reservas">
                <p>Cargando turnos...</p>
              </div>
            ) : reservasDelDia.length === 0 ? (
              <div className="sin-reservas">
                <p>No hay turnos solicitados para este día</p>
              </div>
            ) : (
              <div className="reservas-lista">
                {reservasDelDia.map((reserva) => (
                  <div key={reserva.id} className="reserva-card">
                    <div className="reserva-info">
                      <div className="reserva-campo">
                        <span className="reserva-label">Horario:</span>
                        <span className="reserva-valor">{reserva.hora}</span>
                      </div>
                      <div className="reserva-campo">
                        <span className="reserva-label">Servicio:</span>
                        <span className="reserva-valor">{reserva.servicio?.name || 'N/A'}</span>
                      </div>
                      {reserva.servicio?.price && (
                        <div className="reserva-campo">
                          <span className="reserva-label">Precio:</span>
                          <span className="reserva-valor reserva-precio">{reserva.servicio.price}</span>
                        </div>
                      )}
                      <div className="reserva-campo">
                        <span className="reserva-label">Profesional:</span>
                        <span className="reserva-valor">{reserva.profesional?.name || 'N/A'}</span>
                      </div>
                      <div className="reserva-campo">
                        <span className="reserva-label">Email:</span>
                        <span className="reserva-valor">{reserva.usuarioEmail}</span>
                      </div>
                      <div className="reserva-campo">
                        <span className="reserva-label">Nombre:</span>
                        <span className="reserva-valor">
                          {reserva.usuarioNombre || reserva.usuarioApellido
                            ? `${reserva.usuarioNombre || ''} ${reserva.usuarioApellido || ''}`.trim()
                            : '(Nombre no disponible)'}
                        </span>
                      </div>
                      {reserva.notas && reserva.notas.trim() !== '' && (
                        <div className="reserva-campo reserva-notas">
                          <span className="reserva-label">Nota:</span>
                          <span className="reserva-valor">{reserva.notas}</span>
                        </div>
                      )}
                    </div>
                    <div className="reserva-acciones">
                      <button 
                        className="btn-reserva btn-modificar-turno"
                        onClick={() => handleModificarTurno(reserva)}
                      >
                        Modificar turno
                      </button>
                      <button 
                        className="btn-reserva btn-cancelar-turno"
                        onClick={() => handleCancelarTurno(reserva)}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="btn-reserva btn-enviar-email"
                        onClick={() => handleEnviarEmail(reserva)}
                      >
                        Enviar Mail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modales */}
        <CancelarTurnoModal
          isOpen={showCancelarModal}
          onClose={() => {
            setShowCancelarModal(false);
            setReservaSeleccionada(null);
          }}
          reserva={reservaSeleccionada}
          onConfirm={handleConfirmarCancelar}
        />

        <EnviarEmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setReservaSeleccionada(null);
          }}
          reserva={reservaSeleccionada}
          onConfirm={handleConfirmarEnviarEmail}
        />

        <ModificarTurnoModal
          isOpen={showModificarModal}
          onClose={() => {
            setShowModificarModal(false);
            setReservaSeleccionada(null);
          }}
          reserva={reservaSeleccionada}
          establecimiento={establecimiento}
          onSuccess={handleModificarTurnoSuccess}
        />

        <ConfirmarCancelarTodosModal
          isOpen={showConfirmarCancelarTodosModal}
          onClose={() => setShowConfirmarCancelarTodosModal(false)}
          onConfirm={handleConfirmarCancelarTodos}
          cantidadTurnos={reservasDelDia.length}
          fecha={selectedDate ? formatearFechaMostrar(selectedDate) : null}
        />

        {/* Notificación */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TurnosReservados;
