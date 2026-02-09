const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Función auxiliar para hacer peticiones
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Error en la petición');
      error.data = data.data || data; // Incluir data del error para acceso
      throw error;
    }

    return data;
  } catch (error) {
    // Si es un error de conexión, mostrar mensaje más claro
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No se pudo conectar al servidor. Asegúrate de que el servidor backend esté corriendo en el puerto 5000.');
    }
    throw error;
  }
};

// Servicios de autenticación
export const authService = {
  // Registrar nuevo usuario
  register: async (nombre, apellido, email, password, tipoRegistro, nombreNegocio) => {
    return await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, apellido, email, password, tipoRegistro, nombreNegocio })
    });
  },

  // Iniciar sesión
  login: async (email, password) => {
    return await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Verificar email con código
  verifyEmail: async (email, codigo) => {
    return await fetchAPI('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, codigo })
    });
  },

  // Reenviar código de verificación
  resendCode: async (email) => {
    return await fetchAPI('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Eliminar cuenta
  deleteAccount: async (email) => {
    return await fetchAPI('/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Recuperar contraseña - enviar código
  forgotPassword: async (email) => {
    return await fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Verificar código de recuperación de contraseña
  verifyPasswordResetCode: async (email, codigo) => {
    return await fetchAPI('/auth/verify-password-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, codigo })
    });
  },

  // Restablecer contraseña con código
  resetPassword: async (email, codigo, nuevaPassword) => {
    return await fetchAPI('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, codigo, nuevaPassword })
    });
  },

  // Cambiar contraseña (requiere contraseña actual)
  changePassword: async (email, currentPassword, newPassword) => {
    return await fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ email, currentPassword, newPassword })
    });
  }
};

