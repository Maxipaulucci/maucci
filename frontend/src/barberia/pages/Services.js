import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Services from '../components/Services';
import { pagosService } from '../../services/api';
import { useEstablecimiento } from '../../context/EstablecimientoContext';

const BarberiaServices = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { codigo, to } = useEstablecimiento();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pago = params.get('pago');
    if (pago !== 'success') return;

    const status = params.get('status') || params.get('collection_status');
    const paymentId = params.get('payment_id') || params.get('collection_id');
    const externalReference = params.get('external_reference');

    const confirmar = async () => {
      try {
        if (status && status !== 'approved') {
          return;
        }
        await pagosService.confirmarPago({
          establecimiento: codigo,
          paymentId: paymentId || undefined,
          status: status || undefined,
          externalReference: externalReference || undefined,
          reservaId: externalReference && externalReference.includes('::')
            ? externalReference.split('::')[1]
            : undefined
        });
      } catch (err) {
        console.error('No se pudo confirmar el pago:', err);
      } finally {
        navigate(to('servicios'), { replace: true });
      }
    };

    confirmar();
  }, [location.search, codigo, navigate, to]);

  return (
    <div className="barberia-services">
      <Services />
    </div>
  );
};

export default BarberiaServices;
