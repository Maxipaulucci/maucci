import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../../context/AuthContext';
import { reservasService } from '../../services/api';
import './NegocioPage.css';
import './TurnosReservados.css';

const Resumen = () => {
  const { user } = useAuth();
  // Inicializar con el primer día del mes actual
  const hoy = new Date();
  const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const [date, setDate] = useState(mesActual); // Fecha del mes actual
  const [selectedDate, setSelectedDate] = useState(null); // Día seleccionado en el calendario
  const [modoSeleccion, setModoSeleccion] = useState('dia'); // 'dia', 'dias', 'semana' o 'mes'
  const [diasSeleccionados, setDiasSeleccionados] = useState([]); // Array de fechas seleccionadas (máximo 7 para semana, máximo 31 para días)
  const [mesSeleccionado, setMesSeleccionado] = useState(null); // Mes seleccionado para modo mes
  const [reservasPorDia, setReservasPorDia] = useState({});
  const [reservasDelDia, setReservasDelDia] = useState([]);
  const [reservasSemana, setReservasSemana] = useState({}); // Objeto con fecha como clave y array de reservas como valor
  const [reservasMes, setReservasMes] = useState({}); // Objeto con fecha como clave y array de reservas como valor para el mes
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const [error, setError] = useState('');

  // Obtener código del negocio
  const establecimiento = 'barberia_clasica';

  // Cargar reservas del mes actual
  useEffect(() => {
    cargarReservasDelMes(date);
    
    // Si estamos en modo "mes", actualizar los días seleccionados cuando cambia el mes
    if (modoSeleccion === 'mes') {
      const año = date.getFullYear();
      const mes = date.getMonth();
      const diasEnMes = new Date(año, mes + 1, 0).getDate();
      const todosLosDias = [];
      for (let i = 1; i <= diasEnMes; i++) {
        todosLosDias.push(new Date(año, mes, i));
      }
      setDiasSeleccionados(todosLosDias);
      setMesSeleccionado(new Date(año, mes, 1));
    }
  }, [date, modoSeleccion]);

  // Cargar reservas según el modo seleccionado
  useEffect(() => {
    if (modoSeleccion === 'dia' && selectedDate) {
      cargarReservasDelDia(selectedDate);
    } else if ((modoSeleccion === 'semana' || modoSeleccion === 'dias') && diasSeleccionados.length > 0) {
      cargarReservasSemana(diasSeleccionados);
    } else if (modoSeleccion === 'mes' && diasSeleccionados.length > 0) {
      // En modo mes, usar el primer día para obtener el mes
      const primerDia = diasSeleccionados[0];
      if (primerDia) {
        const mes = new Date(primerDia.getFullYear(), primerDia.getMonth(), 1);
        cargarReservasMes(mes);
      }
    } else {
      setReservasDelDia([]);
      setReservasSemana({});
      setReservasMes({});
    }
  }, [selectedDate, modoSeleccion, diasSeleccionados, mesSeleccionado]);

  const cargarReservasDelMes = async (fecha) => {
    setIsLoading(true);
    setError('');
    try {
      const año = fecha.getFullYear();
      const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11
      
      // Obtener todas las reservas del mes
      const response = await reservasService.obtenerReservasPorMes(establecimiento, año, mes);
      const reservas = response.data?.reservas || response.reservas || [];
      
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
      
      const response = await reservasService.obtenerReservas(
        establecimiento, 
        fechaStr,
        null // Sin filtro de profesional
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

  const cargarReservasSemana = async (fechas) => {
    setIsLoadingReservas(true);
    try {
      const reservasPorFecha = {};
      
      // Cargar reservas para cada día seleccionado
      await Promise.all(
        fechas.map(async (fecha) => {
          const fechaStr = formatearFecha(fecha);
          try {
            const response = await reservasService.obtenerReservas(
              establecimiento,
              fechaStr,
              null
            );
            const reservas = response.data || response || [];
            reservasPorFecha[fechaStr] = reservas;
          } catch (err) {
            console.error(`Error al cargar reservas del día ${fechaStr}:`, err);
            reservasPorFecha[fechaStr] = [];
          }
        })
      );
      
      setReservasSemana(reservasPorFecha);
    } catch (err) {
      console.error('Error al cargar reservas de la semana:', err);
      setReservasSemana({});
    } finally {
      setIsLoadingReservas(false);
    }
  };

  const cargarReservasMes = async (fecha) => {
    setIsLoadingReservas(true);
    try {
      const año = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      
      // Obtener todas las reservas del mes
      const response = await reservasService.obtenerReservasPorMes(establecimiento, año, mes);
      const reservas = response.data?.reservas || response.reservas || [];
      
      // Agrupar reservas por día
      const reservasPorFecha = {};
      reservas.forEach(reserva => {
        const fechaReserva = new Date(reserva.fecha);
        const fechaStr = formatearFecha(fechaReserva);
        if (!reservasPorFecha[fechaStr]) {
          reservasPorFecha[fechaStr] = [];
        }
        reservasPorFecha[fechaStr].push(reserva);
      });
      
      setReservasMes(reservasPorFecha);
    } catch (err) {
      console.error('Error al cargar reservas del mes:', err);
      setReservasMes({});
    } finally {
      setIsLoadingReservas(false);
    }
  };

  // Función para formatear fecha como YYYY-MM-DD (sin problemas de zona horaria)
  const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
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

  // Verificar si el mes es el mes actual
  const esMesActual = (fecha) => {
    const hoy = new Date();
    return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth();
  };

  // Función para cambiar de mes
  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(date);
    nuevoMes.setMonth(date.getMonth() + direccion);
    
    // Verificar límites: enero 2024 - diciembre 2026
    const añoMinimo = 2024;
    const mesMinimo = 0; // Enero
    const añoMaximo = 2026;
    const mesMaximo = 11; // Diciembre
    
    const añoNuevo = nuevoMes.getFullYear();
    const mesNuevo = nuevoMes.getMonth();
    
    // Si está fuera de los límites, no cambiar
    if (añoNuevo < añoMinimo || (añoNuevo === añoMinimo && mesNuevo < mesMinimo)) {
      return; // No permitir ir antes de enero 2024
    }
    if (añoNuevo > añoMaximo || (añoNuevo === añoMaximo && mesNuevo > mesMaximo)) {
      return; // No permitir ir después de diciembre 2026
    }
    
    setDate(nuevoMes);
    setSelectedDate(null); // Limpiar selección al cambiar de mes
  };

  // Función para obtener el nombre del mes
  const obtenerNombreMes = (fecha) => {
    const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    const año = fecha.getFullYear();
    // Capitalizar la primera letra del mes
    const nombreMesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
    return `${nombreMesCapitalizado} ${año}`;
  };

  // Función para formatear fecha para mostrar
  const formatearFechaMostrar = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Función para calcular la ganancia total del día
  const calcularGananciaTotal = () => {
    return reservasDelDia.reduce((total, reserva) => {
      const precio = reserva.servicio?.price || 0;
      // Si el precio es un string con $, extraer el número
      const precioNumero = typeof precio === 'string' 
        ? parseFloat(precio.replace(/[^0-9.]/g, '')) || 0
        : precio;
      return total + precioNumero;
    }, 0);
  };

  // Función para calcular la ganancia de un día específico
  const calcularGananciaDia = (fechaStr) => {
    let reservas = [];
    if (modoSeleccion === 'semana' || modoSeleccion === 'dias') {
      reservas = reservasSemana[fechaStr] || [];
    } else if (modoSeleccion === 'mes') {
      reservas = reservasMes[fechaStr] || [];
    }
    return reservas.reduce((total, reserva) => {
      const precio = reserva.servicio?.price || 0;
      const precioNumero = typeof precio === 'string' 
        ? parseFloat(precio.replace(/[^0-9.]/g, '')) || 0
        : precio;
      return total + precioNumero;
    }, 0);
  };

  // Función para calcular la ganancia total de la semana
  const calcularGananciaSemana = () => {
    return diasSeleccionados.reduce((total, fecha) => {
      const fechaStr = formatearFecha(fecha);
      return total + calcularGananciaDia(fechaStr);
    }, 0);
  };

  // Función para calcular la ganancia total del mes
  const calcularGananciaMes = () => {
    if (!mesSeleccionado) return 0;
    return Object.values(reservasMes).reduce((total, reservas) => {
      return total + reservas.reduce((suma, reserva) => {
        const precio = reserva.servicio?.price || 0;
        const precioNumero = typeof precio === 'string' 
          ? parseFloat(precio.replace(/[^0-9.]/g, '')) || 0
          : precio;
        return suma + precioNumero;
      }, 0);
    }, 0);
  };

  // Función para obtener todos los días del mes seleccionado
  const obtenerDiasDelMes = () => {
    if (!mesSeleccionado) return [];
    const año = mesSeleccionado.getFullYear();
    const mes = mesSeleccionado.getMonth();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    const dias = [];
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(año, mes, i));
    }
    return dias;
  };

  // Función para obtener el nombre del día
  const obtenerNombreDia = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  // Función para manejar la selección de días en modo semana o días
  const handleDiaClick = (fecha) => {
    if (modoSeleccion !== 'semana' && modoSeleccion !== 'dias') return;
    
    // Normalizar la fecha (solo año, mes, día, sin hora)
    const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const fechaStr = formatearFecha(fechaNormalizada);
    
    if (modoSeleccion === 'semana') {
      // En modo semana, seleccionar automáticamente los 7 días consecutivos a partir del día clickeado
      const semanaCompleta = [];
      for (let i = 0; i < 7; i++) {
        const diaSemana = new Date(fechaNormalizada);
        diaSemana.setDate(fechaNormalizada.getDate() + i);
        semanaCompleta.push(diaSemana);
      }
      setDiasSeleccionados(semanaCompleta);
    } else {
      // En modo días, permitir selección individual (máximo 31 días)
      const index = diasSeleccionados.findIndex(d => formatearFecha(d) === fechaStr);
      
      if (index >= 0) {
        // Deseleccionar el día
        const diasActualizados = diasSeleccionados.filter((_, i) => i !== index);
        // Reordenar después de deseleccionar
        diasActualizados.sort((a, b) => a.getTime() - b.getTime());
        setDiasSeleccionados(diasActualizados);
      } else {
        // Agregar el día (máximo 31 para días)
        if (diasSeleccionados.length < 31) {
          const nuevasFechas = [...diasSeleccionados, fechaNormalizada];
          // Ordenar por fecha de forma ascendente (más antiguo primero)
          nuevasFechas.sort((a, b) => {
            // Normalizar fechas a medianoche para comparación precisa
            const fechaA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
            const fechaB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
            return fechaA.getTime() - fechaB.getTime();
          });
          setDiasSeleccionados(nuevasFechas);
        }
      }
    }
  };

  // Función para obtener datos del gráfico según el modo
  const obtenerDatosGrafico = () => {
    if ((modoSeleccion === 'semana' || modoSeleccion === 'dias') && diasSeleccionados.length > 0) {
      return diasSeleccionados.map(fecha => ({
        fecha,
        fechaStr: formatearFecha(fecha),
        ganancia: calcularGananciaDia(formatearFecha(fecha)),
        label: fecha.getDate().toString() // Mostrar número del día para semana y días
      }));
    } else if (modoSeleccion === 'mes' && mesSeleccionado) {
      const dias = obtenerDiasDelMes();
      return dias.map(fecha => ({
        fecha,
        fechaStr: formatearFecha(fecha),
        ganancia: calcularGananciaDia(formatearFecha(fecha)),
        label: fecha.getDate().toString()
      }));
    }
    return [];
  };

  // Función para obtener la altura máxima del gráfico
  const obtenerAlturaMaxima = () => {
    const datos = obtenerDatosGrafico();
    if (datos.length === 0) return 100;
    const ganancias = datos.map(d => d.ganancia);
    const maxGanancia = Math.max(...ganancias, 1);
    // Usar el valor máximo exacto para que el punto más alto llegue hasta arriba
    return maxGanancia;
  };

  // Función para generar valores de escala del eje Y
  const generarEscalaY = () => {
    const max = obtenerAlturaMaxima();
    if (max === 0) return [0];
    const pasos = 5; // Número de pasos en la escala
    const paso = max / pasos;
    const escala = [];
    // Generar de mayor a menor (arriba a abajo)
    for (let i = pasos; i >= 0; i--) {
      escala.push(Math.round(i * paso * 100) / 100); // Redondear a 2 decimales
    }
    return escala;
  };

  // Función para aplicar clases CSS a los días del calendario
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const fechaStr = formatearFecha(date);
      const tieneReservas = reservasPorDia[fechaStr] > 0;
      const esSeleccionado = modoSeleccion === 'dia' && selectedDate && formatearFecha(selectedDate) === fechaStr;
      const esSeleccionadoSemana = (modoSeleccion === 'semana' || modoSeleccion === 'dias') && diasSeleccionados.some(d => formatearFecha(d) === fechaStr);
      const esMesSeleccionado = modoSeleccion === 'mes' && mesSeleccionado && 
        date.getFullYear() === mesSeleccionado.getFullYear() && 
        date.getMonth() === mesSeleccionado.getMonth();
      
      const clases = [];
      if (tieneReservas) {
        clases.push('dia-con-reservas');
      }
      if (esSeleccionado || esSeleccionadoSemana || esMesSeleccionado) {
        clases.push('react-calendar__tile--active');
      }
      return clases.join(' ');
    }
  };

  // Función para mostrar el badge con cantidad de reservas
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

  return (
    <div className="negocio-page">
      <div className="negocio-page-container">
        <h1>Resumen</h1>
        
        {error && (
          <div className="resenas-error">
            {error}
          </div>
        )}

        {/* Calendario */}
        <div className="calendario-container">
          <div className="calendario-header">
            <div className="calendario-navegacion-izquierda">
              {!(date.getFullYear() === 2024 && date.getMonth() === 0) && (
                <button
                  className="btn-navegacion"
                  onClick={() => cambiarMes(-1)}
                  disabled={isLoading || (date.getFullYear() === 2024 && date.getMonth() === 0)}
                >
                  Mes anterior
                </button>
              )}
            </div>
            <h2 className="mes-actual">{obtenerNombreMes(date)}</h2>
            <div className="calendario-navegacion-derecha">
              <button
                className="btn-navegacion"
                onClick={() => cambiarMes(1)}
                disabled={isLoading || (date.getFullYear() === 2026 && date.getMonth() === 11)}
              >
                Mes siguiente
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-calendario">Cargando calendario...</div>
          ) : (
            <Calendar
              onChange={(fecha) => {
                if (modoSeleccion === 'dia') {
                  setSelectedDate(fecha);
                } else if (modoSeleccion === 'semana' || modoSeleccion === 'dias') {
                  handleDiaClick(fecha);
                } else if (modoSeleccion === 'mes') {
                  // Al hacer clic en un día, cambiar al mes de ese día y seleccionar todos sus días
                  const año = fecha.getFullYear();
                  const mes = fecha.getMonth();
                  const mesCompleto = new Date(año, mes, 1);
                  setDate(mesCompleto);
                  setMesSeleccionado(mesCompleto);
                  
                  // Seleccionar todos los días del mes
                  const diasEnMes = new Date(año, mes + 1, 0).getDate();
                  const todosLosDias = [];
                  for (let i = 1; i <= diasEnMes; i++) {
                    todosLosDias.push(new Date(año, mes, i));
                  }
                  setDiasSeleccionados(todosLosDias);
                }
              }}
              value={modoSeleccion === 'dia' ? selectedDate : null}
              activeStartDate={date}
              onActiveStartDateChange={setDate}
              tileClassName={tileClassName}
              tileContent={tileContent}
              locale="es"
              showNeighboringMonth={false}
              minDate={new Date(2024, 0, 1)}
              maxDate={new Date(2026, 11, 31)}
            />
          )}
        </div>

        {/* Botones de modo de selección */}
        <div className="resumen-modos-container">
          <button
            className={`resumen-modo-btn ${modoSeleccion === 'dia' ? 'active' : ''}`}
            onClick={() => {
              setModoSeleccion('dia');
              setDiasSeleccionados([]);
              setMesSeleccionado(null);
              setSelectedDate(null);
            }}
          >
            Seleccionar día
          </button>
          <button
            className={`resumen-modo-btn ${modoSeleccion === 'dias' ? 'active' : ''}`}
            onClick={() => {
              setModoSeleccion('dias');
              setSelectedDate(null);
              setMesSeleccionado(null);
              setDiasSeleccionados([]);
            }}
          >
            Seleccionar días
          </button>
          <button
            className={`resumen-modo-btn ${modoSeleccion === 'semana' ? 'active' : ''}`}
            onClick={() => {
              setModoSeleccion('semana');
              setSelectedDate(null);
              setMesSeleccionado(null);
              setDiasSeleccionados([]);
            }}
          >
            Seleccionar semana
          </button>
          <button
            className={`resumen-modo-btn ${modoSeleccion === 'mes' ? 'active' : ''}`}
            onClick={() => {
              setModoSeleccion('mes');
              setSelectedDate(null);
              setDiasSeleccionados([]);
              // Seleccionar automáticamente todos los días del mes actual
              const año = date.getFullYear();
              const mes = date.getMonth();
              const diasEnMes = new Date(año, mes + 1, 0).getDate();
              const todosLosDias = [];
              for (let i = 1; i <= diasEnMes; i++) {
                todosLosDias.push(new Date(año, mes, i));
              }
              setDiasSeleccionados(todosLosDias);
              setMesSeleccionado(new Date(año, mes, 1));
            }}
          >
            Seleccionar mes
          </button>
        </div>

        {/* Detalles del día seleccionado */}
        {modoSeleccion === 'dia' && selectedDate && (
          <div className="resumen-dia-container">
            <h2 className="resumen-dia-titulo">
              Turnos del {formatearFechaMostrar(selectedDate)}
            </h2>

            {/* Resumen de ganancia */}
            {isLoadingReservas ? (
              <div className="loading-calendario">Cargando reservas...</div>
            ) : (
              <>
                <div className="resumen-resumen">
                  <div className="resumen-ganancia">
                    <span className="resumen-ganancia-label">Ganancia:</span>
                    <span className="resumen-ganancia-valor">
                      ${calcularGananciaTotal().toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Lista de turnos del día */}
                {reservasDelDia.length === 0 ? (
                  <p className="resenas-empty">No hubo actividad este día</p>
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
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Detalles de la semana o días seleccionados */}
        {(modoSeleccion === 'semana' || modoSeleccion === 'dias') && diasSeleccionados.length > 0 && (
          <div className="resumen-semana-container">
            <h2 className="resumen-dia-titulo">
              Resumen de {diasSeleccionados.length} día{diasSeleccionados.length > 1 ? 's' : ''} seleccionado{diasSeleccionados.length > 1 ? 's' : ''}
              {modoSeleccion === 'dias' && ` (máximo 31 días)`}
            </h2>

            {isLoadingReservas ? (
              <div className="loading-calendario">Cargando reservas...</div>
            ) : (
              <>
                {/* Resumen de ganancia total */}
                <div className="resumen-resumen">
                  <div className="resumen-ganancia">
                    <span className="resumen-ganancia-label">Ganancia total:</span>
                    <span className="resumen-ganancia-valor">
                      ${calcularGananciaSemana().toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Gráfico de líneas */}
                {diasSeleccionados.length > 0 && (
                  <div className="resumen-grafico-container">
                    <div className="resumen-grafico-lineas">
                      <div className="resumen-grafico-eje-y">
                        <span className="resumen-eje-y-label">$</span>
                        <div className="resumen-eje-y-escala">
                          {generarEscalaY().map((valor, index) => (
                            <span key={index}>{valor.toLocaleString('es-AR')}</span>
                          ))}
                        </div>
                      </div>
                      <div className="resumen-grafico-area">
                        <svg className="resumen-grafico-svg" viewBox="0 -15 1000 330" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Área bajo la línea */}
                          <path
                            className="resumen-grafico-area-path"
                            d={(() => {
                              const datos = obtenerDatosGrafico();
                              if (datos.length === 0) return '';
                              const alturaMaxima = obtenerAlturaMaxima();
                              const ancho = 1000;
                              const alto = 300;
                              const paddingTop = 15;
                              const pasoX = datos.length > 1 ? ancho / (datos.length - 1) : 0;
                              
                              let path = `M 0 ${alto + paddingTop}`;
                              datos.forEach((dato, index) => {
                                const x = index * pasoX;
                                const y = paddingTop + alto - (dato.ganancia / alturaMaxima) * alto;
                                path += ` L ${x} ${y}`;
                              });
                              path += ` L ${ancho} ${alto + paddingTop} Z`;
                              return path;
                            })()}
                            fill="url(#lineGradient)"
                          />
                          {/* Línea */}
                          <path
                            className="resumen-grafico-linea"
                            d={(() => {
                              const datos = obtenerDatosGrafico();
                              if (datos.length === 0) return '';
                              const alturaMaxima = obtenerAlturaMaxima();
                              const ancho = 1000;
                              const alto = 300;
                              const paddingTop = 15;
                              const pasoX = datos.length > 1 ? ancho / (datos.length - 1) : 0;
                              
                              let path = '';
                              datos.forEach((dato, index) => {
                                const x = index * pasoX;
                                const y = paddingTop + alto - (dato.ganancia / alturaMaxima) * alto;
                                if (index === 0) {
                                  path = `M ${x} ${y}`;
                                } else {
                                  path += ` L ${x} ${y}`;
                                }
                              });
                              return path;
                            })()}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                          />
                          {/* Puntos con ganancia visible */}
                          {obtenerDatosGrafico().map((dato, index) => {
                            const alturaMaxima = obtenerAlturaMaxima();
                            const ancho = 1000;
                            const alto = 300;
                            const paddingTop = 15;
                            const pasoX = obtenerDatosGrafico().length > 1 ? ancho / (obtenerDatosGrafico().length - 1) : 0;
                            const x = index * pasoX;
                            const y = paddingTop + alto - (dato.ganancia / alturaMaxima) * alto;
                            
                            return (
                              <g key={index} className="resumen-grafico-punto-grupo">
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="5"
                                  fill="#3b82f6"
                                  stroke="white"
                                  strokeWidth="2"
                                  className="resumen-grafico-punto"
                                />
                                {dato.ganancia > 0 && (
                                  <text
                                    x={x}
                                    y={y - 10}
                                    className="resumen-grafico-valor"
                                    textAnchor="middle"
                                  >
                                    ${dato.ganancia.toLocaleString('es-AR')}
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </svg>
                        <div className="resumen-grafico-eje-x">
                          {obtenerDatosGrafico().map((dato, index) => (
                            <span key={index} className="resumen-eje-x-label">
                              {dato.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desglose día por día */}
                <div className="resumen-desglose">
                  {diasSeleccionados.map((fecha) => {
                    const fechaStr = formatearFecha(fecha);
                    const ganancia = calcularGananciaDia(fechaStr);
                    // Formatear fecha como "4 de diciembre"
                    const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long' 
                    });
                    
                    return (
                      <div key={fechaStr} className="resumen-desglose-item">
                        <span className="resumen-desglose-dia">{fechaFormateada}:</span>
                        <span className="resumen-desglose-ganancia">
                          ${ganancia.toLocaleString('es-AR')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Detalles del mes seleccionado */}
        {modoSeleccion === 'mes' && mesSeleccionado && (
          <div className="resumen-semana-container">
            <h2 className="resumen-dia-titulo">
              Resumen de {obtenerNombreMes(mesSeleccionado)}
            </h2>

            {isLoadingReservas ? (
              <div className="loading-calendario">Cargando reservas...</div>
            ) : (
              <>
                {/* Resumen de ganancia total */}
                <div className="resumen-resumen">
                  <div className="resumen-ganancia">
                    <span className="resumen-ganancia-label">Ganancia total:</span>
                    <span className="resumen-ganancia-valor">
                      ${calcularGananciaMes().toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Gráfico de líneas */}
                {obtenerDatosGrafico().length > 0 && (
                  <div className="resumen-grafico-container">
                    <div className="resumen-grafico-lineas">
                      <div className="resumen-grafico-eje-y">
                        <span className="resumen-eje-y-label">$</span>
                        <div className="resumen-eje-y-escala">
                          {generarEscalaY().map((valor, index) => (
                            <span key={index}>{valor.toLocaleString('es-AR')}</span>
                          ))}
                        </div>
                      </div>
                      <div className="resumen-grafico-area">
                        <svg className="resumen-grafico-svg" viewBox="0 -15 1000 330" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="lineGradientMes" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Área bajo la línea */}
                          <path
                            className="resumen-grafico-area-path"
                            d={(() => {
                              const datos = obtenerDatosGrafico();
                              if (datos.length === 0) return '';
                              const alturaMaxima = obtenerAlturaMaxima();
                              const ancho = 1000;
                              const alto = 300;
                              const paddingTop = 15;
                              const pasoX = datos.length > 1 ? ancho / (datos.length - 1) : 0;
                              
                              let path = `M 0 ${alto + paddingTop}`;
                              datos.forEach((dato, index) => {
                                const x = index * pasoX;
                                const y = paddingTop + alto - (dato.ganancia / alturaMaxima) * alto;
                                path += ` L ${x} ${y}`;
                              });
                              path += ` L ${ancho} ${alto + paddingTop} Z`;
                              return path;
                            })()}
                            fill="url(#lineGradientMes)"
                          />
                          {/* Línea */}
                          <path
                            className="resumen-grafico-linea"
                            d={(() => {
                              const datos = obtenerDatosGrafico();
                              if (datos.length === 0) return '';
                              const alturaMaxima = obtenerAlturaMaxima();
                              const ancho = 1000;
                              const alto = 300;
                              const paddingTop = 15;
                              const pasoX = datos.length > 1 ? ancho / (datos.length - 1) : 0;
                              
                              let path = '';
                              datos.forEach((dato, index) => {
                                const x = index * pasoX;
                                const y = paddingTop + alto - (dato.ganancia / alturaMaxima) * alto;
                                if (index === 0) {
                                  path = `M ${x} ${y}`;
                                } else {
                                  path += ` L ${x} ${y}`;
                                }
                              });
                              return path;
                            })()}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                          />
                          {/* Puntos con ganancia visible */}
                          {obtenerDatosGrafico().map((dato, index) => {
                            const alturaMaxima = obtenerAlturaMaxima();
                            const ancho = 1000;
                            const alto = 300;
                            const paddingTop = 15;
                            const pasoX = obtenerDatosGrafico().length > 1 ? ancho / (obtenerDatosGrafico().length - 1) : 0;
                            const x = index * pasoX;
                            const y = paddingTop + alto - (dato.ganancia / alturaMaxima) * alto;
                            
                            return (
                              <g key={index} className="resumen-grafico-punto-grupo">
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="5"
                                  fill="#3b82f6"
                                  stroke="white"
                                  strokeWidth="2"
                                  className="resumen-grafico-punto"
                                />
                                {dato.ganancia > 0 && (
                                  <text
                                    x={x}
                                    y={y - 10}
                                    className="resumen-grafico-valor"
                                    textAnchor="middle"
                                  >
                                    ${dato.ganancia.toLocaleString('es-AR')}
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </svg>
                        <div className="resumen-grafico-eje-x">
                          {obtenerDatosGrafico().map((dato, index) => (
                            <span key={index} className="resumen-eje-x-label">
                              {dato.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resumen;


