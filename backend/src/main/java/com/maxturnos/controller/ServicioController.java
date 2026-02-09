package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.model.Servicio;
import com.maxturnos.model.Reserva;
import com.maxturnos.model.NegocioData;
import com.maxturnos.util.ModelConverter;
import com.maxturnos.service.NegocioDataService;
import com.maxturnos.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "*")
public class ServicioController {

    private final NegocioDataService negocioDataService;
    private final EmailService emailService;

    public ServicioController(NegocioDataService negocioDataService,
            EmailService emailService) {
        this.negocioDataService = negocioDataService;
        this.emailService = emailService;
    }

    // Obtener todos los servicios de un establecimiento
    @GetMapping("/{establecimiento}")
    public ResponseEntity<ApiResponse<List<Servicio>>> obtenerServicios(
            @PathVariable String establecimiento) {
        try {
            List<NegocioData.ServicioData> serviciosData = negocioDataService.getServicios(establecimiento).stream()
                    .filter(s -> s.getActivo() != null && s.getActivo())
                    .collect(Collectors.toList());

            List<Servicio> servicios = serviciosData.stream()
                    .map(s -> ModelConverter.servicioDataToServicio(s, establecimiento))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Servicios obtenidos exitosamente",
                    servicios));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Error al obtener servicios: " + e.getMessage(),
                            null));
        }
    }

    // Reordenar servicios (el orden en la lista es el de visualización en la página del negocio)
    @PutMapping("/{establecimiento}/orden")
    public ResponseEntity<ApiResponse<Void>> reordenarServicios(
            @PathVariable String establecimiento,
            @RequestBody Map<String, List<Integer>> request) {
        try {
            List<Integer> ids = request.get("ids");
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "El campo 'ids' con la lista de idServicio es requerido", null));
            }
            negocioDataService.reordenarServicios(establecimiento.toLowerCase(), ids);
            return ResponseEntity.ok(new ApiResponse<>(true, "Orden actualizado correctamente", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error al reordenar servicios: " + e.getMessage(), null));
        }
    }

    // Inicializar servicios por defecto para barberia
    private void inicializarServiciosBarberia(String establecimiento) {
        try {
            NegocioData.ServicioData[] serviciosIniciales = {
                    crearServicioData(1, "Corte de Pelo Clásico", "Cortes",
                            "30 min", "$2500",
                            "Corte tradicional con tijera y máquina, incluye peinado y acabado profesional."),
                    crearServicioData(2, "Corte de Pelo Moderno", "Cortes",
                            "45 min", "$3000",
                            "Corte con técnicas modernas, degradado y diseño personalizado según tu estilo."),
                    crearServicioData(3, "Corte de Barba", "Barba",
                            "25 min", "$2000",
                            "Arreglo completo de barba con tijera, navaja y acabado con productos premium."),
                    crearServicioData(4, "Corte + Barba", "Paquetes",
                            "60 min", "$4500",
                            "Paquete completo: corte de pelo y arreglo de barba con todos los servicios incluidos."),
                    crearServicioData(5, "Afeitado Clásico", "Barba",
                            "30 min", "$2500",
                            "Afeitado tradicional con navaja caliente, toalla caliente y productos de primera calidad."),
                    crearServicioData(6, "Tratamiento Capilar", "Tratamientos",
                            "40 min", "$3500",
                            "Tratamiento hidratante y reparador para el cabello con productos profesionales."),
                    crearServicioData(7, "Coloración", "Color",
                            "90 min", "$6000",
                            "Coloración profesional con productos de alta calidad y acabado perfecto."),
                    crearServicioData(8, "Lavado y Peinado", "Servicios",
                            "20 min", "$1500",
                            "Lavado profesional con productos premium y peinado según tu preferencia.")
            };

            for (NegocioData.ServicioData servicio : serviciosIniciales) {
                negocioDataService.addServicio(establecimiento, servicio);
            }
        } catch (Exception e) {
            System.err.println("Error al inicializar servicios: " + e.getMessage());
        }
    }

    private NegocioData.ServicioData crearServicioData(Integer idServicio, String nombre,
            String categoria, String duracion, String precio, String descripcion) {
        NegocioData.ServicioData servicio = new NegocioData.ServicioData();
        servicio.setIdServicio(idServicio);
        servicio.setNombre(nombre);
        servicio.setCategoria(categoria);
        servicio.setDuracion(duracion);
        servicio.setPrecio(precio);
        servicio.setDescripcion(descripcion);
        servicio.setActivo(true);
        return servicio;
    }

    // Crear nuevo servicio
    @PostMapping("/{establecimiento}")
    public ResponseEntity<ApiResponse<Servicio>> crearServicio(
            @PathVariable String establecimiento,
            @RequestBody Servicio servicioData) {
        try {
            Integer siguienteId = negocioDataService.obtenerSiguienteIdServicio(establecimiento);

            NegocioData.ServicioData nuevoServicioData = new NegocioData.ServicioData();
            nuevoServicioData.setIdServicio(siguienteId);
            nuevoServicioData.setNombre(servicioData.getNombre());
            nuevoServicioData.setCategoria(servicioData.getCategoria());
            nuevoServicioData.setDuracion(servicioData.getDuracion());
            nuevoServicioData.setPrecio(servicioData.getPrecio());
            nuevoServicioData.setDescripcion(servicioData.getDescripcion());
            nuevoServicioData.setActivo(true);

            negocioDataService.addServicio(establecimiento, nuevoServicioData);

            Servicio servicioCreado = ModelConverter.servicioDataToServicio(nuevoServicioData, establecimiento);

            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                    true,
                    "Servicio creado exitosamente",
                    servicioCreado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Error al crear servicio: " + e.getMessage(),
                            null));
        }
    }

    // Actualizar servicio
    @PutMapping("/{establecimiento}/{idServicio}")
    public ResponseEntity<ApiResponse<Servicio>> actualizarServicio(
            @PathVariable String establecimiento,
            @PathVariable Integer idServicio,
            @RequestBody Servicio servicioData) {
        try {
            // Desactivar duplicados si existen
            desactivarDuplicados(establecimiento, idServicio);

            Optional<NegocioData.ServicioData> servicioOpt = negocioDataService
                    .findServicioByIdServicio(establecimiento, idServicio);

            if (servicioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Servicio no encontrado",
                                null));
            }

            NegocioData.ServicioData servicio = servicioOpt.get();
            servicio.setNombre(servicioData.getNombre());
            servicio.setCategoria(servicioData.getCategoria());
            servicio.setDuracion(servicioData.getDuracion());
            servicio.setPrecio(servicioData.getPrecio());
            servicio.setDescripcion(servicioData.getDescripcion());

            // Actualizar usando el servicio
            negocioDataService.updateServicio(establecimiento, servicio.getId(), "nombre", servicio.getNombre());
            negocioDataService.updateServicio(establecimiento, servicio.getId(), "categoria", servicio.getCategoria());
            negocioDataService.updateServicio(establecimiento, servicio.getId(), "duracion", servicio.getDuracion());
            negocioDataService.updateServicio(establecimiento, servicio.getId(), "precio", servicio.getPrecio());
            negocioDataService.updateServicio(establecimiento, servicio.getId(), "descripcion",
                    servicio.getDescripcion());

            Servicio servicioActualizado = ModelConverter.servicioDataToServicio(servicio, establecimiento);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Servicio actualizado exitosamente",
                    servicioActualizado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Error al actualizar servicio: " + e.getMessage(),
                            null));
        }
    }

    // Eliminar (desactivar) servicio
    @DeleteMapping("/{establecimiento}/{idServicio}")
    public ResponseEntity<ApiResponse<Void>> eliminarServicio(
            @PathVariable String establecimiento,
            @PathVariable Integer idServicio) {
        try {
            // Primero, desactivar duplicados si existen
            desactivarDuplicados(establecimiento, idServicio);

            Optional<NegocioData.ServicioData> servicioOpt = negocioDataService
                    .findServicioByIdServicio(establecimiento, idServicio);

            if (servicioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Servicio no encontrado",
                                null));
            }

            NegocioData.ServicioData servicio = servicioOpt.get();
            String nombreServicio = servicio.getNombre();

            // Buscar todas las reservas del servicio
            List<NegocioData.ReservaData> reservasDelServicioData = negocioDataService
                    .getReservasByServicio(establecimiento, idServicio);

            // Convertir a Reserva para el procesamiento
            List<Reserva> reservasDelServicio = reservasDelServicioData.stream()
                    .map(r -> ModelConverter.reservaDataToReserva(r, establecimiento))
                    .collect(Collectors.toList());

            // Guardar información de reservas para enviar emails en segundo plano
            final List<Reserva> reservasParaEmails = new java.util.ArrayList<>(reservasDelServicio);
            final String nombreServicioFinal = nombreServicio;
            final String establecimientoFinal = establecimiento;

            // Eliminar las reservas inmediatamente (sin esperar emails)
            int reservasEliminadas = 0;
            for (NegocioData.ReservaData reservaData : reservasDelServicioData) {
                try {
                    negocioDataService.removeReserva(establecimiento, reservaData.getId());
                    reservasEliminadas++;
                } catch (Exception e) {
                    System.err.println("Error al eliminar reserva " + reservaData.getId() +
                            " al eliminar servicio: " + e.getMessage());
                }
            }

            // Desactivar el servicio inmediatamente
            negocioDataService.updateServicio(establecimiento, servicio.getId(), "activo", false);

            // Enviar emails en segundo plano (no bloquea la respuesta)
            if (!reservasParaEmails.isEmpty()) {
                new Thread(() -> {
                    for (Reserva reserva : reservasParaEmails) {
                        try {
                            String emailCliente = reserva.getUsuarioEmail();
                            if (emailCliente == null || emailCliente.isEmpty()) {
                                continue;
                            }

                            String nombreCliente = reserva.getUsuarioNombre() != null ? reserva.getUsuarioNombre()
                                    : "Cliente";
                            String apellidoCliente = reserva.getUsuarioApellido() != null ? reserva.getUsuarioApellido()
                                    : "";
                            String nombreCompletoCliente = nombreCliente +
                                    (apellidoCliente.isEmpty() ? "" : " " + apellidoCliente);

                            java.text.SimpleDateFormat sdfFecha = new java.text.SimpleDateFormat("dd/MM/yyyy");
                            String fechaFormateada = sdfFecha.format(reserva.getFecha());

                            String asunto = "Cancelación de Turno - " + establecimientoFinal;
                            String mensaje = "Estimado/a " + nombreCompletoCliente + ",\n\n" +
                                    "Lamentamos informarle que su turno ha sido cancelado porque el servicio " +
                                    nombreServicioFinal + " ya no está disponible.\n\n" +
                                    "Detalles del turno cancelado:\n" +
                                    "- Fecha: " + fechaFormateada + "\n" +
                                    "- Hora: " + reserva.getHora() + "\n" +
                                    "- Servicio: " + nombreServicioFinal + "\n\n" +
                                    "Disculpe las molestias. Si desea otro turno, por favor vuelva a reservar.\n\n" +
                                    "Saludos cordiales,\n" +
                                    "Equipo de " + establecimientoFinal;

                            emailService.enviarEmailPersonalizado(emailCliente, asunto, mensaje);

                        } catch (Exception e) {
                            System.err.println("Error al enviar email para reserva " + reserva.getId() +
                                    " al eliminar servicio: " + e.getMessage());
                        }
                    }
                }).start();
            }

            String mensajeRespuesta = "Servicio eliminado exitosamente. " +
                    "Se eliminaron " + reservasEliminadas + " reserva(s). " +
                    "Los emails de notificación se están enviando en segundo plano.";

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    mensajeRespuesta,
                    null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Error al eliminar servicio: " + e.getMessage(),
                            null));
        }
    }

    // Método auxiliar para desactivar duplicados
    private void desactivarDuplicados(String establecimiento, Integer idServicio) {
        List<NegocioData.ServicioData> duplicados = negocioDataService.getServicios(establecimiento).stream()
                .filter(s -> s.getIdServicio().equals(idServicio))
                .collect(Collectors.toList());

        if (duplicados.size() > 1) {
            // Mantener solo el primero activo, desactivar los demás
            boolean primeroEncontrado = false;
            for (NegocioData.ServicioData servicio : duplicados) {
                if (servicio.getActivo() != null && servicio.getActivo() && !primeroEncontrado) {
                    primeroEncontrado = true;
                } else if (servicio.getActivo() != null && servicio.getActivo()) {
                    negocioDataService.updateServicio(establecimiento, servicio.getId(), "activo", false);
                }
            }
        }
    }
}
