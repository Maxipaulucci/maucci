package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.dto.CancelarReservaRequest;
import com.maxturnos.dto.EnviarEmailRequest;
import com.maxturnos.dto.ReservaRequest;
import com.maxturnos.model.Negocio;
import com.maxturnos.model.Reserva;
import com.maxturnos.model.Usuario;
import com.maxturnos.repository.NegocioRepository;
import com.maxturnos.repository.UsuarioRepository;
import com.maxturnos.service.EmailService;
import com.maxturnos.service.NegocioDataService;
import com.maxturnos.service.ReservaService;
import com.maxturnos.model.NegocioData;
import com.maxturnos.util.ModelConverter;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {
    
    private final ReservaService reservaService;
    private final NegocioRepository negocioRepository;
    private final UsuarioRepository usuarioRepository;
    private final NegocioDataService negocioDataService;
    private final EmailService emailService;
    
    public ReservaController(ReservaService reservaService,
                             NegocioRepository negocioRepository,
                             UsuarioRepository usuarioRepository,
                             NegocioDataService negocioDataService,
                             EmailService emailService) {
        this.reservaService = reservaService;
        this.negocioRepository = negocioRepository;
        this.usuarioRepository = usuarioRepository;
        this.negocioDataService = negocioDataService;
        this.emailService = emailService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Reserva>> crearReserva(@Valid @RequestBody ReservaRequest request) {
        try {
            // Parsear la fecha desde el string "YYYY-MM-DD" para evitar problemas de zona horaria
            Date fechaNormalizada = null;
            if (request.getFecha() != null && !request.getFecha().trim().isEmpty()) {
                try {
                    // Parsear el string "YYYY-MM-DD" directamente
                    String fechaStr = request.getFecha().trim();
                    String[] partes = fechaStr.split("-");
                    if (partes.length == 3) {
                        int año = Integer.parseInt(partes[0]);
                        int mes = Integer.parseInt(partes[1]) - 1; // Calendar.MONTH es 0-based
                        int dia = Integer.parseInt(partes[2]);
                        
                        // Crear fecha en zona horaria local a medianoche
                        Calendar cal = Calendar.getInstance();
                        cal.set(Calendar.YEAR, año);
                        cal.set(Calendar.MONTH, mes);
                        cal.set(Calendar.DAY_OF_MONTH, dia);
                        cal.set(Calendar.HOUR_OF_DAY, 0);
                        cal.set(Calendar.MINUTE, 0);
                        cal.set(Calendar.SECOND, 0);
                        cal.set(Calendar.MILLISECOND, 0);
                        fechaNormalizada = cal.getTime();
                        
                        System.out.println("📅 Fecha recibida (string): " + fechaStr);
                        System.out.println("📅 Fecha parseada: " + fechaNormalizada);
                        System.out.println("   Año: " + año + ", Mes: " + (mes + 1) + ", Día: " + dia);
                    } else {
                        throw new RuntimeException("Formato de fecha inválido. Se espera YYYY-MM-DD");
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error al parsear la fecha: " + e.getMessage());
                }
            } else {
                throw new RuntimeException("La fecha es requerida");
            }
            
            Reserva reserva = new Reserva();
            reserva.setEstablecimiento(request.getEstablecimiento());
            reserva.setFecha(fechaNormalizada);
            reserva.setHora(request.getHora());
            reserva.setUsuarioEmail(request.getUsuarioEmail());
            reserva.setNotas(request.getNotas() != null ? request.getNotas() : "");
            
            // Obtener nombre y apellido del usuario
            Usuario usuario = usuarioRepository.findByEmail(request.getUsuarioEmail())
                .orElse(null);
            if (usuario != null) {
                reserva.setUsuarioNombre(usuario.getNombre());
                reserva.setUsuarioApellido(usuario.getApellido());
            }
            
            // Convertir servicio
            Reserva.ServicioInfo servicioInfo = new Reserva.ServicioInfo();
            servicioInfo.setId(request.getServicio().getId());
            servicioInfo.setName(request.getServicio().getName());
            servicioInfo.setDuration(request.getServicio().getDuration());
            servicioInfo.setPrice(request.getServicio().getPrice());
            reserva.setServicio(servicioInfo);
            
            // Convertir profesional
            Reserva.ProfesionalInfo profesionalInfo = new Reserva.ProfesionalInfo();
            profesionalInfo.setId(request.getProfesional().getId());
            profesionalInfo.setName(request.getProfesional().getName());
            reserva.setProfesional(profesionalInfo);
            
            // Calcular duración en minutos
            Integer duracionMinutos = reservaService.parseDuration(request.getServicio().getDuration());
            if (duracionMinutos == 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Duración del servicio inválida"));
            }
            reserva.setDuracionMinutos(duracionMinutos);
            
            Reserva nuevaReserva = reservaService.crearReserva(reserva);
            
            // Enviar emails de confirmación de forma asíncrona (no bloquea la respuesta)
            // Usar un hilo separado para no bloquear la respuesta al cliente
            final Reserva reservaFinal = nuevaReserva; // Variable final para usar en el hilo
            final Usuario usuarioFinal = usuario; // Variable final para usar en el hilo
            
            new Thread(() -> {
                try {
                    // Formatear fecha para mostrar
                    SimpleDateFormat sdfFecha = new SimpleDateFormat("dd/MM/yyyy");
                    String fechaFormateada = sdfFecha.format(reservaFinal.getFecha());
                
                    // Email al cliente
                    String nombreCliente = (usuarioFinal != null && (usuarioFinal.getNombre() != null || usuarioFinal.getApellido() != null))
                        ? (usuarioFinal.getNombre() != null ? usuarioFinal.getNombre() : "") + 
                          (usuarioFinal.getApellido() != null ? " " + usuarioFinal.getApellido() : "")
                        : "Cliente";
                    nombreCliente = nombreCliente.trim();
                    
                    String asuntoCliente = "Confirmación de Turno - " + reservaFinal.getEstablecimiento();
                    String mensajeCliente = String.format(
                        "Hola %s,\n\n" +
                        "Tu turno ha sido confirmado exitosamente.\n\n" +
                        "Detalles de tu reserva:\n" +
                        "- Fecha: %s\n" +
                        "- Hora: %s\n" +
                        "- Servicio: %s\n" +
                        "- Profesional: %s\n" +
                        "- Duración: %s\n" +
                        "%s\n\n" +
                        "Te esperamos en %s.\n\n" +
                        "Saludos cordiales,\n" +
                        "Equipo Maxturnos",
                        nombreCliente,
                        fechaFormateada,
                        reservaFinal.getHora(),
                        reservaFinal.getServicio().getName(),
                        reservaFinal.getProfesional().getName(),
                        reservaFinal.getServicio().getDuration(),
                        reservaFinal.getNotas() != null && !reservaFinal.getNotas().trim().isEmpty() 
                            ? "- Notas: " + reservaFinal.getNotas() + "\n" 
                            : "",
                        reservaFinal.getEstablecimiento()
                    );
                    
                    emailService.enviarEmailPersonalizado(
                        reservaFinal.getUsuarioEmail(),
                        asuntoCliente,
                        mensajeCliente
                    );
                
                    // Email al negocio - Buscar el admin del negocio
                    // Intentar buscar primero por código, luego por nombre del negocio
                    Usuario adminNegocio = null;
                    String establecimientoLower = reservaFinal.getEstablecimiento().toLowerCase().trim();
                    
                    // Intentar buscar por código del negocio (puede que el nombreNegocio en Usuario sea el código)
                    adminNegocio = usuarioRepository.findByNombreNegocioAndRol(establecimientoLower, "admin")
                        .orElse(null);
                    
                    // Si no se encuentra, buscar el negocio y usar su nombre
                    if (adminNegocio == null) {
                        Negocio negocio = negocioRepository.findByCodigo(establecimientoLower)
                            .orElse(null);
                        if (negocio != null && negocio.getNombre() != null) {
                            adminNegocio = usuarioRepository.findByNombreNegocioAndRol(
                                negocio.getNombre().toLowerCase().trim(),
                                "admin"
                            ).orElse(null);
                        }
                    }
                    
                    if (adminNegocio != null && adminNegocio.getEmail() != null) {
                        String asuntoNegocio = "Nueva Reserva - " + reservaFinal.getEstablecimiento();
                        String mensajeNegocio = String.format(
                            "Hola,\n\n" +
                            "Tienes una nueva reserva en %s.\n\n" +
                            "Detalles del turno:\n" +
                            "- Fecha: %s\n" +
                            "- Hora: %s\n" +
                            "- Cliente: %s (%s)\n" +
                            "- Servicio: %s\n" +
                            "- Profesional: %s\n" +
                            "- Duración: %s\n" +
                            "%s\n\n" +
                            "Saludos cordiales,\n" +
                            "Equipo Maxturnos",
                            reservaFinal.getEstablecimiento(),
                            fechaFormateada,
                            reservaFinal.getHora(),
                            nombreCliente,
                            reservaFinal.getUsuarioEmail(),
                            reservaFinal.getServicio().getName(),
                            reservaFinal.getProfesional().getName(),
                            reservaFinal.getServicio().getDuration(),
                            reservaFinal.getNotas() != null && !reservaFinal.getNotas().trim().isEmpty() 
                                ? "- Notas del cliente: " + reservaFinal.getNotas() + "\n" 
                                : ""
                        );
                        
                        emailService.enviarEmailPersonalizado(
                            adminNegocio.getEmail(),
                            asuntoNegocio,
                            mensajeNegocio
                        );
                    } else {
                        System.out.println("⚠️ No se encontró el email del negocio para: " + reservaFinal.getEstablecimiento());
                    }
                } catch (Exception e) {
                    // No fallar la creación de la reserva si hay error al enviar emails
                    System.err.println("Error al enviar emails de confirmación: " + e.getMessage());
                    e.printStackTrace();
                }
            }).start(); // Iniciar el hilo de forma asíncrona
            
            // Devolver respuesta inmediatamente sin esperar el envío de emails
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reserva creada exitosamente", nuevaReserva));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Reserva>>> obtenerReservas(
            @RequestParam String establecimiento,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) Integer profesionalId) {
        try {
            if (establecimiento == null || establecimiento.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El parámetro establecimiento es requerido"));
            }
            
            // Parsear la fecha desde el string "YYYY-MM-DD" si está presente
            Date fechaDate = null;
            if (fecha != null && !fecha.trim().isEmpty()) {
                try {
                    String fechaStr = fecha.trim();
                    String[] partes = fechaStr.split("-");
                    if (partes.length == 3) {
                        int año = Integer.parseInt(partes[0]);
                        int mes = Integer.parseInt(partes[1]) - 1; // Calendar.MONTH es 0-based
                        int dia = Integer.parseInt(partes[2]);
                        
                        // Crear fecha en zona horaria local a medianoche
                        Calendar cal = Calendar.getInstance();
                        cal.set(Calendar.YEAR, año);
                        cal.set(Calendar.MONTH, mes);
                        cal.set(Calendar.DAY_OF_MONTH, dia);
                        cal.set(Calendar.HOUR_OF_DAY, 0);
                        cal.set(Calendar.MINUTE, 0);
                        cal.set(Calendar.SECOND, 0);
                        cal.set(Calendar.MILLISECOND, 0);
                        fechaDate = cal.getTime();
                        
                        System.out.println("📅 Fecha recibida (string): " + fechaStr);
                        System.out.println("📅 Fecha parseada: " + fechaDate);
                        System.out.println("   Año: " + año + ", Mes: " + (mes + 1) + ", Día: " + dia);
                    }
                } catch (Exception e) {
                    System.err.println("Error al parsear la fecha: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Formato de fecha inválido. Se espera YYYY-MM-DD"));
                }
            }
            
            List<Reserva> reservas = reservaService.obtenerReservas(establecimiento, fechaDate, profesionalId);
            return ResponseEntity.ok(ApiResponse.success(reservas));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al obtener reservas: " + e.getMessage()));
        }
    }
    
    @GetMapping("/por-mes")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obtenerReservasPorMes(
            @RequestParam String establecimiento,
            @RequestParam Integer anio,
            @RequestParam Integer mes) {
        try {
            if (establecimiento == null || establecimiento.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El parámetro establecimiento es requerido"));
            }
            
            Map<String, Object> resultado = reservaService.obtenerReservasPorMes(establecimiento, anio, mes);
            return ResponseEntity.ok(ApiResponse.success(resultado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al obtener reservas por mes: " + e.getMessage()));
        }
    }
    
    @GetMapping("/horarios-disponibles")
    public ResponseEntity<ApiResponse<Map<String, Object>>> obtenerHorariosDisponibles(
            @RequestParam String establecimiento,
            @RequestParam String fecha,
            @RequestParam Integer profesionalId,
            @RequestParam Integer servicioId,
            @RequestParam Integer duracionMinutos) {
        try {
            // Parsear la fecha desde el string "YYYY-MM-DD" para evitar problemas de zona horaria
            Date fechaNormalizada = null;
            if (fecha != null && !fecha.trim().isEmpty()) {
                try {
                    String fechaStr = fecha.trim();
                    String[] partes = fechaStr.split("-");
                    if (partes.length == 3) {
                        int año = Integer.parseInt(partes[0]);
                        int mes = Integer.parseInt(partes[1]) - 1; // Calendar.MONTH es 0-based
                        int dia = Integer.parseInt(partes[2]);
                        
                        // Crear fecha en zona horaria local a medianoche
                        Calendar cal = Calendar.getInstance();
                        cal.set(Calendar.YEAR, año);
                        cal.set(Calendar.MONTH, mes);
                        cal.set(Calendar.DAY_OF_MONTH, dia);
                        cal.set(Calendar.HOUR_OF_DAY, 0);
                        cal.set(Calendar.MINUTE, 0);
                        cal.set(Calendar.SECOND, 0);
                        cal.set(Calendar.MILLISECOND, 0);
                        fechaNormalizada = cal.getTime();
                        
                        System.out.println("📅 [Horarios Disponibles] Fecha recibida (string): " + fechaStr);
                        System.out.println("📅 [Horarios Disponibles] Fecha parseada: " + fechaNormalizada);
                        System.out.println("📅 [Horarios Disponibles] Profesional ID: " + profesionalId);
                    } else {
                        throw new RuntimeException("Formato de fecha inválido. Se espera YYYY-MM-DD");
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error al parsear la fecha: " + e.getMessage());
                }
            } else {
                throw new RuntimeException("La fecha es requerida");
            }
            
            Map<String, Object> resultado = reservaService.obtenerHorariosDisponibles(
                establecimiento,
                fechaNormalizada,
                profesionalId,
                duracionMinutos
            );
            
            return ResponseEntity.ok(ApiResponse.success(resultado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelarReserva(
            @PathVariable String id,
            @RequestParam String establecimiento,
            @RequestBody(required = false) CancelarReservaRequest request) {
        try {
            // Buscar la reserva en las reservas activas
            List<NegocioData.ReservaData> reservas = negocioDataService.getReservas(establecimiento);
            NegocioData.ReservaData reservaData = reservas.stream()
                .filter(r -> r.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
            
            Reserva reserva = ModelConverter.reservaDataToReserva(reservaData, establecimiento);
            
            // Si hay una nota, enviar email al cliente
            if (request != null && request.getNota() != null && !request.getNota().trim().isEmpty()) {
                String nombreCliente = reserva.getUsuarioNombre() != null && reserva.getUsuarioApellido() != null
                    ? reserva.getUsuarioNombre() + " " + reserva.getUsuarioApellido()
                    : reserva.getUsuarioEmail();
                
                // Formatear fecha
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
                String fechaFormateada = dateFormat.format(reserva.getFecha());
                
                String mensaje = "Hola " + nombreCliente + ",\n\n";
                mensaje += "Lamentamos informarte que tu turno ha sido cancelado.\n\n";
                mensaje += "Detalles del turno:\n";
                mensaje += "- Fecha: " + fechaFormateada + "\n";
                mensaje += "- Hora: " + reserva.getHora() + "\n";
                mensaje += "- Servicio: " + (reserva.getServicio() != null ? reserva.getServicio().getName() : "N/A") + "\n\n";
                mensaje += "Nota: " + request.getNota() + "\n\n";
                mensaje += "Si tienes alguna pregunta, no dudes en contactarnos.\n\n";
                mensaje += "Saludos,\nEl equipo de Maxturnos";
                
                emailService.enviarEmailPersonalizado(
                    reserva.getUsuarioEmail(),
                    "Cancelación de Turno - Maxturnos",
                    mensaje
                );
            }
            
            // Eliminar la reserva de la base de datos
            // Al eliminar la reserva, el horario queda automáticamente disponible
            // para que otros usuarios puedan reservarlo nuevamente
            negocioDataService.removeReserva(establecimiento, id);
            
            return ResponseEntity.ok(ApiResponse.success("Reserva cancelada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al cancelar reserva: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/enviar-email")
    public ResponseEntity<ApiResponse<String>> enviarEmailACliente(
            @PathVariable String id,
            @RequestParam String establecimiento,
            @Valid @RequestBody EnviarEmailRequest request) {
        try {
            // Buscar la reserva en las reservas activas
            List<NegocioData.ReservaData> reservas = negocioDataService.getReservas(establecimiento);
            NegocioData.ReservaData reservaData = reservas.stream()
                .filter(r -> r.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
            
            Reserva reserva = ModelConverter.reservaDataToReserva(reservaData, establecimiento);
            
            boolean enviado = emailService.enviarEmailPersonalizado(
                reserva.getUsuarioEmail(),
                request.getAsunto(),
                request.getMensaje()
            );
            
            if (enviado) {
                return ResponseEntity.ok(ApiResponse.success("Email enviado exitosamente"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al enviar el email"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al enviar email: " + e.getMessage()));
        }
    }
}

