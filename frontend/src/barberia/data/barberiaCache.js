/**
 * Caché en memoria para datos de la barbería (servicios, personal, reseñas, negocio).
 * TTL 5 minutos: al volver a la home, Servicios, Equipo o Reseñas se muestra al instante si hay datos recientes.
 */
const TTL_MS = 5 * 60 * 1000; // 5 minutos

const cache = {
  servicios: {},
  personal: {},
  resenas: {},
  negocio: {}
};

function getCached(key, establecimiento) {
  const entry = cache[key][establecimiento];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) return null;
  return entry.data;
}

function setCached(key, establecimiento, data) {
  if (!cache[key]) cache[key] = {};
  cache[key][establecimiento] = { data, timestamp: Date.now() };
}

export const barberiaCache = {
  getServicios: (establecimiento) => getCached('servicios', establecimiento),
  setServicios: (establecimiento, data) => setCached('servicios', establecimiento, data),
  getPersonal: (establecimiento) => getCached('personal', establecimiento),
  setPersonal: (establecimiento, data) => setCached('personal', establecimiento, data),
  getResenas: (establecimiento) => getCached('resenas', establecimiento),
  setResenas: (establecimiento, data) => setCached('resenas', establecimiento, data),
  getNegocio: (establecimiento) => getCached('negocio', establecimiento),
  setNegocio: (establecimiento, data) => setCached('negocio', establecimiento, data)
};
