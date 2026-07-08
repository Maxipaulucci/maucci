import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { EstablecimientoProvider } from '../context/EstablecimientoContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BarberiaHome from './pages/Home';
import BarberiaServices from './pages/Services';
import BarberiaTeam from './pages/Team';
import BarberiaReviews from './pages/Reviews';
import BarberiaBooking from './pages/Booking';
import BarberiaAbout from './pages/About';

const BarberiaLayout = () => (
  <>
    <Header />
    <Routes>
      <Route index element={<BarberiaHome />} />
      <Route path="servicios" element={<BarberiaServices />} />
      <Route path="equipo" element={<BarberiaTeam />} />
      <Route path="resenas" element={<BarberiaReviews />} />
      <Route path="reservar" element={<BarberiaBooking />} />
      <Route path="acerca" element={<BarberiaAbout />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
    <Footer />
  </>
);

const LocalNegocioRoutes = () => (
  <EstablecimientoProvider>
    <BarberiaLayout />
  </EstablecimientoProvider>
);

export default LocalNegocioRoutes;
