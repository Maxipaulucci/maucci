import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { superadminService } from '../../services/api';
import './SuperAdminPage.css';

const VIEW_MAIN = 'main';
const VIEW_AGREGAR = 'agregar';
const VIEW_ELIMINAR = 'eliminar';
const VIEW_MODIFICAR = 'modificar';

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const [view, setView] = useState(VIEW_MAIN);
  const [form, setForm] = useState({ id: '', mailAsociado: '' });
  const [listado, setListado] = useState([]);
  const [listadoConDetalles, setListadoConDetalles] = useState([]);
  const [editingMails, setEditingMails] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [eliminandoId, setEliminandoId] = useState(null);
  const [guardandoId, setGuardandoId] = useState(null);

  const loadListado = async (withDetails = false) => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await superadminService.listarNegocios(user.email, withDetails);
      const data = Array.isArray(res.data) ? res.data : [];
      if (withDetails) {
        setListadoConDetalles(data);
        const initial = {};
        data.forEach((item) => { initial[item.id] = item.mailAsociado ?? ''; });
        setEditingMails(initial);
      } else {
        setListado(data);
      }
    } catch (err) {
      setMessage({ text: err.message || 'Error al cargar lista', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === VIEW_ELIMINAR && user?.email) loadListado(false);
  }, [view, user?.email]);

  useEffect(() => {
    if (view === VIEW_MODIFICAR && user?.email) loadListado(true);
  }, [view, user?.email]);

  const handleAceptarAgregar = async (e) => {
    e.preventDefault();
    const id = form.id?.trim();
    const mailAsociado = form.mailAsociado?.trim();
    if (!id || !mailAsociado) {
      setMessage({ text: 'Completá id y mail asociado', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await superadminService.crearNegocio(user.email, id, mailAsociado);
      setMessage({ text: 'Negocio creado correctamente', type: 'success' });
      setForm({ id: '', mailAsociado: '' });
    } catch (err) {
      setMessage({ text: err.message || 'Error al crear negocio', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarAgregar = () => {
    setForm({ id: '', mailAsociado: '' });
    setMessage({ text: '', type: '' });
    setView(VIEW_MAIN);
  };

  const handleEliminar = async (id) => {
    if (!id || !window.confirm(`¿Eliminar el negocio "${id}"? Se borrará toda la colección.`)) return;
    setEliminandoId(id);
    setMessage({ text: '', type: '' });
    try {
      await superadminService.eliminarNegocio(user.email, id);
      setListado((prev) => prev.filter((n) => n !== id));
      setMessage({ text: 'Negocio eliminado', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Error al eliminar', type: 'error' });
    } finally {
      setEliminandoId(null);
    }
  };

  const handleGuardarMail = async (id) => {
    if (!id) return;
    const mail = (editingMails[id] ?? '').trim();
    setGuardandoId(id);
    setMessage({ text: '', type: '' });
    try {
      await superadminService.actualizarMailAsociado(user.email, id, mail);
      setListadoConDetalles((prev) => prev.map((item) => (item.id === id ? { ...item, mailAsociado: mail } : item)));
      setMessage({ text: 'Mail asociado actualizado', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Error al actualizar', type: 'error' });
    } finally {
      setGuardandoId(null);
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <div className="superadmin-page">
        <p>No tenés acceso a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="superadmin-page">
      {view === VIEW_MAIN && (
        <>
          <button type="button" className="superadmin-btn-negocios" onClick={() => setView('negocios-menu')}>
            Negocios
          </button>
          <div className="superadmin-logout">
            <button type="button" className="superadmin-btn-logout" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      {view === 'negocios-menu' && (
        <>
          <button type="button" className="superadmin-btn-back" onClick={() => setView(VIEW_MAIN)}>
            ← Volver
          </button>
          <div className="superadmin-opciones">
            <button type="button" className="superadmin-btn-opcion" onClick={() => { setView(VIEW_AGREGAR); setMessage({ text: '', type: '' }); }}>
              Agregar
            </button>
            <button type="button" className="superadmin-btn-opcion" onClick={() => { setView(VIEW_MODIFICAR); setMessage({ text: '', type: '' }); }}>
              Modificar
            </button>
            <button type="button" className="superadmin-btn-opcion" onClick={() => { setView(VIEW_ELIMINAR); setMessage({ text: '', type: '' }); }}>
              Eliminar
            </button>
          </div>
        </>
      )}

      {view === VIEW_AGREGAR && (
        <>
          <button type="button" className="superadmin-btn-back" onClick={handleCancelarAgregar}>
            ← Volver
          </button>
          <form className="superadmin-form" onSubmit={handleAceptarAgregar}>
            <label>
              id
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                placeholder="ej: mi_negocio"
              />
            </label>
            <label>
              mail asociado
              <input
                type="email"
                value={form.mailAsociado}
                onChange={(e) => setForm((f) => ({ ...f, mailAsociado: e.target.value }))}
                placeholder="email@ejemplo.com"
              />
            </label>
            {message.text && <p className={`superadmin-message ${message.type}`}>{message.text}</p>}
            <div className="superadmin-form-buttons">
              <button type="submit" className="superadmin-btn-aceptar" disabled={loading}>
                {loading ? '...' : 'Aceptar'}
              </button>
              <button type="button" className="superadmin-btn-cancelar" onClick={handleCancelarAgregar}>
                Cancelar
              </button>
            </div>
          </form>
        </>
      )}

      {view === VIEW_MODIFICAR && (
        <>
          <button type="button" className="superadmin-btn-back" onClick={() => setView('negocios-menu')}>
            ← Volver
          </button>
          <div className="superadmin-modificar">
            <h2>Modificar mail asociado</h2>
            {message.text && <p className={`superadmin-message ${message.type}`}>{message.text}</p>}
            {loading && listadoConDetalles.length === 0 ? (
              <p>Cargando...</p>
            ) : listadoConDetalles.length === 0 ? (
              <p>No hay negocios en la base de datos.</p>
            ) : (
              <ul className="superadmin-lista-modificar">
                {listadoConDetalles.map((item) => (
                  <li key={item.id}>
                    <span className="superadmin-modificar-id">{item.id}</span>
                    <input
                      type="email"
                      className="superadmin-input-mail"
                      value={editingMails[item.id] ?? ''}
                      onChange={(e) => setEditingMails((m) => ({ ...m, [item.id]: e.target.value }))}
                      placeholder="mail@ejemplo.com"
                    />
                    <button
                      type="button"
                      className="superadmin-btn-guardar"
                      onClick={() => handleGuardarMail(item.id)}
                      disabled={guardandoId === item.id}
                    >
                      {guardandoId === item.id ? '...' : 'Guardar'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {view === VIEW_ELIMINAR && (
        <>
          <button type="button" className="superadmin-btn-back" onClick={() => setView('negocios-menu')}>
            ← Volver
          </button>
          <div className="superadmin-eliminar">
            <h2>Eliminar negocio</h2>
            {message.text && <p className={`superadmin-message ${message.type}`}>{message.text}</p>}
            {loading && listado.length === 0 ? (
              <p>Cargando...</p>
            ) : listado.length === 0 ? (
              <p>No hay negocios en la base de datos.</p>
            ) : (
              <ul className="superadmin-lista-negocios">
                {listado.map((id) => (
                  <li key={id}>
                    <span>{id}</span>
                    <button
                      type="button"
                      className="superadmin-btn-eliminar"
                      onClick={() => handleEliminar(id)}
                      disabled={eliminandoId === id}
                    >
                      {eliminandoId === id ? '...' : 'Eliminar'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