// Función auxiliar para convertir duración (ej: "60 min") a minutos
const parseDuration = (duration) => {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

// Servicios de reservas
export const reservasService = {
  // Crear nueva reserva
  crearReserva: async (reservaData) => {
    return await fetchAPI('/reservas', {
      method: 'POST',
      body: JSON.stringify(reservaData)
    });
  },

  // Obtener horarios disponibles para una fecha, profesional y servicio
  obtenerHorariosDisponibles: async (establecimiento, fecha, profesionalId, servicio) => {
    const duracionMinutos = parseDuration(servicio.duration);
    const params = new URLSearchParams({
      establecimiento,
      fecha,
      profesionalId: profesionalId.toString(),
      servicioId: servicio.id.toString(),
      duracionMinutos: duracionMinutos.toString()
    });
    
    return await fetchAPI(`/reservas/horarios-disponibles?${params}`);
  },

  // Obtener todas las reservas (con filtros opcionales)
  obtenerReservas: async (establecimiento, fecha = null, profesionalId = null) => {
    const params = new URLSearchParams();
    params.append('establecimiento', establecimiento);
    if (fecha) params.append('fecha', fecha);
    if (profesionalId) params.append('profesionalId', profesionalId.toString());
    
    return await fetchAPI(`/reservas?${params.toString()}`);
  },

  // Obtener reservas por mes con contadores por día
  obtenerReservasPorMes: async (establecimiento, año, mes) => {
    const params = new URLSearchParams();
    params.append('establecimiento', establecimiento);
    params.append('anio', año.toString()); // Usar 'anio' sin ñ para evitar problemas de codificación
    params.append('mes', mes.toString());
    
    return await fetchAPI(`/reservas/por-mes?${params.toString()}`);
  },

  // Cancelar una reserva
  cancelarReserva: async (reservaId, nota = null) => {
    const body = nota ? { nota } : {};
    return await fetchAPI(`/reservas/${reservaId}`, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  },

  // Enviar email a un cliente
  enviarEmailACliente: async (reservaId, asunto, mensaje) => {
    return await fetchAPI(`/reservas/${reservaId}/enviar-email`, {
      method: 'POST',
      body: JSON.stringify({ asunto, mensaje })
    });
  }
};

// Servicios de reseñas
export const resenasService = {
  // Crear nueva reseña
  crearResena: async (negocioCodigo, usuarioEmail, rating, texto) => {
    return await fetchAPI('/resenas', {
      method: 'POST',
      body: JSON.stringify({ negocioCodigo, usuarioEmail, rating, texto })
    });
  },

  // Obtener reseñas de un negocio (para el panel del dueño)
  obtenerResenasPorNegocio: async (codigo) => {
    return await fetchAPI(`/resenas/negocio/${codigo}`);
  },

  // Obtener reseñas públicas (aprobadas) de un negocio
  obtenerResenasPublicas: async (codigo) => {
    return await fetchAPI(`/resenas/negocio/${codigo}/publicas`);
  },

  // Aprobar, rechazar o poner en pendiente una reseña
  aprobarResena: async (id, aprobar, negocioCodigo) => {
    return await fetchAPI(`/resenas/${id}/aprobar?negocioCodigo=${encodeURIComponent(negocioCodigo)}`, {
      method: 'PUT',
      body: JSON.stringify({ aprobar })
    });
  },

  // Eliminar una reseña
  eliminarResena: async (id, negocioCodigo) => {
    return await fetchAPI(`/resenas/${id}?negocioCodigo=${encodeURIComponent(negocioCodigo)}`, {
      method: 'DELETE'
    });
  }
};

// Servicios de negocios
export const negociosService = {
  // Obtener negocio por código
  obtenerNegocio: async (codigo) => {
    return await fetchAPI(`/negocios/${codigo}`);
  },

  // Actualizar ordenamiento de reseñas
  actualizarOrdenResenas: async (codigo, ordenResenas) => {
    return await fetchAPI(`/negocios/${codigo}/orden-resenas`, {
      method: 'PUT',
      body: JSON.stringify({ ordenResenas })
    });
  },

  // Actualizar horarios del negocio
  actualizarHorarios: async (codigo, horarios) => {
    return await fetchAPI(`/negocios/${codigo}/horarios`, {
      method: 'PUT',
      body: JSON.stringify(horarios)
    });
  },
  
  // Actualizar categorías del negocio
  actualizarCategorias: async (codigo, categorias) => {
    return await fetchAPI(`/negocios/${codigo}/categorias`, {
      method: 'PUT',
      body: JSON.stringify({ categorias })
    });
  }
};

// Servicios de horarios bloqueados
export const horariosBloqueadosService = {
  // Bloquear un horario
  bloquearHorario: async (establecimiento, fecha, hora, profesionalId, motivo = null) => {
    const params = new URLSearchParams({
      establecimiento,
      fecha,
      hora,
      profesionalId: profesionalId.toString()
    });
    if (motivo) params.append('motivo', motivo);
    
    return await fetchAPI(`/horarios-bloqueados?${params}`, {
      method: 'POST'
    });
  },

  // Desbloquear un horario
  desbloquearHorario: async (establecimiento, fecha, hora, profesionalId) => {
    const params = new URLSearchParams({
      establecimiento,
      fecha,
      hora,
      profesionalId: profesionalId.toString()
    });
    
    return await fetchAPI(`/horarios-bloqueados?${params}`, {
      method: 'DELETE'
    });
  },

  // Obtener horarios bloqueados
  obtenerHorariosBloqueados: async (establecimiento, fecha, profesionalId) => {
    const params = new URLSearchParams({
      establecimiento,
      fecha,
      profesionalId: profesionalId.toString()
    });
    
    return await fetchAPI(`/horarios-bloqueados?${params}`);
  }
};

// Servicios de personal
export const personalService = {
  // Obtener todo el personal de un establecimiento
  obtenerPersonal: async (establecimiento) => {
    return await fetchAPI(`/personal/${establecimiento}`);
  },

  // Crear nuevo miembro del personal
  crearPersonal: async (establecimiento, personalData) => {
    return await fetchAPI(`/personal/${establecimiento}`, {
      method: 'POST',
      body: JSON.stringify(personalData)
    });
  },

  // Actualizar miembro del personal
  actualizarPersonal: async (establecimiento, idPersonal, personalData) => {
    return await fetchAPI(`/personal/${establecimiento}/${idPersonal}`, {
      method: 'PUT',
      body: JSON.stringify(personalData)
    });
  },

  // Eliminar miembro del personal
  eliminarPersonal: async (establecimiento, idPersonal) => {
    return await fetchAPI(`/personal/${establecimiento}/${idPersonal}`, {
      method: 'DELETE'
    });
  },

  actualizarOrdenPersonal: async (establecimiento, ids) => {
    return await fetchAPI(`/personal/${establecimiento}/orden`, {
      method: 'PUT',
      body: JSON.stringify({ ids })
    });
  }
};

// Servicios de servicios
export const servicioService = {
  // Obtener servicios de un establecimiento
  obtenerServicios: async (establecimiento) => {
    return await fetchAPI(`/servicios/${establecimiento}`);
  },
  
  // Crear nuevo servicio
  crearServicio: async (establecimiento, servicioData) => {
    return await fetchAPI(`/servicios/${establecimiento}`, {
      method: 'POST',
      body: JSON.stringify(servicioData)
    });
  },
  
  // Actualizar servicio
  actualizarServicio: async (establecimiento, idServicio, servicioData) => {
    return await fetchAPI(`/servicios/${establecimiento}/${idServicio}`, {
      method: 'PUT',
      body: JSON.stringify(servicioData)
    });
  },
  
  // Eliminar servicio
  eliminarServicio: async (establecimiento, idServicio) => {
    return await fetchAPI(`/servicios/${establecimiento}/${idServicio}`, {
      method: 'DELETE'
    });
  },

  // Reordenar servicios (ids = array de idServicio en el orden deseado)
  actualizarOrdenServicios: async (establecimiento, ids) => {
    return await fetchAPI(`/servicios/${establecimiento}/orden`, {
      method: 'PUT',
      body: JSON.stringify({ ids })
    });
  }
};

// Servicios de días cancelados
export const diasCanceladosService = {
  // Cancelar un día
  cancelarDia: async (establecimiento, fecha, motivo) => {
    const params = new URLSearchParams({
      establecimiento,
      fecha
    });
    if (motivo) params.append('motivo', motivo);
    
    return await fetchAPI(`/dias-cancelados?${params}`, {
      method: 'POST'
    });
  },

  // Restaurar un día cancelado
  restaurarDia: async (establecimiento, fecha) => {
    const params = new URLSearchParams({
      establecimiento,
      fecha
    });
    
    return await fetchAPI(`/dias-cancelados?${params}`, {
      method: 'DELETE'
    });
  },

  // Obtener días cancelados
  obtenerDiasCancelados: async (establecimiento, fechaDesde) => {
    let url = `/dias-cancelados/${establecimiento}`;
    if (fechaDesde) {
      url += `?fechaDesde=${fechaDesde}`;
    }
    return await fetchAPI(url);
  },

  // Verificar si un día está cancelado
  verificarDiaCancelado: async (establecimiento, fecha) => {
    const params = new URLSearchParams({
      fecha
    });
    
    return await fetchAPI(`/dias-cancelados/${establecimiento}/verificar?${params}`);
  }
};