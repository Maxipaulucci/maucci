import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reservasService } from '../../services/api';
import './NegocioPage.css';
import './Clientes.css';

const Clientes = () => {
  const { user } = useAuth();
  const establecimiento = user?.nombreNegocio || 'barberia_clasica';

  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await reservasService.obtenerClientes(establecimiento);
        const data = res.data || [];
        setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Error al cargar clientes');
        setClientes([]);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, [establecimiento]);

  useEffect(() => {
    if (!clienteSeleccionado) {
      setHistorial([]);
      return;
    }
    const cargarHistorial = async () => {
      setIsLoadingHistorial(true);
      setError('');
      try {
        const res = await reservasService.obtenerHistorialCliente(establecimiento, clienteSeleccionado.email);
        const data = res.data || [];
        setHistorial(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Error al cargar historial');
        setHistorial([]);
      } finally {
        setIsLoadingHistorial(false);
      }
    };
    cargarHistorial();
  }, [establecimiento, clienteSeleccionado]);

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const nombreCompleto = (c) => {
    const n = (c.nombre || '').trim();
    const a = (c.apellido || '').trim();
    if (n || a) return `${n} ${a}`.trim();
    return c.email || 'Sin nombre';
  };

  const termino = (busqueda || '').toLowerCase().trim();
  const clientesFiltrados = termino
    ? clientes.filter((c) => {
        const nombre = nombreCompleto(c).toLowerCase();
        const email = (c.email || '').toLowerCase();
        return nombre.includes(termino) || email.includes(termino);
      })
    : clientes;

  return (
    <div className="negocio-page">
      <div className="negocio-page-container">
        <h1>Clientes</h1>

        {error && (
          <div className="resenas-error clientes-error">{error}</div>
        )}

        {isLoading ? (
          <div className="resenas-loading">Cargando clientes...</div>
        ) : (
          <>
            <p className="clientes-descripcion">
              Clientes que tienen o tuvieron al menos un turno en tu negocio. Haz clic en uno para ver su historial.
            </p>

            {clientes.length === 0 ? (
              <p className="clientes-empty">No hay clientes registrados aún.</p>
            ) : (
              <div className="clientes-layout">
                <div className="clientes-columna-lista">
                  <input
                    type="text"
                    className="clientes-buscador"
                    placeholder="Buscar por nombre o email..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    aria-label="Buscar cliente"
                  />
                  <ul className="clientes-lista">
                  {clientesFiltrados.map((c) => (
                    <li
                      key={c.email}
                      className={`clientes-item ${clienteSeleccionado?.email === c.email ? 'activo' : ''}`}
                      onClick={() => setClienteSeleccionado(c)}
                    >
                      <span className="clientes-item-nombre">{nombreCompleto(c)}</span>
                      <span className="clientes-item-email">{c.email}</span>
                    </li>
                  ))}
                  </ul>
                  {clientesFiltrados.length === 0 && termino && (
                    <p className="clientes-sin-resultados">Ningún cliente coincide con la búsqueda.</p>
                  )}
                </div>

                <div className="clientes-historial-panel">
                  {!clienteSeleccionado ? (
                    <p className="clientes-historial-placeholder">Seleccioná un cliente para ver su historial de turnos.</p>
                  ) : (
                    <>
                      <h2 className="clientes-historial-titulo">
                        Historial de {nombreCompleto(clienteSeleccionado)}
                      </h2>
                      {isLoadingHistorial ? (
                        <div className="resenas-loading">Cargando historial...</div>
                      ) : historial.length === 0 ? (
                        <p className="clientes-empty">Sin turnos registrados.</p>
                      ) : (
                        <ul className="clientes-historial-lista">
                          {historial.map((t) => (
                            <li key={t.id} className="clientes-historial-item">
                              <span className="clientes-historial-fecha">{formatFecha(t.fecha)}</span>
                              <span className="clientes-historial-hora">{t.hora || '—'}</span>
                              <span className="clientes-historial-servicio">{t.servicioNombre || '—'}</span>
                              <span className="clientes-historial-profesional">{t.profesionalNombre || '—'}</span>
                              {t.activa && <span className="clientes-historial-badge">Activo</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Clientes;
