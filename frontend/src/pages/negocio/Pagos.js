import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { negociosService } from '../../services/api';
import './NegocioPage.css';
import './Pagos.css';

const Pagos = () => {
  const { user } = useAuth();
  const establecimiento = user?.nombreNegocio || '';

  /** Método activo en el servidor (el que ven los clientes). */
  const [metodoActivo, setMetodoActivo] = useState('NINGUNO');
  /** Selección local hasta tocar Guardar. */
  const [seleccion, setSeleccion] = useState('NINGUNO');

  const [alias, setAlias] = useState('');
  const [cvuCbu, setCvuCbu] = useState('');
  const [titular, setTitular] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [pagoHabilitado, setPagoHabilitado] = useState(false);
  const [transferenciaConfigurada, setTransferenciaConfigurada] = useState(false);
  const [mercadoPagoConfigurado, setMercadoPagoConfigurado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formaActiva =
    metodoActivo !== 'NINGUNO' && pagoHabilitado;

  const aplicarConfig = (data) => {
    const metodo = data.metodoPago || 'NINGUNO';
    setMetodoActivo(metodo);
    setSeleccion(metodo);
    setAlias(data.alias || '');
    setCvuCbu(data.cvuCbu || '');
    setTitular(data.titular || '');
    setPagoHabilitado(!!data.pagoHabilitado);
    setTransferenciaConfigurada(!!data.transferenciaConfigurada);
    setMercadoPagoConfigurado(!!data.mercadoPagoConfigurado);
  };

  useEffect(() => {
    const cargar = async () => {
      if (!establecimiento) {
        setLoading(false);
        return;
      }
      try {
        const res = await negociosService.obtenerConfigPago(establecimiento);
        aplicarConfig(res.data ?? res);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la configuración de pagos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [establecimiento]);

  const handleSeleccionar = (metodo) => {
    if (formaActiva || saving) return;
    setError('');
    setMessage('');
    setSeleccion(metodo);
  };

  const handleDesactivar = async () => {
    if (!formaActiva || saving) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await negociosService.actualizarConfigPago(establecimiento, {
        metodoPago: 'NINGUNO',
        alias: alias.trim(),
        cvuCbu: cvuCbu.trim(),
        titular: titular.trim()
      });
      aplicarConfig(res.data ?? res);
      setAccessToken('');
      setMessage(
        'Forma de pago desactivada. Los clientes ya no ven el botón Pagar. Elegí otra opción y tocá Guardar para activarla.'
      );
    } catch (err) {
      setError(err.message || 'Error al desactivar la forma de pago');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (formaActiva || saving) return;
    setError('');
    setMessage('');
    setSaving(true);

    try {
      if (seleccion === 'NINGUNO') {
        const res = await negociosService.actualizarConfigPago(establecimiento, {
          metodoPago: 'NINGUNO',
          alias: alias.trim(),
          cvuCbu: cvuCbu.trim(),
          titular: titular.trim()
        });
        aplicarConfig(res.data ?? res);
        setMessage('Guardado: sin pago online. El botón Pagar no se muestra a los clientes.');
        return;
      }

      if (seleccion === 'TRANSFERENCIA') {
        if (!alias.trim() || !cvuCbu.trim() || !titular.trim()) {
          setError('Completá alias, CVU/CBU y nombre del titular antes de guardar');
          return;
        }
        const res = await negociosService.actualizarConfigPago(establecimiento, {
          metodoPago: 'TRANSFERENCIA',
          alias: alias.trim(),
          cvuCbu: cvuCbu.trim(),
          titular: titular.trim()
        });
        aplicarConfig(res.data ?? res);
        setMessage('Transferencia activada. Tus clientes verán estos datos al pagar.');
        return;
      }

      if (seleccion === 'MERCADO_PAGO') {
        const token = accessToken.trim();
        if (!token && !mercadoPagoConfigurado) {
          setError('Pegá el Access Token de Mercado Pago antes de guardar');
          return;
        }
        if (token) {
          const mpRes = await negociosService.actualizarMercadoPago(establecimiento, token);
          const mpData = mpRes.data ?? mpRes;
          setMercadoPagoConfigurado(!!mpData.configurado);
          setAccessToken('');
        }
        const res = await negociosService.actualizarConfigPago(establecimiento, {
          metodoPago: 'MERCADO_PAGO',
          alias: alias.trim(),
          cvuCbu: cvuCbu.trim(),
          titular: titular.trim()
        });
        aplicarConfig(res.data ?? res);
        setMessage('Mercado Pago activado. Tus clientes podrán pagar con Checkout Pro.');
      }
    } catch (err) {
      setError(err.message || 'Error al guardar la forma de pago');
    } finally {
      setSaving(false);
    }
  };

  const handleDesconectarToken = async () => {
    if (formaActiva || saving) return;
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await negociosService.actualizarMercadoPago(establecimiento, '');
      setMercadoPagoConfigurado(false);
      setAccessToken('');
      setMessage('Access Token desconectado. Pegá uno nuevo y tocá Guardar para activar Mercado Pago.');
    } catch (err) {
      setError(err.message || 'Error al desconectar el Access Token');
    } finally {
      setSaving(false);
    }
  };

  const estadoTexto = () => {
    if (formaActiva && metodoActivo === 'TRANSFERENCIA') {
      return 'Estado: transferencia activa (desactivá para cambiar)';
    }
    if (formaActiva && metodoActivo === 'MERCADO_PAGO') {
      return 'Estado: Mercado Pago activo (desactivá para cambiar)';
    }
    if (metodoActivo === 'NINGUNO') {
      return 'Estado: ninguna forma de pago activa';
    }
    return 'Estado: sin método de pago activo';
  };

  return (
    <div className="negocio-page">
      <div className="negocio-page-container pagos-page">
        <h1>Pagos</h1>
        <p className="pagos-intro">
          Si ya hay una forma de pago activa, primero desactivala. Después elegí la nueva opción
          y tocá <strong>Guardar</strong> para activarla. Si desactivás y no guardás otra,
          los clientes no ven el botón Pagar.
        </p>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className={`pagos-status ${formaActiva || metodoActivo === 'NINGUNO' ? 'ok' : 'off'}`}>
              {estadoTexto()}
            </div>

            <div className="pagos-metodos">
              <button
                type="button"
                className={`pagos-metodo-card ${seleccion === 'NINGUNO' ? 'selected' : ''} ${formaActiva ? 'locked' : ''}`}
                onClick={() => handleSeleccionar('NINGUNO')}
                disabled={formaActiva || saving}
              >
                <strong>Ninguno</strong>
                <span>Sin pago online. El cliente no ve el botón Pagar.</span>
              </button>
              <button
                type="button"
                className={`pagos-metodo-card ${seleccion === 'TRANSFERENCIA' ? 'selected' : ''} ${formaActiva ? 'locked' : ''}`}
                onClick={() => handleSeleccionar('TRANSFERENCIA')}
                disabled={formaActiva || saving}
              >
                <strong>Transferencia bancaria</strong>
                <span>Alias, CVU/CBU y titular. El cliente adjunta comprobante.</span>
              </button>
              <button
                type="button"
                className={`pagos-metodo-card ${seleccion === 'MERCADO_PAGO' ? 'selected' : ''} ${formaActiva ? 'locked' : ''}`}
                onClick={() => handleSeleccionar('MERCADO_PAGO')}
                disabled={formaActiva || saving}
              >
                <strong>Mercado Pago</strong>
                <span>Checkout Pro con Access Token de tu cuenta.</span>
              </button>
            </div>

            {seleccion === 'TRANSFERENCIA' && (
              <div className="pagos-form">
                <h2 className="pagos-section-title">Datos de la cuenta</h2>
                <p className="pagos-help">
                  Estos datos se muestran al cliente cuando toca &quot;Pagar&quot;.
                </p>

                <label htmlFor="pagoAlias" className="form-label">Alias</label>
                <input
                  id="pagoAlias"
                  type="text"
                  className="form-input"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="ej. mi.negocio.mp"
                  disabled={formaActiva || saving}
                  autoComplete="off"
                />

                <label htmlFor="pagoCvu" className="form-label">CVU / CBU</label>
                <input
                  id="pagoCvu"
                  type="text"
                  className="form-input"
                  value={cvuCbu}
                  onChange={(e) => setCvuCbu(e.target.value)}
                  placeholder="22 dígitos"
                  disabled={formaActiva || saving}
                  autoComplete="off"
                />

                <label htmlFor="pagoTitular" className="form-label">Nombre del titular</label>
                <input
                  id="pagoTitular"
                  type="text"
                  className="form-input"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  placeholder="Nombre y apellido como figura en la cuenta"
                  disabled={formaActiva || saving}
                  autoComplete="name"
                />
              </div>
            )}

            {seleccion === 'MERCADO_PAGO' && (
              <div className="pagos-form">
                <h2 className="pagos-section-title">Mercado Pago</h2>
                <p className="pagos-help">
                  Conectá tu cuenta de Mercado Pago para que tus clientes puedan pagar el servicio
                  de forma opcional al confirmar un turno. El dinero se acredita en <strong>tu</strong> cuenta.
                </p>

                <div className={`pagos-status ${mercadoPagoConfigurado ? 'ok' : 'off'}`}>
                  {mercadoPagoConfigurado ? 'Access Token: conectado' : 'Access Token: no configurado'}
                </div>

                <label htmlFor="mpAccessToken" className="form-label">
                  Access Token de Mercado Pago
                </label>
                <input
                  id="mpAccessToken"
                  type="password"
                  className="form-input"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder={mercadoPagoConfigurado ? 'Pegá un token nuevo para reemplazar el actual' : 'APP_USR-...'}
                  disabled={formaActiva || saving}
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
                </p>

                {!formaActiva && mercadoPagoConfigurado && (
                  <div className="pagos-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleDesconectarToken}
                      disabled={saving}
                    >
                      Quitar Access Token
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && <div className="pagos-alert error">{error}</div>}
            {message && <div className="pagos-alert ok">{message}</div>}

            <div className="pagos-footer-actions">
              {formaActiva ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleDesactivar}
                  disabled={saving}
                >
                  {saving ? 'Desactivando...' : 'Desactivar forma de pago'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGuardar}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagos;
