import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../../context/AuthContext';
import { reservasService, horariosBloqueadosService, negociosService, personalService, diasCanceladosService } from '../../services/api';
import { services } from '../../barberia/data/sampleData';
import Notification from '../../components/shared/Notification';
import './NegocioPage.css';
import './TurnosReservados.css';

const Horarios = () => {
  const { user } = useAuth();
  const establecimiento = 'barberia_clasica';
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
  
  // Inicializar con el primer día del mes actual
  const hoy = new Date();
  const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const [date, setDate] = useState(mesActual);
  
  // Calcular la fecha máxima (último día del mes siguiente)
  const ultimoDiaMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
  const maxDate = ultimoDiaMesSiguiente;
  const [selectedDate, setSelectedDate] = useState(null);
  const [modoSeleccion, setModoSeleccion] = useState('dia'); // 'dia', 'dias' o 'mes'
  const [diasSeleccionados, setDiasSeleccionados] = useState([]); // Array de fechas seleccionadas (máximo 31 para días)
  const [mesSeleccionado, setMesSeleccionado] = useState(null); // Mes seleccionado para modo mes
  const [diaActivoMultiples, setDiaActivoMultiples] = useState(null); // Día activo cuando hay múltiples días seleccionados
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [esGeneral, setEsGeneral] = useState(false); // Indica si se seleccionó "General"
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horariosBloqueados, setHorariosBloqueados] = useState([]);
  const [horaLimite, setHoraLimite] = useState('20:00'); // Hora límite predeterminada
  const [horaMinima, setHoraMinima] = useState('08:00'); // Hora mínima predeterminada
  const [configuracionCargada, setConfiguracionCargada] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading para horarios
  const [isLoadingCalendario, setIsLoadingCalendario] = useState(false); // Loading para calendario
  const [error, setError] = useState('');
  const [horariosEliminados, setHorariosEliminados] = useState(new Set()); // Horarios eliminados localmente
  const [horaLimiteManual, setHoraLimiteManual] = useState(false); // Indica si el usuario cambió manualmente la hora límite
  const [diaCancelado, setDiaCancelado] = useState(false); // Indica si el día seleccionado está cancelado
  const [diasCancelados, setDiasCancelados] = useState([]); // Lista de días cancelados
  const [diaNoLaborable, setDiaNoLaborable] = useState(false); // Día bloqueado por defecto (ej. domingos)
  const [domingosRestaurados, setDomingosRestaurados] = useState(new Set()); // Domingos restaurados manualmente para no bloquearlos
  const [reservasPorDia, setReservasPorDia] = useState({}); // Contador de reservas por día
  const [notification, setNotification] = useState(null); // Notificación para mostrar mensajes

  // Función para formatear fecha como YYYY-MM-DD
  const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Función auxiliar para obtener la fecha activa (para modo 'dia' o primer día en modo 'dias' o 'mes')
  const obtenerFechaActiva = () => {
    if (modoSeleccion === 'dia' && selectedDate) {
      return selectedDate;
    }
    if ((modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0) {
      // Si hay un día activo seleccionado, usarlo (incluso si está cancelado)
      if (diaActivoMultiples) {
        return diaActivoMultiples;
      }
      // Ordenar días seleccionados y devolver el primero (más cercano)
      const diasOrdenados = [...diasSeleccionados].sort((a, b) => a.getTime() - b.getTime());
      return diasOrdenados[0];
    }
    return null;
  };

  // Función auxiliar para verificar si hay días seleccionados
  const hayDiasSeleccionados = () => {
    return (modoSeleccion === 'dia' && selectedDate) || 
           (modoSeleccion === 'dias' && diasSeleccionados.length > 0) ||
           (modoSeleccion === 'mes' && diasSeleccionados.length > 0);
  };

  // Parsear fecha YYYY-MM-DD o ISO string en zona local para evitar desfase a día anterior
  const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    // Si es un objeto Date, extraer solo la fecha
    if (fechaStr instanceof Date) {
      return new Date(fechaStr.getFullYear(), fechaStr.getMonth(), fechaStr.getDate());
    }
    // Si es string, intentar parsear
    if (typeof fechaStr !== 'string') return null;
    // Si es formato ISO (contiene T o Z), extraer solo la parte de fecha
    const fechaParte = fechaStr.split('T')[0].split('Z')[0];
    const partes = fechaParte.split('-');
    if (partes.length !== 3) return null;
    const [a, m, d] = partes.map(Number);
    if (isNaN(a) || isNaN(m) || isNaN(d)) return null;
    return new Date(a, m - 1, d);
  };

  // Función para convertir hora (HH:MM) a minutos desde medianoche
  const horaAMinutos = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  };

  // Función para comparar horas correctamente
  const compararHoras = (hora1, hora2) => {
    return horaAMinutos(hora1) - horaAMinutos(hora2);
  };

  // Función para obtener la hora límite según el día de la semana
  const obtenerHoraLimiteSegunDia = (fecha) => {
    if (!fecha) return '20:00'; // Por defecto lunes a viernes
    
    const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Sábado (6) hasta las 18:00, lunes a viernes (1-5) hasta las 20:00
    if (diaSemana === 6) {
      return '18:00';
    } else if (diaSemana >= 1 && diaSemana <= 5) {
      return '20:00';
    }
    
    // Domingo (0) también hasta las 20:00 por defecto
    return '20:00';
  };

  // Cargar configuración del negocio al iniciar
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const negocioResponse = await negociosService.obtenerNegocio(establecimiento);
        const negocio = negocioResponse.data || negocioResponse;
        
        if (negocio && negocio.horarios) {
          if (negocio.horarios.inicio) {
            setHoraMinima(negocio.horarios.inicio);
          }
        }
        // No cargar hora límite desde el backend, se calculará según el día
        setConfiguracionCargada(true);
      } catch (err) {
        console.error('Error al cargar configuración del negocio:', err);
        setConfiguracionCargada(true); // Marcar como cargada incluso si hay error
      }
    };
    
    cargarConfiguracion();
  }, []);

  // Función auxiliar para regenerar la lista completa de días cancelados
  const regenerarDiasCancelados = async () => {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaDesde = formatearFecha(hoy);
      const response = await diasCanceladosService.obtenerDiasCancelados(establecimiento, fechaDesde);
      const diasServidorRaw = response.data || response || [];

      // Normalizar días provenientes del servidor y filtrar días pasados
      const diasServidor = diasServidorRaw
        .map((d, idx) => {
          const f = parseFechaLocal(d.fecha);
          if (!f || isNaN(f.getTime())) return null;
          // Filtrar días pasados (solo incluir hoy y futuros)
          f.setHours(0, 0, 0, 0);
          if (f < hoy) return null;
          const fStr = formatearFecha(f);
          return {
            ...d,
            id: d.id || `srv-${fStr}-${idx}`,
            fecha: fStr
          };
        })
        .filter(Boolean);

      // Generar domingos del mes visible que no estén restaurados (solo futuros)
      const generarDomingosMes = (fechaBase) => {
        const año = fechaBase.getFullYear();
        const mes = fechaBase.getMonth();
        const diasEnMes = new Date(año, mes + 1, 0).getDate();
        const lista = [];
        for (let i = 1; i <= diasEnMes; i++) {
          const d = new Date(año, mes, i);
          d.setHours(0, 0, 0, 0);
          // Solo incluir domingos que sean hoy o futuros
          if (d.getDay() === 0 && d >= hoy) {
            const fechaStr = formatearFecha(d);
            if (!domingosRestaurados.has(fechaStr)) {
              lista.push({
                id: `auto-${fechaStr}`,
                fecha: fechaStr,
                motivo: 'Día no laborable (domingo)',
                auto: true
              });
            }
          }
        }
        return lista;
      };

      const domingosAuto = generarDomingosMes(date);

      // Evitar duplicados (si el server ya trae ese día)
      const fechasServidor = new Set(diasServidor.map(d => d.fecha));
      const domingosFiltrados = domingosAuto.filter(d => !fechasServidor.has(d.fecha));

      // Filtrar por si queda alguna fecha inválida y asegurar que no sean días pasados
      const listaFinal = [...diasServidor, ...domingosFiltrados].filter(d => {
        const f = parseFechaLocal(d.fecha);
        if (!f || isNaN(f.getTime())) return false;
        f.setHours(0, 0, 0, 0);
        return f >= hoy; // Solo incluir hoy y futuros
      });

      setDiasCancelados(listaFinal);
    } catch (err) {
      console.error('Error al regenerar días cancelados:', err);
      setDiasCancelados([]);
    }
  };

  // Función para cargar reservas del mes
  const cargarReservasDelMes = async (fecha) => {
    try {
      const año = fecha.getFullYear();
      const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11
      
      // Obtener todas las reservas del mes (sin filtrar por profesional, para ver todo el negocio)
      const response = await reservasService.obtenerReservasPorMes(establecimiento, año, mes);
      let reservas = response.data?.reservas || response.reservas || [];
      
      // Contar reservas por día
      const contadores = {};
      reservas.forEach(reserva => {
        const fechaReserva = parseFechaLocal(reserva.fecha);
        if (fechaReserva && !isNaN(fechaReserva.getTime())) {
          const fechaStr = formatearFecha(fechaReserva);
          contadores[fechaStr] = (contadores[fechaStr] || 0) + 1;
        }
      });
      
      setReservasPorDia(contadores);
    } catch (err) {
      console.error('Error al cargar reservas del mes:', err);
      setReservasPorDia({});
    }
  };

  // Cargar días cancelados al iniciar
  useEffect(() => {
    regenerarDiasCancelados();
  }, [establecimiento, date, domingosRestaurados]);

  // Cargar reservas del mes cuando cambia el mes visible
  useEffect(() => {
    cargarReservasDelMes(date);
  }, [establecimiento, date]);

  // Establecer día activo cuando cambian los días seleccionados en modo 'dias' o 'mes'
  useEffect(() => {
    if ((modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0) {
      // Filtrar días cancelados
      const diasDisponibles = diasSeleccionados.filter(dia => !esDiaCancelado(dia));
      
      // Si no hay día activo, el día activo no está en la lista, o el día activo está cancelado
      if (!diaActivoMultiples || 
          !diasSeleccionados.some(d => formatearFecha(d) === formatearFecha(diaActivoMultiples))) {
        // Priorizar días disponibles, pero si todos están cancelados, usar el primero cancelado
        if (diasDisponibles.length > 0) {
          const diasOrdenados = [...diasDisponibles].sort((a, b) => a.getTime() - b.getTime());
          setDiaActivoMultiples(diasOrdenados[0]);
        } else {
          // Si no hay días disponibles, usar el primer día cancelado para poder mostrar los contenedores
          const diasOrdenados = [...diasSeleccionados].sort((a, b) => a.getTime() - b.getTime());
          setDiaActivoMultiples(diasOrdenados[0]);
        }
      } else if (diaActivoMultiples && esDiaCancelado(diaActivoMultiples) && diasDisponibles.length > 0) {
        // Si el día activo está cancelado pero hay días disponibles, cambiar al primer disponible
        const diasOrdenados = [...diasDisponibles].sort((a, b) => a.getTime() - b.getTime());
        setDiaActivoMultiples(diasOrdenados[0]);
      }
    } else if (modoSeleccion !== 'dias' && modoSeleccion !== 'mes') {
      setDiaActivoMultiples(null);
    }
  }, [diasSeleccionados, modoSeleccion]);

  // Verificar si el día seleccionado está cancelado
  useEffect(() => {
    const verificarDiaCancelado = async () => {
      const fechaActiva = obtenerFechaActiva();
      if (fechaActiva) {
        try {
          const fechaStrSeleccionada = formatearFecha(fechaActiva);
          const esDomingo = fechaActiva.getDay() === 0 && !domingosRestaurados.has(fechaStrSeleccionada);
          setDiaNoLaborable(esDomingo);
          if (esDomingo) {
            setDiaCancelado(true);
            return;
          }

          // Verificar primero en la lista local
          const estaEnListaLocal = diasCancelados.some(d => {
            const fecha = parseFechaLocal(d.fecha);
            if (!fecha || isNaN(fecha.getTime())) return false;
            return formatearFecha(fecha) === fechaStrSeleccionada;
          });
          
          if (estaEnListaLocal) {
            setDiaCancelado(true);
            return;
          }

          // Si no está en la lista local, verificar en el servidor
          const fechaStr = formatearFecha(fechaActiva);
          const response = await diasCanceladosService.verificarDiaCancelado(establecimiento, fechaStr);
          // La respuesta puede venir como { success: true, data: true/false } o directamente true/false
          let esCancelado = false;
          if (response && typeof response === 'object') {
            esCancelado = response.data === true || response.data === 'true';
          } else {
            esCancelado = response === true || response === 'true';
          }
          setDiaCancelado(esCancelado);
        } catch (err) {
          console.error('Error al verificar día cancelado:', err);
          setDiaCancelado(false);
        }
      } else {
        setDiaCancelado(false);
        setDiaNoLaborable(false);
      }
    };
    
    verificarDiaCancelado();
  }, [selectedDate, modoSeleccion, establecimiento, domingosRestaurados, diasCancelados, diaActivoMultiples, diasSeleccionados]);

  // Actualizar hora límite cuando cambia la fecha seleccionada (solo si no fue cambiada manualmente)
  useEffect(() => {
    const fechaActiva = obtenerFechaActiva();
    if (fechaActiva && !horaLimiteManual) {
      const nuevaHoraLimite = obtenerHoraLimiteSegunDia(fechaActiva);
      setHoraLimite(nuevaHoraLimite);
    }
  }, [selectedDate, modoSeleccion, horaLimiteManual, diaActivoMultiples, diasSeleccionados]);

  // Guardar horario mínimo cuando cambia (solo después de cargar la configuración inicial)
  useEffect(() => {
    if (!configuracionCargada) return; // No guardar durante la carga inicial
    
    const guardarHorarioMinimo = async () => {
      try {
        await negociosService.actualizarHorarios(establecimiento, {
          inicio: horaMinima
        });
        console.log('Horario mínimo guardado:', horaMinima);
        // Esperar un momento para que el backend actualice la configuración
        await new Promise(resolve => setTimeout(resolve, 500));
        // Recargar horarios disponibles después de guardar
        if (selectedDate && (profesionalSeleccionado || esGeneral)) {
          await cargarHorariosDisponibles();
        }
      } catch (err) {
        console.error('Error al guardar horario mínimo:', err);
        setError('Error al guardar el horario mínimo: ' + (err.message || 'Error desconocido'));
      }
    };
    
    // Debounce de 1 segundo para evitar múltiples guardados
    const timer = setTimeout(() => {
      guardarHorarioMinimo();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [horaMinima, configuracionCargada]);

  // Cargar horarios disponibles cuando se selecciona día y profesional
  useEffect(() => {
    const fechaActiva = obtenerFechaActiva();
    
    // Cargar horarios si hay días seleccionados y un profesional seleccionado
    if (hayDiasSeleccionados() && fechaActiva && (profesionalSeleccionado || esGeneral)) {
      // Si cambió la fecha y no fue manual, resetear el flag de manual y ajustar hora límite
      if (!horaLimiteManual) {
        const nuevaHoraLimite = obtenerHoraLimiteSegunDia(fechaActiva);
        setHoraLimite(nuevaHoraLimite);
      }
      
      // Primero cargar los horarios bloqueados del servidor, luego los disponibles
      const cargarDatos = async () => {
        await cargarHorariosBloqueados();
        await cargarHorariosDisponibles();
      };
      cargarDatos();
    } else {
      // Si no hay días seleccionados o no hay profesional, limpiar horarios
      setHorariosDisponibles([]);
      setHorariosBloqueados([]);
      setHorariosEliminados(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, diasSeleccionados, diaActivoMultiples, profesionalSeleccionado, esGeneral, horaLimite, horaMinima, modoSeleccion]);

  const cargarHorariosDisponibles = async () => {
    const fechaActiva = obtenerFechaActiva();
    if (!fechaActiva || (!profesionalSeleccionado && !esGeneral)) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Usar el primer servicio como referencia para obtener horarios
      const servicio = services[0];
      
      // Determinar fechas a procesar
      let fechasAProcesar = [];
      if ((modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0) {
        // Filtrar días cancelados
        fechasAProcesar = diasSeleccionados
          .filter(dia => !esDiaCancelado(dia))
          .map(dia => formatearFecha(dia));
      } else {
        fechasAProcesar = [formatearFecha(fechaActiva)];
      }
      
      if (fechasAProcesar.length === 0) {
        setHorariosDisponibles([]);
        setHorariosBloqueados([]);
        setIsLoading(false);
        return;
      }
      
      let horariosFiltrados = [];
      let bloqueados = [];
      
      if (esGeneral) {
        // Modo General: obtener horarios de todos los profesionales y todas las fechas, calcular intersección
        const todasLasPromesas = [];
        
        for (const fechaStr of fechasAProcesar) {
          const promesasPorFecha = team.map(profesional => 
            reservasService.obtenerHorariosDisponibles(
              establecimiento,
              fechaStr,
              profesional.id,
              servicio
            )
          );
          todasLasPromesas.push(...promesasPorFecha);
        }
        
        const respuestas = await Promise.all(todasLasPromesas);
        
        // Agrupar respuestas por fecha
        const horariosPorFechaYProfesional = [];
        let indice = 0;
        for (const fechaStr of fechasAProcesar) {
          const horariosPorProfesional = [];
          for (let i = 0; i < team.length; i++) {
            const resp = respuestas[indice];
            horariosPorProfesional.push(resp.data?.horariosDisponibles || resp.horariosDisponibles || []);
            indice++;
          }
          horariosPorFechaYProfesional.push(horariosPorProfesional);
        }
        
        // Calcular intersección: horarios disponibles para TODOS los profesionales en TODAS las fechas
        if (horariosPorFechaYProfesional.length > 0) {
          // Empezar con los horarios de la primera fecha y primer profesional
          let horariosComunes = new Set(horariosPorFechaYProfesional[0][0]);
          
          // Intersectar con todos los profesionales de todas las fechas
          for (const horariosPorProfesional of horariosPorFechaYProfesional) {
            for (const horariosProf of horariosPorProfesional) {
              const horariosProfSet = new Set(horariosProf);
              horariosComunes = new Set([...horariosComunes].filter(h => horariosProfSet.has(h)));
            }
          }
          
          horariosFiltrados = Array.from(horariosComunes);
        }
        
        // En modo General, no mostrar horarios bloqueados
        bloqueados = [];
      } else {
        // Modo profesional específico: calcular intersección de horarios disponibles en todas las fechas
        const todasLasPromesas = fechasAProcesar.map(fechaStr =>
          reservasService.obtenerHorariosDisponibles(
            establecimiento,
            fechaStr,
            profesionalSeleccionado.id,
            servicio
          )
        );
        
        const respuestas = await Promise.all(todasLasPromesas);
        
        // Obtener horarios disponibles de cada fecha
        const horariosPorFecha = respuestas.map(resp => 
          resp.data?.horariosDisponibles || resp.horariosDisponibles || []
        );
        
        // Calcular intersección: horarios disponibles en TODAS las fechas
        if (horariosPorFecha.length > 0) {
          let horariosComunes = new Set(horariosPorFecha[0]);
          
          for (let i = 1; i < horariosPorFecha.length; i++) {
            const horariosFecha = new Set(horariosPorFecha[i]);
            horariosComunes = new Set([...horariosComunes].filter(h => horariosFecha.has(h)));
          }
          
          horariosFiltrados = Array.from(horariosComunes);
        }
        
        // Para horarios bloqueados, mostrar los que están bloqueados en al menos una fecha
        const bloqueadosPorFecha = respuestas.map(resp => 
          resp.data?.horariosBloqueados || resp.horariosBloqueados || []
        );
        const bloqueadosSet = new Set();
        bloqueadosPorFecha.forEach(bloqueadosFecha => {
          bloqueadosFecha.forEach(hora => bloqueadosSet.add(hora));
        });
        bloqueados = Array.from(bloqueadosSet);
      }
      
      // Obtener la hora límite correcta según el día activo (o el primero si hay múltiples)
      const horaLimiteCorrecta = obtenerHoraLimiteSegunDia(fechaActiva);
      
      // Filtrar horarios según la hora mínima y la hora límite
      const minutosMinima = horaAMinutos(horaMinima);
      const minutosLimite = horaAMinutos(horaLimiteCorrecta);
      
      horariosFiltrados = horariosFiltrados.filter(hora => {
        const minutosHora = horaAMinutos(hora);
        return minutosHora >= minutosMinima && minutosHora <= minutosLimite;
      });
      
      console.log('Horarios recibidos:', horariosFiltrados);
      console.log('Hora mínima configurada:', horaMinima, '(', minutosMinima, 'minutos)');
      console.log('Hora límite configurada:', horaLimiteCorrecta, '(', minutosLimite, 'minutos)');
      console.log('Fechas procesadas:', fechasAProcesar);
      console.log('Horarios filtrados:', horariosFiltrados);
      
      setHorariosDisponibles(horariosFiltrados);
      setHorariosBloqueados(bloqueados);
    } catch (err) {
      console.error('Error al cargar horarios:', err);
      setError('Error al cargar los horarios disponibles');
      setHorariosDisponibles([]);
      setHorariosBloqueados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarHorario = async (hora) => {
    if (!profesionalSeleccionado && !esGeneral) return;
    
    try {
      // Si estamos en modo 'dias' o 'mes', aplicar a todos los días seleccionados (filtrando cancelados)
      let fechasAProcesar = [];
      
      if ((modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0) {
        // Filtrar días cancelados
        fechasAProcesar = diasSeleccionados
          .filter(dia => !esDiaCancelado(dia))
          .map(dia => formatearFecha(dia));
      } else {
        // Modo 'dia': usar solo la fecha activa
        const fechaActiva = obtenerFechaActiva();
        if (!fechaActiva) return;
        fechasAProcesar = [formatearFecha(fechaActiva)];
      }
      
      if (fechasAProcesar.length === 0) return;
      
      // Aplicar el bloqueo a todas las fechas
      const promesas = [];
      
      for (const fechaStr of fechasAProcesar) {
        if (esGeneral) {
          // Bloquear para todos los profesionales
          const promesasProfesionales = team.map(profesional =>
            horariosBloqueadosService.bloquearHorario(
              establecimiento,
              fechaStr,
              hora,
              profesional.id,
              'Bloqueado desde panel de negocio (General)'
            )
          );
          promesas.push(...promesasProfesionales);
        } else {
          promesas.push(
            horariosBloqueadosService.bloquearHorario(
              establecimiento,
              fechaStr,
              hora,
              profesionalSeleccionado.id,
              'Bloqueado desde panel de negocio'
            )
          );
        }
      }
      
      await Promise.all(promesas);
      
      const nuevosEliminados = new Set(horariosEliminados);
      nuevosEliminados.add(hora);
      setHorariosEliminados(nuevosEliminados);
      
      // Actualizar la lista de horarios disponibles
      setHorariosDisponibles(prev => prev.filter(h => h !== hora));
      
      // Recargar horarios bloqueados desde el servidor
      await cargarHorariosBloqueados();
    } catch (err) {
      console.error('Error al bloquear horario:', err);
      setError('Error al bloquear el horario: ' + (err.message || 'Error desconocido'));
    }
  };

  const restaurarHorario = async (hora) => {
    if (!profesionalSeleccionado && !esGeneral) return;
    
    try {
      // Si estamos en modo 'dias' o 'mes', aplicar a todos los días seleccionados (filtrando cancelados)
      let fechasAProcesar = [];
      
      if ((modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0) {
        // Filtrar días cancelados
        fechasAProcesar = diasSeleccionados
          .filter(dia => !esDiaCancelado(dia))
          .map(dia => formatearFecha(dia));
      } else {
        // Modo 'dia': usar solo la fecha activa
        const fechaActiva = obtenerFechaActiva();
        if (!fechaActiva) return;
        fechasAProcesar = [formatearFecha(fechaActiva)];
      }
      
      if (fechasAProcesar.length === 0) return;
      
      // Aplicar el desbloqueo a todas las fechas
      const promesas = [];
      
      for (const fechaStr of fechasAProcesar) {
        if (esGeneral) {
          // Desbloquear para todos los profesionales
          const promesasProfesionales = team.map(profesional =>
            horariosBloqueadosService.desbloquearHorario(
              establecimiento,
              fechaStr,
              hora,
              profesional.id
            )
          );
          promesas.push(...promesasProfesionales);
        } else {
          promesas.push(
            horariosBloqueadosService.desbloquearHorario(
              establecimiento,
              fechaStr,
              hora,
              profesionalSeleccionado.id
            )
          );
        }
      }
      
      await Promise.all(promesas);
      
      const nuevosEliminados = new Set(horariosEliminados);
      nuevosEliminados.delete(hora);
      setHorariosEliminados(nuevosEliminados);
      
      // Recargar horarios disponibles
      await cargarHorariosDisponibles();
      await cargarHorariosBloqueados();
    } catch (err) {
      console.error('Error al desbloquear horario:', err);
      setError('Error al desbloquear el horario: ' + (err.message || 'Error desconocido'));
    }
  };

  // Función para cancelar un día
  const handleCancelarDia = async () => {
    const fechaActiva = obtenerFechaActiva();
    if (!fechaActiva) return;
    
    try {
      const fechaStr = formatearFecha(fechaActiva);
      
      // Validar si hay turnos reservados para este día
      const cantidadTurnos = reservasPorDia[fechaStr] || 0;
      if (cantidadTurnos > 0) {
        setNotification({
          message: `No se puede cancelar este día porque tiene ${cantidadTurnos} turno${cantidadTurnos > 1 ? 's' : ''} reservado${cantidadTurnos > 1 ? 's' : ''}. Debe cancelar primero los turnos desde "Turnos reservados" y luego podrá cancelar el día.`,
          type: 'error'
        });
        return;
      }
      
      // Si era un domingo restaurado y se cancela de nuevo, quitar de restaurados
      if (fechaActiva.getDay() === 0) {
        setDomingosRestaurados((prev) => {
          const nuevo = new Set(prev);
          nuevo.delete(fechaStr);
          return nuevo;
        });
      }

      await diasCanceladosService.cancelarDia(establecimiento, fechaStr, 'Día cancelado desde panel de negocio');
      
      // Actualizar estado local
      setDiaCancelado(true);
      
      // Regenerar lista completa de días cancelados (incluyendo domingos automáticos)
      await regenerarDiasCancelados();
      
      // Limpiar horarios disponibles ya que el día está cancelado
      setHorariosDisponibles([]);
      setHorariosBloqueados([]);
      
      setNotification({
        message: 'Día cancelado exitosamente',
        type: 'success'
      });
    } catch (err) {
      console.error('Error al cancelar día:', err);
      setNotification({
        message: 'Error al cancelar el día: ' + (err.message || 'Error desconocido'),
        type: 'error'
      });
    }
  };

  // Función para cancelar múltiples días
  const handleCancelarMultiplesDias = async () => {
    if (diasSeleccionados.length === 0) return;
    
    try {
      // Validar si hay turnos reservados en alguno de los días
      const diasConTurnos = [];
      for (const dia of diasSeleccionados) {
        const fechaStr = formatearFecha(dia);
        const cantidadTurnos = reservasPorDia[fechaStr] || 0;
        if (cantidadTurnos > 0) {
          diasConTurnos.push({ fecha: fechaStr, cantidad: cantidadTurnos });
        }
      }
      
      if (diasConTurnos.length > 0) {
        const mensaje = diasConTurnos.length === 1
          ? `No se puede cancelar el día ${diasConTurnos[0].fecha} porque tiene ${diasConTurnos[0].cantidad} turno${diasConTurnos[0].cantidad > 1 ? 's' : ''} reservado${diasConTurnos[0].cantidad > 1 ? 's' : ''}. Debe cancelar primero los turnos desde "Turnos reservados".`
          : `No se pueden cancelar ${diasConTurnos.length} días porque tienen turnos reservados. Debe cancelar primero los turnos desde "Turnos reservados".`;
        setNotification({
          message: mensaje,
          type: 'error'
        });
        return;
      }
      
      // Cancelar todos los días seleccionados
      const promesas = diasSeleccionados.map(async (dia) => {
        const fechaStr = formatearFecha(dia);
        // Si era un domingo restaurado, quitar de restaurados
        if (dia.getDay() === 0) {
          setDomingosRestaurados((prev) => {
            const nuevo = new Set(prev);
            nuevo.delete(fechaStr);
            return nuevo;
          });
        }
        return diasCanceladosService.cancelarDia(establecimiento, fechaStr, 'Día cancelado desde panel de negocio');
      });
      
      await Promise.all(promesas);
      
      // Guardar el número de días antes de limpiar
      const cantidadDias = diasSeleccionados.length;
      
      // Regenerar lista completa de días cancelados
      await regenerarDiasCancelados();
      
      // Limpiar selección
      setDiasSeleccionados([]);
      setDiaActivoMultiples(null);
      
      setNotification({
        message: `${cantidadDias} día${cantidadDias > 1 ? 's' : ''} cancelado${cantidadDias > 1 ? 's' : ''} exitosamente`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error al cancelar días:', err);
      setNotification({
        message: 'Error al cancelar los días: ' + (err.message || 'Error desconocido'),
        type: 'error'
      });
    }
  };

  // Función para restaurar múltiples días
  const handleRestaurarMultiplesDias = async () => {
    if (diasSeleccionados.length === 0) return;
    
    try {
      // Restaurar todos los días seleccionados
      const promesas = diasSeleccionados.map(async (dia) => {
        const fechaStr = formatearFecha(dia);
        // Si es domingo, agregarlo a restaurados
        if (dia.getDay() === 0) {
          setDomingosRestaurados((prev) => {
            const nuevo = new Set(prev);
            nuevo.add(fechaStr);
            return nuevo;
          });
        }
        return diasCanceladosService.restaurarDia(establecimiento, fechaStr);
      });
      
      await Promise.all(promesas);
      
      // Guardar el número de días antes de limpiar
      const cantidadDias = diasSeleccionados.length;
      
      // Regenerar lista completa de días cancelados
      await regenerarDiasCancelados();
      
      // Limpiar selección
      setDiasSeleccionados([]);
      setDiaActivoMultiples(null);
      
      setNotification({
        message: `${cantidadDias} día${cantidadDias > 1 ? 's' : ''} restaurado${cantidadDias > 1 ? 's' : ''} exitosamente`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error al restaurar días:', err);
      setNotification({
        message: 'Error al restaurar los días: ' + (err.message || 'Error desconocido'),
        type: 'error'
      });
    }
  };

  // Función para restaurar un día cancelado
  const handleRestaurarDia = async (fecha) => {
    try {
      // Normalizar la fecha
      let fechaObj;
      if (typeof fecha === 'string') {
        fechaObj = parseFechaLocal(fecha);
        if (!fechaObj || isNaN(fechaObj.getTime())) {
          // Si no se puede parsear, intentar como objeto Date
          fechaObj = new Date(fecha);
        }
      } else {
        fechaObj = fecha;
      }
      
      if (!fechaObj || isNaN(fechaObj.getTime())) {
        setError('Fecha inválida');
        return;
      }
      
      const fechaStr = formatearFecha(fechaObj);
      const esDomingo = fechaObj.getDay() === 0;
      
      // Verificar si es un domingo auto o un día cancelado manualmente
      const diaEnLista = diasCancelados.find(d => {
        const f = parseFechaLocal(d.fecha);
        return f && formatearFecha(f) === fechaStr;
      });
      const esAuto = esDomingo && diaEnLista?.id?.startsWith('auto-');

      if (!esAuto) {
        // Si es un día cancelado manualmente, restaurarlo del backend
        await diasCanceladosService.restaurarDia(establecimiento, fechaStr);
      }
      
      // Si es domingo, marcarlo como restaurado para no volver a añadirlo automáticamente
      if (esDomingo) {
        setDomingosRestaurados((prev) => {
          const nuevo = new Set(prev);
          nuevo.add(fechaStr);
          return nuevo;
        });
      }
      
      // Si es el día actualmente seleccionado, actualizar estado
      if (selectedDate && formatearFecha(selectedDate) === fechaStr) {
        setDiaCancelado(false);
        // Recargar horarios si hay profesional seleccionado
        if (profesionalSeleccionado || esGeneral) {
          await cargarHorariosDisponibles();
          await cargarHorariosBloqueados();
        }
      }
      
      // Regenerar lista completa de días cancelados (incluyendo domingos automáticos)
      await regenerarDiasCancelados();
    } catch (err) {
      console.error('Error al restaurar día:', err);
      setError('Error al restaurar el día: ' + (err.message || 'Error desconocido'));
    }
  };
  
  const cargarHorariosBloqueados = async () => {
    const fechaActiva = obtenerFechaActiva();
    if (!fechaActiva || (!profesionalSeleccionado && !esGeneral)) return;
    
    try {
      const fechaStr = formatearFecha(fechaActiva);
      
      if (esGeneral) {
        // En modo General, no mostrar horarios bloqueados
        // porque un horario solo está realmente bloqueado si TODOS los profesionales lo tienen ocupado
        setHorariosBloqueados([]);
        setHorariosEliminados(new Set());
      } else {
        const response = await horariosBloqueadosService.obtenerHorariosBloqueados(
          establecimiento,
          fechaStr,
          profesionalSeleccionado.id
        );
        
        const bloqueados = response.data || response || [];
        const horasBloqueadas = bloqueados.map(h => h.hora);
        
        // Actualizar el set de horarios eliminados con los del servidor
        setHorariosEliminados(new Set(horasBloqueadas));
      }
    } catch (err) {
      console.error('Error al cargar horarios bloqueados:', err);
    }
  };

  // Función para obtener el nombre del mes
  const obtenerNombreMes = (fecha) => {
    const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    const año = fecha.getFullYear();
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

  // Función para verificar si una fecha es pasada
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

  // Verificar si un mes es anterior al mes actual
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

  // Verificar si un mes es posterior al mes siguiente
  const esMesPosterior = (fecha) => {
    const hoy = new Date();
    const añoHoy = hoy.getFullYear();
    const mesHoy = hoy.getMonth();
    const añoFecha = fecha.getFullYear();
    const mesFecha = fecha.getMonth();
    
    // Calcular el mes siguiente considerando cambio de año
    let añoSiguiente = añoHoy;
    let mesSiguiente = mesHoy + 1;
    if (mesSiguiente > 11) {
      mesSiguiente = 0;
      añoSiguiente = añoHoy + 1;
    }
    
    // Verificar si la fecha es posterior al mes siguiente
    if (añoFecha > añoSiguiente) return true;
    if (añoFecha < añoSiguiente) return false;
    return mesFecha > mesSiguiente;
  };

  // Verificar si estamos en el mes siguiente
  const esMesSiguiente = (fecha) => {
    const hoy = new Date();
    const añoHoy = hoy.getFullYear();
    const mesHoy = hoy.getMonth();
    const añoFecha = fecha.getFullYear();
    const mesFecha = fecha.getMonth();
    
    // Calcular el mes siguiente considerando cambio de año
    let añoSiguiente = añoHoy;
    let mesSiguiente = mesHoy + 1;
    if (mesSiguiente > 11) {
      mesSiguiente = 0;
      añoSiguiente = añoHoy + 1;
    }
    
    return añoFecha === añoSiguiente && mesFecha === mesSiguiente;
  };

  // Función auxiliar para verificar si un día está cancelado
  const esDiaCancelado = (fecha) => {
    const fechaStr = formatearFecha(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    const esFuturoOHoy = fechaComparar >= hoy;
    
    if (!esFuturoOHoy) return false;
    
    // Verificar si es domingo no restaurado
    const esDomingo = fecha.getDay() === 0 && !domingosRestaurados.has(fechaStr);
    if (esDomingo) return true;
    
    // Verificar si está en la lista de días cancelados
    const estaEnListaCancelados = diasCancelados.some(d => {
      const fechaCancelada = parseFechaLocal(d.fecha);
      if (!fechaCancelada || isNaN(fechaCancelada.getTime())) return false;
      return formatearFecha(fechaCancelada) === fechaStr;
    });
    
    return estaEnListaCancelados;
  };

  // Deshabilitar días pasados en el calendario y días que no coincidan con el tipo seleccionado
  const tileDisabled = useCallback(({ date, view }) => {
    if (view === 'month') {
      // Verificar si la fecha es pasada
      if (esFechaPasada(date)) return true;
      
      // En modo 'dias', si hay días seleccionados, verificar el tipo del primer día
      if (modoSeleccion === 'dias' && diasSeleccionados.length > 0) {
        const primerDia = diasSeleccionados[0];
        const primerDiaEsCancelado = esDiaCancelado(primerDia);
        const diaActualEsCancelado = esDiaCancelado(date);
        
        // Si el primer día es cancelado, solo permitir seleccionar días cancelados
        // Si el primer día NO es cancelado, solo permitir seleccionar días NO cancelados
        if (primerDiaEsCancelado && !diaActualEsCancelado) {
          return true; // Deshabilitar días disponibles si se seleccionó un cancelado
        }
        if (!primerDiaEsCancelado && diaActualEsCancelado) {
          return true; // Deshabilitar días cancelados si se seleccionó un disponible
        }
      }
      
      return false;
    }
    return false;
  }, [modoSeleccion, diasSeleccionados]);

  // Aplicar clases CSS a los días del calendario
  const tileClassName = useCallback(({ date, view }) => {
    if (view === 'month') {
      const clases = [];
      const fechaStr = formatearFecha(date);
      
      // Marcar días pasados con la clase 'dia-pasado'
      if (esFechaPasada(date)) {
        clases.push('dia-pasado');
      }

      // Marcar días seleccionados según el modo
      const esSeleccionado = modoSeleccion === 'dia' && selectedDate && formatearFecha(selectedDate) === fechaStr;
      const esSeleccionadoDias = modoSeleccion === 'dias' && diasSeleccionados.some(d => formatearFecha(d) === fechaStr);
      const esMesSeleccionado = modoSeleccion === 'mes' && mesSeleccionado && 
        date.getFullYear() === mesSeleccionado.getFullYear() && 
        date.getMonth() === mesSeleccionado.getMonth();
      
      if (esSeleccionado || esSeleccionadoDias || esMesSeleccionado) {
        clases.push('react-calendar__tile--active');
      }

      // Marcar días cancelados (manuales) o domingos no restaurados (solo si no son pasados)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaComparar = new Date(date);
      fechaComparar.setHours(0, 0, 0, 0);
      const esFuturoOHoy = fechaComparar >= hoy;
      
      if (esFuturoOHoy) {
        const esDomingo = date.getDay() === 0 && !domingosRestaurados.has(fechaStr);
        const esDiaCancelado = diasCancelados.some(d => {
          const fecha = parseFechaLocal(d.fecha);
          if (!fecha || isNaN(fecha.getTime())) return false;
          return formatearFecha(fecha) === fechaStr;
        });
        if (esDomingo || esDiaCancelado) {
          clases.push('dia-cancelado');
        }
      }
      
      // En modo 'dias', si hay días seleccionados, marcar días no seleccionables con clase especial
      if (modoSeleccion === 'dias' && diasSeleccionados.length > 0 && !esFechaPasada(date)) {
        const primerDia = diasSeleccionados[0];
        const primerDiaEsCancelado = esDiaCancelado(primerDia);
        const diaActualEsCancelado = esDiaCancelado(date);
        
        // Si el día no coincide con el tipo del primer día seleccionado, agregar clase para tacharlo
        if ((primerDiaEsCancelado && !diaActualEsCancelado) || (!primerDiaEsCancelado && diaActualEsCancelado)) {
          clases.push('dia-no-seleccionable');
        }
      }
      
      return clases.length > 0 ? clases.join(' ') : null;
    }
    return null;
  }, [modoSeleccion, selectedDate, diasSeleccionados, mesSeleccionado, diasCancelados, domingosRestaurados]);

  // Función para mostrar la cantidad de turnos en cada día del calendario
  const tileContent = useCallback(({ date, view }) => {
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
  }, [reservasPorDia]);

  // Función para cambiar de mes
  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(date);
    nuevoMes.setMonth(date.getMonth() + direccion);
    
    // Si intenta ir al mes anterior, verificar que no sea un mes pasado
    if (direccion === -1 && esMesAnterior(nuevoMes)) {
      return; // No permitir navegar a meses pasados
    }
    
    // Si intenta ir al mes siguiente, verificar que no sea más allá del mes siguiente
    if (direccion === 1 && esMesPosterior(nuevoMes)) {
      return; // No permitir navegar más allá del mes siguiente
    }
    
    setDate(nuevoMes);
    setSelectedDate(null);
    
    // Si estamos en modo mes, actualizar los días seleccionados cuando cambia el mes
    if (modoSeleccion === 'mes') {
      const año = nuevoMes.getFullYear();
      const mes = nuevoMes.getMonth();
      const diasEnMes = new Date(año, mes + 1, 0).getDate();
      const todosLosDias = [];
      for (let i = 1; i <= diasEnMes; i++) {
        todosLosDias.push(new Date(año, mes, i));
      }
      setDiasSeleccionados(todosLosDias);
      setMesSeleccionado(new Date(año, mes, 1));
    }
  };

  // Función para manejar la selección de días en modo días o mes
  const handleDiaClick = (fecha) => {
    if (modoSeleccion !== 'dias' && modoSeleccion !== 'mes') return;
    
    // Normalizar la fecha (solo año, mes, día, sin hora)
    const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const fechaStr = formatearFecha(fechaNormalizada);
    
    if (modoSeleccion === 'mes') {
      // En modo mes, al hacer clic en un día, cambiar al mes de ese día y seleccionar todos sus días
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
        // Validar que el día a agregar sea del mismo tipo que los ya seleccionados
        if (diasSeleccionados.length > 0) {
          const primerDia = diasSeleccionados[0];
          const primerDiaEsCancelado = esDiaCancelado(primerDia);
          const diaActualEsCancelado = esDiaCancelado(fechaNormalizada);
          
          // Si el tipo no coincide, no permitir agregar
          if (primerDiaEsCancelado !== diaActualEsCancelado) {
            return;
          }
        }
        
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

  // Actualizar días seleccionados cuando cambia el mes en modo mes
  useEffect(() => {
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

  return (
    <div className="negocio-page">
      <div className="negocio-page-container">
        <h1>Gestión de Horarios</h1>
        
        {error && (
          <div className="resenas-error">
            {error}
          </div>
        )}

        {/* Calendario */}
        <div className="calendario-container">
          <div className="calendario-header">
            <div className="calendario-navegacion-izquierda">
              {!esMesActual(date) && !esMesAnterior(date) && (
                <button
                  className="btn-navegacion"
                  onClick={() => cambiarMes(-1)}
                  disabled={isLoadingCalendario}
                >
                  Mes anterior
                </button>
              )}
              {(esMesActual(date) || esMesAnterior(date)) && <div></div>} {/* Espaciador cuando no hay botón */}
            </div>
            <h2 className="mes-actual">{obtenerNombreMes(date)}</h2>
            <div className="calendario-navegacion-derecha">
              {!esMesSiguiente(date) && !esMesPosterior(date) && (
                <button
                  className="btn-navegacion"
                  onClick={() => cambiarMes(1)}
                  disabled={isLoadingCalendario}
                >
                  Mes siguiente
                </button>
              )}
              {(esMesSiguiente(date) || esMesPosterior(date)) && <div></div>} {/* Espaciador cuando no hay botón */}
            </div>
          </div>

          {isLoadingCalendario ? (
            <div className="loading-calendario">Cargando calendario...</div>
          ) : (
            <Calendar
              key={`calendar-${date.getFullYear()}-${date.getMonth()}`}
              onChange={(fecha) => {
                // Validar que no se seleccione una fecha pasada
                if (esFechaPasada(fecha)) return;
                
                if (modoSeleccion === 'dia') {
                  setSelectedDate(fecha);
                } else if (modoSeleccion === 'dias' || modoSeleccion === 'mes') {
                  handleDiaClick(fecha);
                }
              }}
              value={modoSeleccion === 'dia' ? selectedDate : null}
              activeStartDate={date}
              onActiveStartDateChange={(newDate) => {
                // Limitar la navegación al mes actual y el siguiente
                const hoy = new Date();
                const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                const ultimoDiaMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
                
                // Si intenta navegar fuera del rango permitido, mantener la fecha actual
                if (newDate < primerDiaMesActual || newDate > ultimoDiaMesSiguiente) {
                  return;
                }
                setDate(newDate);
              }}
              locale="es"
              showNeighboringMonth={false}
              tileDisabled={tileDisabled}
              tileClassName={tileClassName}
              tileContent={tileContent}
              minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())} // No permitir seleccionar fechas pasadas
              maxDate={maxDate} // Limitar al último día del mes siguiente
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
            className={`resumen-modo-btn ${modoSeleccion === 'mes' ? 'active' : ''}`}
            onClick={() => {
              // Verificar si hay turnos reservados en el mes actual
              const año = date.getFullYear();
              const mes = date.getMonth();
              const diasEnMes = new Date(año, mes + 1, 0).getDate();
              
              // Verificar si algún día del mes tiene turnos reservados
              let hayTurnosReservados = false;
              for (let i = 1; i <= diasEnMes; i++) {
                const diaDelMes = new Date(año, mes, i);
                const fechaStr = formatearFecha(diaDelMes);
                const cantidadTurnos = reservasPorDia[fechaStr] || 0;
                if (cantidadTurnos > 0) {
                  hayTurnosReservados = true;
                  break;
                }
              }
              
              // Si hay turnos reservados, mostrar notificación y no permitir la selección
              if (hayTurnosReservados) {
                setNotification({
                  message: 'No se puede seleccionar esta opción ya que hay días con turnos reservados en el mes',
                  type: 'error'
                });
                return;
              }
              
              // Si no hay turnos reservados, proceder con la selección del mes
              setModoSeleccion('mes');
              setSelectedDate(null);
              setDiasSeleccionados([]);
              // Seleccionar automáticamente todos los días del mes actual
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

        {hayDiasSeleccionados() && (() => {
          const fechaActiva = obtenerFechaActiva();
          if (!fechaActiva) return null;
          
          // Verificar si el día activo está cancelado
          const fechaStrActiva = formatearFecha(fechaActiva);
          const esDomingoActivo = fechaActiva.getDay() === 0 && !domingosRestaurados.has(fechaStrActiva);
          const estaCanceladoActivo = esDomingoActivo || diasCancelados.some(d => {
            const fecha = parseFechaLocal(d.fecha);
            if (!fecha || isNaN(fecha.getTime())) return false;
            return formatearFecha(fecha) === fechaStrActiva;
          });
          
          // En modo 'dias' o 'mes', verificar si todos los días seleccionados son cancelados
          let todosSonCancelados = false;
          if ((modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0) {
            todosSonCancelados = diasSeleccionados.every(dia => esDiaCancelado(dia));
          }
          
          return (
            <div className="horarios-lista-container" style={{ marginTop: '2rem', padding: '1.5rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              {/* Botón Cancelar/Restaurar día(s) */}
              <div style={{ marginBottom: diasCancelados.length > 0 ? '1.5rem' : '0' }}>
                <button
                  onClick={(modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0
                    ? (todosSonCancelados ? () => handleRestaurarMultiplesDias() : () => handleCancelarMultiplesDias())
                    : (estaCanceladoActivo ? () => handleRestaurarDia(fechaActiva) : handleCancelarDia)}
                  style={{
                    backgroundColor: (modoSeleccion === 'dias' || modoSeleccion === 'mes')
                      ? (todosSonCancelados ? '#10b981' : '#ef4444')
                      : (estaCanceladoActivo ? '#10b981' : '#ef4444'),
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    maxWidth: '300px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {(modoSeleccion === 'dias' || modoSeleccion === 'mes')
                    ? (todosSonCancelados 
                        ? `Restaurar ${diasSeleccionados.length} día${diasSeleccionados.length > 1 ? 's' : ''}`
                        : `Cancelar ${diasSeleccionados.length} día${diasSeleccionados.length > 1 ? 's' : ''}`)
                    : (estaCanceladoActivo ? 'Restaurar día' : 'Cancelar día')}
                </button>
                {estaCanceladoActivo && modoSeleccion === 'dia' && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444', fontWeight: '500' }}>
                    Este día está cancelado y no aparecerá en el calendario de reserva
                  </p>
                )}
                {(modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0 && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                    {todosSonCancelados
                      ? `Se restaurarán ${diasSeleccionados.length} día${diasSeleccionados.length > 1 ? 's' : ''} seleccionado${diasSeleccionados.length > 1 ? 's' : ''}`
                      : `Se cancelarán ${diasSeleccionados.length} día${diasSeleccionados.length > 1 ? 's' : ''} seleccionado${diasSeleccionados.length > 1 ? 's' : ''}`}
                  </p>
                )}
            </div>

            {/* Sección de días cancelados */}
            {diasCancelados.length > 0 && (() => {
              // Filtrar y ordenar días cancelados del más cercano al más lejano
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              
              const diasFiltradosYOrdenados = diasCancelados
                .map((dia) => {
                  const fechaDia = parseFechaLocal(dia.fecha);
                  if (!fechaDia || isNaN(fechaDia.getTime())) {
                    return null;
                  }
                  fechaDia.setHours(0, 0, 0, 0);
                  // Filtrar días pasados (solo mostrar hoy y futuros)
                  if (fechaDia < hoy) {
                    return null;
                  }
                  return { ...dia, fechaObj: fechaDia };
                })
                .filter(Boolean)
                .sort((a, b) => a.fechaObj.getTime() - b.fechaObj.getTime()); // Ordenar del más cercano al más lejano
              
              if (diasFiltradosYOrdenados.length === 0) return null;
              
              return (
                <div style={{ paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
                  <h3 className="horarios-subtitulo">Días Cancelados</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {diasFiltradosYOrdenados.map((dia) => {
                      const fechaDia = dia.fechaObj;
                    const fechaStr = formatearFecha(fechaDia);
                    const fechaFormateada = fechaDia.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    
                    return (
                      <div 
                        key={dia.id} 
                        style={{
                          background: '#fef2f2',
                          border: '2px solid #ef4444',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                            {fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)}
                          </div>
                          {dia.motivo && (
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {dia.motivo}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRestaurarDia(fechaStr)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#059669';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#10b981';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          Restaurar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })()}
            </div>
          );
        })()}

        {/* Selector de profesional debajo del contenedor de cancelación */}
        {hayDiasSeleccionados() && (() => {
          const fechaActiva = obtenerFechaActiva();
          if (!fechaActiva) return null;
          
          // Verificar si el día activo está cancelado
          const fechaStrActiva = formatearFecha(fechaActiva);
          const esDomingoActivo = fechaActiva.getDay() === 0 && !domingosRestaurados.has(fechaStrActiva);
          const estaCanceladoActivo = esDomingoActivo || diasCancelados.some(d => {
            const fecha = parseFechaLocal(d.fecha);
            if (!fecha || isNaN(fecha.getTime())) return false;
            return formatearFecha(fecha) === fechaStrActiva;
          });
          
          // Verificar si todos los días seleccionados están cancelados (solo en modo 'dias', no en 'mes')
          let todosLosDiasCancelados = false;
          if (modoSeleccion === 'dias' && diasSeleccionados.length > 0) {
            todosLosDiasCancelados = diasSeleccionados.every(dia => esDiaCancelado(dia));
          }
          
          // Deshabilitar selector si: (día único cancelado) o (todos los días cancelados en modo 'dias')
          const selectorDeshabilitado = (estaCanceladoActivo && modoSeleccion === 'dia') || 
                                       (todosLosDiasCancelados && modoSeleccion === 'dias');
          
          return (
            <div className="horarios-selector-container" style={{ marginTop: '1.5rem' }}>
              <h2 className="horarios-titulo-seccion">
                {(modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 0
                  ? `Horarios para ${diasSeleccionados.length} día${diasSeleccionados.length > 1 ? 's' : ''} seleccionado${diasSeleccionados.length > 1 ? 's' : ''}`
                  : `Horarios para ${formatearFechaMostrar(fechaActiva)}`}
              </h2>
              
              {/* Selector de día cuando hay múltiples días seleccionados */}
              {(modoSeleccion === 'dias' || modoSeleccion === 'mes') && diasSeleccionados.length > 1 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="horarios-label">Seleccionar día para ver horarios:</label>
                  <select
                    className="horarios-select"
                    value="todos"
                    disabled
                  >
                    <option value="todos">Todos los días seleccionados</option>
                  </select>
                </div>
              )}
            
              <div className="horarios-profesional-selector">
                <label className="horarios-label">Seleccionar profesional:</label>
                <select
                  className="horarios-select"
                  value={esGeneral ? 'general' : (profesionalSeleccionado?.id || '')}
                  disabled={selectorDeshabilitado}
                  style={
                    selectorDeshabilitado
                      ? {
                          cursor: 'not-allowed',
                          backgroundColor: '#f3f4f6',
                          borderColor: '#e5e7eb',
                          color: '#6b7280',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                        }
                      : undefined
                  }
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor === 'general') {
                      setEsGeneral(true);
                      setProfesionalSeleccionado(null);
                    } else {
                      setEsGeneral(false);
                      const profesional = team.find(p => p.id === parseInt(valor));
                      setProfesionalSeleccionado(profesional);
                    }
                    setHorariosEliminados(new Set()); // Limpiar horarios eliminados al cambiar profesional
                  }}
                >
                  <option value="">-- Seleccione un profesional --</option>
                  <option value="general">General (Todo el personal)</option>
                  {team.map(profesional => (
                    <option key={profesional.id} value={profesional.id}>
                      {profesional.name} - {profesional.role}
                    </option>
                  ))}
                </select>
                {selectorDeshabilitado && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                    Restaurar el día para poder elegir una opción
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Contenedor de Horarios Disponibles y Bloqueados */}
        {hayDiasSeleccionados() && (profesionalSeleccionado || esGeneral) && (() => {
          const fechaActiva = obtenerFechaActiva();
          if (!fechaActiva) return null;
          
          return (
          <div className="horarios-lista-container" style={{ marginTop: '2rem', padding: '1.5rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            {isLoading ? (
              <div className="loading-calendario">Cargando horarios...</div>
            ) : (
              <>
                <h3 className="horarios-subtitulo">Horarios Disponibles</h3>
                {horariosDisponibles.length === 0 ? (
                  <p className="horarios-vacio">
                    No hay horarios disponibles para este día y profesional
                  </p>
                ) : (
                  <div className="horarios-grid">
                    {horariosDisponibles.map((hora, index) => (
                      <div key={index} className="horario-item disponible">
                        <span className="horario-hora">{hora}</span>
                        <button
                          className="horario-btn-eliminar"
                          onClick={() => eliminarHorario(hora)}
                          title="Eliminar horario"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Horarios bloqueados/eliminados */}
                {(horariosBloqueados.length > 0 || horariosEliminados.size > 0) && (
                  <>
                    <h3 className="horarios-subtitulo horarios-subtitulo-bloqueados" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
                      Horarios Bloqueados
                    </h3>
                    <div className="horarios-grid">
                      {horariosBloqueados.map((hora, index) => (
                        <div key={`bloqueado-${index}`} className="horario-item bloqueado">
                          <span className="horario-hora">{hora}</span>
                          <span className="horario-bloqueado-label">Reservado</span>
                        </div>
                      ))}
                      {Array.from(horariosEliminados).map((hora, index) => (
                        <div key={`eliminado-${index}`} className="horario-item eliminado">
                          <span className="horario-hora">{hora}</span>
                          <button
                            className="horario-btn-restaurar"
                            onClick={() => restaurarHorario(hora)}
                            title="Restaurar horario"
                          >
                            ↻
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          );
        })()}
      </div>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Horarios;
