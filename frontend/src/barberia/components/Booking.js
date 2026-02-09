import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaCheck } from 'react-icons/fa';
import { timeSlots } from '../data/sampleData';
import { reservasService, negociosService, personalService, servicioService, diasCanceladosService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Booking.css';

const Booking = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Función para formatear fecha sin problemas de zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parsear la fecha directamente desde el string YYYY-MM-DD
    // para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };
  
  // Determinar el establecimiento basado en la ruta
  const getEstablecimiento = () => {
    if (location.pathname.includes('/barberia')) {
      return 'barberia_clasica';
    }
    // Agregar más establecimientos aquí según sea necesario
    // if (location.pathname.includes('/maxturnos')) {
    //   return 'maxturnos';
    // }
    return 'barberia_clasica'; // Por defecto
  };
  
  const establecimiento = getEstablecimiento();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState(timeSlots);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [error, setError] = useState('');
  const [team, setTeam] = useState([]); // Estado para el equipo cargado desde el backend
  const [services, setServices] = useState([]); // Estado para los servicios cargados desde el backend

  const [establecimientoConfig, setEstablecimientoConfig] = useState(null);
  const [diasDisponibles, setDiasDisponibles] = useState([1, 2, 3, 4, 5, 6]); // Por defecto: Lunes a Sábado
  const [horaCierre, setHoraCierre] = useState('20:00');
  const [diasCancelados, setDiasCancelados] = useState([]); // Lista de días cancelados

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

  // Función para convertir servicios del backend al formato esperado
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
        // En caso de error, mantener lista vacía
        setTeam([]);
      }
    };
    
    cargarPersonal();
  }, [establecimiento]);

  // Cargar servicios desde el backend
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const response = await servicioService.obtenerServicios(establecimiento);
        const serviciosData = response.data || response;
        const serviciosConvertidos = convertirServicioABackend(serviciosData);
        setServices(serviciosConvertidos);
        
        // Si hay un servicio en la URL, seleccionarlo automáticamente
        const searchParams = new URLSearchParams(location.search);
        const serviceIdFromUrl = searchParams.get('service');
        if (serviceIdFromUrl && serviciosConvertidos.length > 0) {
          const servicioEncontrado = serviciosConvertidos.find(
            s => s.id.toString() === serviceIdFromUrl
          );
          if (servicioEncontrado) {
            setSelectedService(servicioEncontrado);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        // En caso de error, mantener lista vacía
        setServices([]);
      }
    };
    
    cargarServicios();
  }, [establecimiento, location.search]);

  // Cargar configuración del establecimiento
  useEffect(() => {
    const fetchEstablecimientoConfig = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/establecimientos/${establecimiento}`);
        if (response.ok) {
          const data = await response.json();
          setEstablecimientoConfig(data.establecimiento);
          if (data.establecimiento?.diasDisponibles) {
            let dias = data.establecimiento.diasDisponibles;
            // Asegurar que el lunes (1) esté incluido si no lo está
            if (!dias.includes(1)) {
              dias = [...dias, 1].sort((a, b) => a - b);
            }
            setDiasDisponibles(dias);
          }
        }
        
        // Cargar configuración del negocio para obtener hora de cierre y días disponibles
        const negocioResponse = await negociosService.obtenerNegocio(establecimiento);
        const negocio = negocioResponse.data || negocioResponse;
        if (negocio) {
          // Si el negocio tiene días disponibles, usarlos (asegurando que el lunes esté incluido)
          if (negocio.diasDisponibles) {
            let dias = negocio.diasDisponibles;
            // Asegurar que el lunes (1) esté incluido si no lo está
            if (!dias.includes(1)) {
              dias = [...dias, 1].sort((a, b) => a - b);
            }
            setDiasDisponibles(dias);
          }
          if (negocio.horarios && negocio.horarios.fin) {
            setHoraCierre(negocio.horarios.fin);
          }
        }
        
        // Cargar días cancelados
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaDesde = hoy.toISOString().split('T')[0];
        try {
          const diasCanceladosResponse = await diasCanceladosService.obtenerDiasCancelados(establecimiento, fechaDesde);
          const diasCanceladosData = diasCanceladosResponse.data || diasCanceladosResponse || [];
          setDiasCancelados(diasCanceladosData);
        } catch (err) {
          console.error('Error al cargar días cancelados:', err);
          setDiasCancelados([]);
        }
      } catch (err) {
        console.error('Error al cargar configuración del establecimiento:', err);
        // Usar valores por defecto si falla
      }
    };
    
    fetchEstablecimientoConfig();
  }, [establecimiento]);

  // Generar fechas disponibles (próximos 30 días) según configuración del establecimiento
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    // Normalizar hoy a medianoche local para evitar problemas de zona horaria
    today.setHours(0, 0, 0, 0);
    
    // Crear un Set de fechas canceladas para búsqueda rápida
    const fechasCanceladasSet = new Set(
      diasCancelados.map(dia => {
        const fechaDia = new Date(dia.fecha);
        const year = fechaDia.getFullYear();
        const month = String(fechaDia.getMonth() + 1).padStart(2, '0');
        const day = String(fechaDia.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })
    );
    
    // Verificar si el día actual ya pasó la hora de cierre
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const horaActualMinutos = horaActual * 60 + minutosActuales;
    
    // Obtener la hora de cierre según el día de la semana
    const diaSemanaHoy = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    let horaCierreHoy = horaCierre;
    if (diaSemanaHoy === 6) { // Sábado
      horaCierreHoy = '18:00';
    } else if (diaSemanaHoy >= 1 && diaSemanaHoy <= 5) { // Lunes a Viernes
      horaCierreHoy = '20:00';
    }
    
    const [horasCierre, minutosCierre] = horaCierreHoy.split(':').map(Number);
    const horaCierreMinutos = horasCierre * 60 + minutosCierre;
    const estaCerradoHoy = horaActualMinutos >= horaCierreMinutos;
    
    // Empezar desde hoy (i = 0) hasta 30 días en el futuro
    // Si el local está cerrado hoy, empezar desde mañana (i = 1)
    const inicio = estaCerradoHoy ? 1 : 0;
    
    for (let i = inicio; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      
      // Formatear fecha como YYYY-MM-DD sin problemas de zona horaria
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const fechaStr = `${year}-${month}-${day}`;
      
      // Incluir solo los días disponibles según configuración y que no estén cancelados
      if (diasDisponibles.includes(dayOfWeek) && !fechasCanceladasSet.has(fechaStr)) {
        dates.push({
          value: fechaStr,
          label: date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return dates;
  };

  // Actualizar fechas cuando cambia la configuración o la hora de cierre
  const availableDates = generateAvailableDates();
  
  useEffect(() => {
    // Las fechas se regeneran automáticamente cuando cambia diasDisponibles o horaCierre
  }, [diasDisponibles, horaCierre]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(3); // Cambiar a paso 3 (Profesional)
    // Resetear horarios cuando cambia la fecha
    setAvailableTimeSlots(timeSlots);
  };

  // Cargar horarios cuando se vuelve al paso 4 (Hora) y ya hay profesional seleccionado
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (step === 4 && selectedDate && selectedBarber && selectedService) {
        setIsLoadingTimes(true);
        setError('');
        try {
          console.log('Solicitando horarios disponibles:', {
            establecimiento,
            selectedDate,
            profesionalId: selectedBarber.id,
            servicio: selectedService
          });
          const response = await reservasService.obtenerHorariosDisponibles(
            establecimiento,
            selectedDate,
            selectedBarber.id,
            selectedService
          );
          console.log('Respuesta completa de horarios disponibles:', response);
          const horarios = response.data?.horariosDisponibles || response.horariosDisponibles || [];
          console.log('Horarios disponibles extraídos:', horarios);
          setAvailableTimeSlots(horarios);
        } catch (err) {
          console.error('Error al obtener horarios disponibles:', err);
          setError('Error al cargar horarios disponibles');
          setAvailableTimeSlots(timeSlots);
        } finally {
          setIsLoadingTimes(false);
        }
      }
    };

    fetchAvailableTimes();
  }, [step, selectedDate, selectedBarber, selectedService, establecimiento]);

  const handleBarberSelect = async (barber) => {
    setSelectedBarber(barber);
    // Cargar horarios disponibles cuando se selecciona el profesional
    if (selectedDate && selectedService) {
      setIsLoadingTimes(true);
      setError('');
      try {
        console.log('Solicitando horarios disponibles:', {
          establecimiento,
          selectedDate,
          profesionalId: barber.id,
          servicio: selectedService
        });
        const response = await reservasService.obtenerHorariosDisponibles(
          establecimiento,
          selectedDate,
          barber.id,
          selectedService
        );
        console.log('Respuesta completa de horarios disponibles:', response);
        const horarios = response.data?.horariosDisponibles || response.horariosDisponibles || [];
        console.log('Horarios disponibles extraídos:', horarios);
        setAvailableTimeSlots(horarios);
      } catch (err) {
        console.error('Error al obtener horarios disponibles:', err);
        setError('Error al cargar horarios disponibles');
        setAvailableTimeSlots(timeSlots);
      } finally {
        setIsLoadingTimes(false);
      }
    }
    setStep(4); // Cambiar a paso 4 (Hora)
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(5); // Cambiar a paso 5 (Datos)
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user || !user.email) {
      setError('Debes iniciar sesión para realizar una reserva');
      return;
    }

    try {
      const reservaData = {
        establecimiento,
        fecha: selectedDate,
        hora: selectedTime,
        servicio: {
          id: selectedService.id,
          name: selectedService.name,
          duration: selectedService.duration,
          price: selectedService.price
        },
        profesional: {
          id: selectedBarber.id,
          name: selectedBarber.name
        },
        notas: customerInfo.notes,
        usuarioEmail: user.email
      };

      await reservasService.crearReserva(reservaData);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error al crear reserva:', err);
      setError(err.message || 'Error al crear la reserva. Por favor intenta nuevamente.');
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedBarber(null);
    setCustomerInfo({ notes: '' });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="booking-success">
        <div className="success-content">
          <div className="success-icon">
            <FaCheck />
          </div>
          <h2>¡Reserva Confirmada!</h2>
          <p>Tu turno ha sido reservado exitosamente.</p>
          <div className="booking-details">
            <div className="detail-item">
              <strong>Servicio:</strong> {selectedService.name}
            </div>
            <div className="detail-item">
              <strong>Fecha:</strong> {formatDate(selectedDate)}
            </div>
            <div className="detail-item">
              <strong>Hora:</strong> {selectedTime}
            </div>
            <div className="detail-item">
              <strong>Profesional:</strong> {selectedBarber.name}
            </div>
          </div>
          <button onClick={resetBooking} className="btn btn-primary">
            Hacer Nueva Reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="booking" id="reservar">
      <div className="container">
        <div className="section-header">
          <h2>Reservar Turno</h2>
          <p>Selecciona tu servicio y reserva tu turno de manera fácil y rápida</p>
        </div>

        {/* Indicador de pasos */}
        <div className="booking-steps">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div 
              key={stepNumber} 
              className={`step ${step >= stepNumber ? 'active' : ''} ${step > stepNumber ? 'completed' : ''}`}
            >
              <div className="step-number">{stepNumber}</div>
              <div className="step-label">
                {stepNumber === 1 && 'Servicio'}
                {stepNumber === 2 && 'Fecha'}
                {stepNumber === 3 && 'Profesional'}
                {stepNumber === 4 && 'Hora'}
                {stepNumber === 5 && 'Datos'}
              </div>
            </div>
          ))}
        </div>

        <div className="booking-content">
          {/* Paso 1: Selección de servicio */}
          {step === 1 && (
            <div className="booking-step">
              <h3>Selecciona un Servicio</h3>
              {services.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Cargando servicios...</p>
                </div>
              ) : (
                <div className="services-grid">
                  {services.map(service => (
                  <div 
                    key={service.id} 
                    className="service-option"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h4>{service.name}</h4>
                    <div className="service-meta">
                      <span className="duration">
                        <img 
                          src="/assets/img/logos_genericos/reloj.png" 
                          alt="Duración" 
                          className="duration-icon"
                        />
                        {service.duration}
                      </span>
                      <span className="price">
                        <img 
                          src="/assets/img/logos_genericos/dinero.png" 
                          alt="Precio" 
                          className="price-icon"
                        />
                        {service.price}
                      </span>
                    </div>
                    <p>{service.description}</p>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Selección de fecha */}
          {step === 2 && (
            <div className="booking-step">
              <h3>Selecciona una Fecha</h3>
              <div className="dates-grid">
                {availableDates.map(date => (
                  <div 
                    key={date.value} 
                    className="date-option"
                    onClick={() => handleDateSelect(date.value)}
                  >
                    <FaCalendarAlt className="date-icon" />
                    <span>{date.label}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep(1)} 
                className="btn btn-secondary"
              >
                Volver
              </button>
            </div>
          )}

          {/* Paso 3: Selección de barbero */}
          {step === 3 && (
            <div className="booking-step">
              <h3>Selecciona un Profesional</h3>
              {team.length === 0 ? (
                <div className="loading-message">Cargando profesionales...</div>
              ) : (
                <div className="barbers-grid">
                  {team.map(barber => (
                  <div 
                    key={barber.id} 
                    className="barber-option"
                    onClick={() => handleBarberSelect(barber)}
                  >
                    <img src={barber.avatar} alt={barber.name} className="barber-avatar" />
                    <h4>{barber.name}</h4>
                    <p>{barber.role}</p>
                    {barber.specialties && barber.specialties.length > 0 && (
                      <div className="barber-specialties">
                        {barber.specialties.map((specialty, index) => (
                          <span key={index} className="specialty-tag">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}
              <button 
                onClick={() => setStep(2)} 
                className="btn btn-secondary"
              >
                Volver
              </button>
            </div>
          )}

          {/* Paso 4: Selección de hora */}
          {step === 4 && (
            <div className="booking-step">
              <h3>Selecciona una Hora</h3>
              {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}
              {isLoadingTimes ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Cargando horarios disponibles...</p>
                </div>
              ) : !availableTimeSlots || availableTimeSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>No hay horarios disponibles para esta fecha y profesional.</p>
                  <button 
                    onClick={() => setStep(2)} 
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem' }}
                  >
                    Seleccionar otra fecha
                  </button>
                </div>
              ) : (
                <>
                  <div className="times-grid">
                    {availableTimeSlots.map(time => (
                      <div 
                        key={time} 
                        className="time-option"
                        onClick={() => handleTimeSelect(time)}
                      >
                        <img 
                          src="/assets/img/logos_genericos/reloj.png" 
                          alt="Hora" 
                          className="time-icon"
                        />
                        <span>{time}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setStep(3)} 
                    className="btn btn-secondary"
                  >
                    Volver
                  </button>
                </>
              )}
            </div>
          )}


          {/* Paso 5: Datos del cliente */}
          {step === 5 && (
            <div className="booking-step">
              <h3>Notas Adicionales (Opcional)</h3>
              {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group form-group-textarea">
                  <textarea
                    id="notes"
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Alguna preferencia especial o comentario..."
                    maxLength={250}
                  />
                  <div className="character-count">
                    {(customerInfo.notes || '').length}/250
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    onClick={() => setStep(4)} 
                    className="btn btn-secondary"
                  >
                    Volver
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirmar Reserva
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Booking;


