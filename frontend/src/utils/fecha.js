/** Zona del negocio: Argentina. Usar al interpretar fechas que vienen del API. */
export const ZONA_NEGOCIO = 'America/Argentina/Buenos_Aires';

/**
 * Convierte una fecha del API (ISO o Date) al día de calendario en Argentina,
 * evitando que un midnight UTC se muestre como el día anterior.
 */
export function fechaCalendarioDesdeApi(fecha) {
  if (!fecha) return null;

  if (typeof fecha === 'string') {
    const match = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match && !fecha.includes('T')) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }

  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_NEGOCIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);

  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  return new Date(year, month - 1, day);
}

export function formatearFechaYYYYMMDD(fecha) {
  const d = fecha instanceof Date ? fecha : fechaCalendarioDesdeApi(fecha);
  if (!d || Number.isNaN(d.getTime())) return '';
  const año = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

/** Hoy en Argentina como YYYY-MM-DD (no usar toISOString). */
export function hoyYYYYMMDDEnNegocio() {
  return formatearFechaYYYYMMDD(fechaCalendarioDesdeApi(new Date()));
}
