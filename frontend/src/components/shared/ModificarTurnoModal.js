import React, { useState, useEffect, useMemo } from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { reservasService, negociosService, diasCanceladosService } from '../../services/api';
import './ModificarTurnoModal.css';

const ModificarTurnoModal = ({ isOpen, onClose, reserva, establecimiento, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [diasDisponibles, setDiasDisponibles] = useState([1, 2, 3, 4, 5, 6]);
  const [diasCancelados, setDiasCancelados] = useState([]);
  const [horaCierre, setHoraCierre] = useState('20:00');

  useEffect(() => {
    if (!isOpen || !establecimiento) return;
    const load = async () => {
      try {
        const negocioRes = await negociosService.obtenerNegocio(establecimiento);
        const negocio = negocioRes.data || negocioRes;
        if (negocio?.diasDisponibles?.length) setDiasDisponibles(negocio.diasDisponibles);
        if (negocio?.horarios?.fin) setHoraCierre(negocio.horarios.fin);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaDesde = hoy.toISOString().split('T')[0];
        const canceladosRes = await diasCanceladosService.obtenerDiasCancelados(establecimiento, fechaDesde);
        const data = canceladosRes.data || canceladosRes || [];
        setDiasCancelados(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setDiasCancelados([]);
      }
    };
    load();
  }, [isOpen, establecimiento]);

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fechasCanceladasSet = new Set(
      (diasCancelados || []).map((dia) => {
        const d = new Date(dia.fecha);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      })
    );
    const ahora = new Date();
    const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
    const [hCierre, mCierre] = (horaCierre || '20:00').split(':').map(Number);
    const horaCierreMinutos = hCierre * 60 + mCierre;
    const estaCerradoHoy = horaActualMinutos >= horaCierreMinutos;
    const inicio = estaCerradoHoy ? 1 : 0;
    for (let i = inicio; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const fechaStr = `${y}-${m}-${day}`;
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
  }, [diasDisponibles, diasCancelados, horaCierre]);

  useEffect(() => {
    if (!isOpen || step !== 2 || !selectedDate || !reserva?.profesional?.id || !reserva?.servicio) return;
    const servicio = reserva.servicio;
    const payload = {
      id: servicio.id,
      name: servicio.name,
      duration: servicio.duration || '30 min',
      price: servicio.price
    };
    let cancelled = false;
    setIsLoadingTimes(true);
    setError('');
    reservasService
      .obtenerHorariosDisponibles(establecimiento, selectedDate, reserva.profesional.id, payload)
      .then((res) => {
        if (cancelled) return;
        const horarios = res.data?.horariosDisponibles ?? res.horariosDisponibles ?? [];
        setAvailableTimeSlots(Array.isArray(horarios) ? horarios : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error al cargar horarios');
          setAvailableTimeSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTimes(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, step, selectedDate, establecimiento, reserva]);

  const handleClose = () => {
    if (isSubmitting) return;
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setError('');
    onClose();
  };

  const handleSelectDate = (fechaStr) => {
    setSelectedDate(fechaStr);
    setSelectedTime('');
    setStep(2);
  };

  const handleSelectTime = async (hora) => {
    if (!reserva?.id || !establecimiento || !selectedDate) return;
    setIsSubmitting(true);
    setError('');
    try {
      await reservasService.modificarReserva(reserva.id, establecimiento, selectedDate, hora);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message || 'Error al modificar el turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !reserva) return null;

  return (
    <div className="modal-overlay modificar-turno-overlay" onClick={handleClose}>
      <div className="modal-content modificar-turno-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modificar-turno-header">
          <h2>Modificar turno</h2>
          <button type="button" className="modal-close" onClick={handleClose}>×</button>
        </div>
        <div className="modificar-turno-body">
          {error && (
            <div className="modificar-turno-error">{error}</div>
          )}
          {step === 1 && (
            <>
              <h3>Selecciona una Fecha</h3>
              <div className="modificar-turno-dates-grid">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    className="modificar-turno-date-option"
                    onClick={() => handleSelectDate(date.value)}
                  >
                    <FaCalendarAlt className="modificar-turno-date-icon" />
                    <span>{date.label}</span>
                  </button>
                ))}
              </div>
              {availableDates.length === 0 && (
                <p className="modificar-turno-empty">No hay fechas disponibles en los próximos días.</p>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <h3>Selecciona una Hora</h3>
              <button
                type="button"
                className="modificar-turno-back"
                onClick={() => { setStep(1); setSelectedDate(''); setError(''); }}
              >
                Volver a fechas
              </button>
              {isLoadingTimes ? (
                <p className="modificar-turno-loading">Cargando horarios disponibles...</p>
              ) : availableTimeSlots.length === 0 ? (
                <p className="modificar-turno-empty">No hay horarios disponibles para esta fecha.</p>
              ) : (
                <div className="modificar-turno-times-grid">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className="modificar-turno-time-option"
                      onClick={() => handleSelectTime(time)}
                      disabled={isSubmitting}
                    >
                      <FaClock className="modificar-turno-time-icon" />
                      <span>{time}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModificarTurnoModal;
