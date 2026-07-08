const NOMBRES_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function normalizarHora(hora) {
  if (!hora) return '';
  const trimmed = String(hora).trim();
  if (trimmed.includes(':')) return trimmed;
  const partes = trimmed.split(/\s+/);
  if (partes.length >= 2) {
    return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
  }
  return trimmed;
}

function claveHorario(inicio, fin) {
  return `${inicio}|${fin}`;
}

/**
 * Formatea un grupo de días para mostrar en una línea de horarios.
 */
export function formatearDiasGrupo(dias) {
  const sorted = [...new Set(dias)].sort((a, b) => a - b);
  if (sorted.length === 0) return '';
  if (sorted.length === 1) return NOMBRES_DIAS[sorted[0]] || '';

  const esConsecutivo = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);

  if (esConsecutivo) {
    if (sorted.length === 2) {
      return `${NOMBRES_DIAS[sorted[0]]} y ${NOMBRES_DIAS[sorted[1]]}`;
    }
    return `${NOMBRES_DIAS[sorted[0]]} a ${NOMBRES_DIAS[sorted[sorted.length - 1]]}`;
  }

  if (sorted.length === 2) {
    return `${NOMBRES_DIAS[sorted[0]]} y ${NOMBRES_DIAS[sorted[1]]}`;
  }

  const ultimo = NOMBRES_DIAS[sorted[sorted.length - 1]];
  const resto = sorted.slice(0, -1).map((d) => NOMBRES_DIAS[d]).join(', ');
  return `${resto} y ${ultimo}`;
}

/** @deprecated Usar formatearDiasGrupo */
export function formatearDias(dias) {
  return formatearDiasGrupo(dias);
}

/**
 * ¿Se pueden unir dos días en el mismo grupo?
 * Sí si no hay ningún día ENTRE ellos con un horario distinto.
 * Los días cerrados (sin horario) no separan el grupo.
 */
function puedeUnirDias(diaA, diaB, horarioPorDia, claveActual) {
  const min = Math.min(diaA, diaB);
  const max = Math.max(diaA, diaB);

  for (let d = min + 1; d < max; d++) {
    if (horarioPorDia.has(d) && horarioPorDia.get(d) !== claveActual) {
      return false;
    }
  }
  return true;
}

/**
 * Agrupa días con el mismo horario. Solo separa si hay un día intermedio
 * con horario diferente (ej: Lun+Jue mismo horario sin Mié con otro horario → juntos).
 */
export function agruparDiasMismoHorario(entradas) {
  if (!entradas.length) return [];

  const horarioPorDia = new Map();
  entradas.forEach((e) => {
    horarioPorDia.set(e.dia, claveHorario(e.inicio, e.fin));
  });

  const porHorario = new Map();
  entradas.forEach((e) => {
    const key = claveHorario(e.inicio, e.fin);
    if (!porHorario.has(key)) {
      porHorario.set(key, { inicio: e.inicio, fin: e.fin, dias: [] });
    }
    porHorario.get(key).dias.push(e.dia);
  });

  const grupos = [];

  porHorario.forEach(({ inicio, fin, dias }, key) => {
    const sorted = [...new Set(dias)].sort((a, b) => a - b);
    let grupo = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const dia = sorted[i];
      const ultimo = grupo[grupo.length - 1];

      if (puedeUnirDias(ultimo, dia, horarioPorDia, key)) {
        if (!grupo.includes(dia)) grupo.push(dia);
      } else {
        grupos.push({ dias: [...grupo].sort((a, b) => a - b), inicio, fin });
        grupo = [dia];
      }
    }

    grupos.push({ dias: [...grupo].sort((a, b) => a - b), inicio, fin });
  });

  grupos.sort((a, b) => Math.min(...a.dias) - Math.min(...b.dias));
  return grupos;
}

function entradasDesdeBloques(bloques) {
  const porDia = new Map();

  bloques.forEach((bloque) => {
    const inicio = normalizarHora(bloque.inicio);
    const fin = normalizarHora(bloque.fin);
    if (!inicio || !fin || !Array.isArray(bloque.dias)) return;

    bloque.dias.forEach((dia) => {
      porDia.set(dia, { dia, inicio, fin });
    });
  });

  return [...porDia.values()].sort((a, b) => a.dia - b.dia);
}

function lineasDesdeEntradas(entradas) {
  return agruparDiasMismoHorario(entradas)
    .map((grupo) => {
      const dias = formatearDiasGrupo(grupo.dias);
      if (!dias) return null;
      return `${dias}: ${grupo.inicio} - ${grupo.fin}`;
    })
    .filter(Boolean);
}

/**
 * Convierte la config del negocio en líneas legibles, ordenadas por día de la semana.
 * Agrupa días con el mismo horario salvo que haya entre medios un día con horario distinto.
 */
export function obtenerLineasHorarios(negocio) {
  if (!negocio) {
    return ['Horarios no disponibles'];
  }

  const bloques = negocio.bloquesHorario;
  if (Array.isArray(bloques) && bloques.length > 0) {
    const lineas = lineasDesdeEntradas(entradasDesdeBloques(bloques));
    if (lineas.length > 0) return lineas;
  }

  const horarios = negocio.horarios;
  if (horarios?.inicio && horarios?.fin) {
    const inicio = normalizarHora(horarios.inicio);
    const fin = normalizarHora(horarios.fin);
    const diasDisponibles = Array.isArray(negocio.diasDisponibles) ? negocio.diasDisponibles : [];

    if (diasDisponibles.length > 0) {
      const entradas = [...new Set(diasDisponibles)]
        .sort((a, b) => a - b)
        .map((dia) => ({ dia, inicio, fin }));
      const lineas = lineasDesdeEntradas(entradas);
      if (lineas.length > 0) return lineas;
    }

    return [`${inicio} - ${fin}`];
  }

  return ['Consultar horarios'];
}
