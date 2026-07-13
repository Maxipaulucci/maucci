import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { negociosService } from '../../services/api';
import './NegocioPage.css';
import './Pagos.css';

const Pagos = () => {
  const { user } = useAuth();
  const establecimiento = user?.nombreNegocio || '';
  const [accessToken, setAccessToken] = useState('');
  const [configurado, setConfigurado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      if (!establecimiento) {
        setLoading(false);
        return;
      }
      try {
        const res = await negociosService.obtenerEstadoMercadoPago(establecimiento);
        const data = res.data ?? res;
        setConfigurado(!!data.configurado);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el estado de Mercado Pago');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [establecimiento]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await negociosService.actualizarMercadoPago(establecimiento, accessToken.trim());
      const data = res.data ?? res;
      setConfigurado(!!data.configurado);
      setAccessToken('');
      setMessage(res.message || (data.configurado ? 'Mercado Pago configurado' : 'Mercado Pago desconectado'));
    } catch (err) {
      setError(err.message || 'Error al guardar el Access Token');
    } finally {
      setSaving(false);
    }
  };

  const handleDesconectar = async () => {
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await negociosService.actualizarMercadoPago(establecimiento, '');
      const data = res.data ?? res;
      setConfigurado(!!data.configurado);
      setAccessToken('');
      setMessage('Mercado Pago desconectado');
    } catch (err) {
      setError(err.message || 'Error al desconectar Mercado Pago');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="negocio-page">
      <div className="negocio-page-container pagos-page">
        <h1>Pagos (Mercado Pago)</h1>
        <p className="pagos-intro">
          Conectá tu cuenta de Mercado Pago para que tus clientes puedan pagar el servicio
          de forma opcional al confirmar un turno. El dinero se acredita en <strong>tu</strong> cuenta.
        </p>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className={`pagos-status ${configurado ? 'ok' : 'off'}`}>
              {configurado ? 'Estado: conectado' : 'Estado: no configurado'}
            </div>

            <form className="pagos-form" onSubmit={handleGuardar}>
              <label htmlFor="mpAccessToken" className="form-label">
                Access Token de Mercado Pago
              </label>
              <input
                id="mpAccessToken"
                type="password"
                className="form-input"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder={configurado ? 'Pegá un token nuevo para reemplazar el actual' : 'APP_USR-...'}
                autoComplete="off"
              />
              <p className="pagos-help">
                Obtenélo en{' '}
                <a
                  href="https://www.mercadopago.com.ar/developers/panel/app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  developers.mercadopago.com
                </a>
                {' '}→ tu aplicación → Credenciales (Test o Producción).
                Para desconectar, guardá el campo vacío o usá el botón Desconectar.
              </p>

              {error && <div className="pagos-alert error">{error}</div>}
              {message && <div className="pagos-alert ok">{message}</div>}

              <div className="pagos-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                {configurado && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleDesconectar}
                    disabled={saving}
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagos;
