import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEstablecimiento } from '../../context/EstablecimientoContext';
import Booking from '../components/Booking';

const BarberiaBooking = () => {
  const { to } = useEstablecimiento();
  const location = useLocation();
  const serviceId = new URLSearchParams(location.search).get('service');

  // Sin servicio elegido, la reserva empieza por la lista de servicios
  if (!serviceId) {
    return <Navigate to={to('servicios')} replace />;
  }

  return (
    <div className="barberia-booking">
      <Booking />
    </div>
  );
};

export default BarberiaBooking;
