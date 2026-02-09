package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.model.Personal;
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
@RequestMapping("/api/personal")
@CrossOrigin(origins = "*")
public class PersonalController {

    private final NegocioDataService negocioDataService;
    private final EmailService emailService;

    public PersonalController(NegocioDataService negocioDataService,
            EmailService emailService) {
        this.negocioDataService = negocioDataService;
        this.emailService = emailService;
    }

    // Obtener todo el personal de un establecimiento
    @GetMapping("/{establecimiento}")
    public ResponseEntity<ApiResponse<List<Personal>>> obtenerPersonal(
            @PathVariable String establecimiento) {
        try {
            List<NegocioData.PersonalData> personalData = negocioDataService.getPersonal(establecimiento).stream()
                    .filter(p -> p.getActivo() != null && p.getActivo())
                    .collect(Collectors.toList());

            List<Personal> personal = personalData.stream()
                    .map(p -> ModelConverter.personalDataToPersonal(p, establecimiento))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Personal obtenido exitosamente",
                    personal));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Error al obtener personal: " + e.getMessage(),
                            null));
        }
    }

    // Reordenar personal (el orden en la lista es el de visualización)
    @PutMapping("/{establecimiento}/orden")
    public ResponseEntity<ApiResponse<Void>> reordenarPersonal(
            @PathVariable String establecimiento,
            @RequestBody Map<String, List<Integer>> request) {
        try {
            List<Integer> ids = request.get("ids");
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "El campo 'ids' con la lista de idPersonal es requerido", null));
            }
            negocioDataService.reordenarPersonal(establecimiento.toLowerCase(), ids);
            return ResponseEntity.ok(new ApiResponse<>(true, "Orden actualizado correctamente", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error al reordenar personal: " + e.getMessage(), null));
        }
    }

    // Inicializar personal por defecto para barberia
    private void inicializarPersonalBarberia(String establecimiento) {
        try {
            // Datos iniciales del personal
            NegocioData.PersonalData[] personalInicial = {
                    crearPersonalData(1, "Carlos Mendoza", "Barbero Principal",
                            "/assets/img/establecimientos/barberia_ejemplo/personal/personal1.jpg",
                            List.of("Cortes Clásicos", "Afeitado Tradicional", "Diseño de Barba")),
                    crearPersonalData(2, "Miguel Rodríguez", "Barbero Senior",
                            "/assets/img/establecimientos/barberia_ejemplo/personal/personal2.jpg",
                            List.of("Cortes Modernos", "Degradados", "Coloración")),
                    crearPersonalData(3, "Juan Pérez", "Barbero",
                            "/assets/img/establecimientos/barberia_ejemplo/personal/personal3.jpg",
                            List.of("Cortes de Pelo", "Tratamientos", "Peinados")),
                    crearPersonalData(4, "Diego Sánchez", "Barbero",
                            "/assets/img/establecimientos/barberia_ejemplo/personal/personal4.jpg",
                            List.of("Barba", "Afeitado", "Cortes Clásicos"))
            };

            for (NegocioData.PersonalData p : personalInicial) {
                negocioDataService.addPersonal(establecimiento, p);
            }
        } catch (Exception e) {
            System.err.println("Error al inicializar personal: " + e.getMessage());
        }
    }

    // Helper para crear un objeto PersonalData
    private NegocioData.PersonalData crearPersonalData(Integer idPersonal, String nombre,
            String rol, String avatar, List<String> specialties) {
        NegocioData.PersonalData personal = new NegocioData.PersonalData();
        personal.setIdPersonal(idPersonal);
        personal.setNombre(nombre);
        personal.setRol(rol);
        personal.setAvatar(avatar);
        personal.setSpecialties(specialties);
        personal.setActivo(true);
        return personal;
    }

    // Crear nuevo miembro del personal
    @PostMapping("/{establecimiento}")
    public ResponseEntity<ApiResponse<Personal>> crearPersonal(
            @PathVariable String establecimiento,
            @RequestBody Personal personalData) {
        try {
            // Obtener el siguiente ID disponible
            Integer siguienteId = negocioDataService.obtenerSiguienteIdPersonal(establecimiento);

            NegocioData.PersonalData nuevoPersonalData = new NegocioData.PersonalData();
            nuevoPersonalData.setIdPersonal(siguienteId);
            nuevoPersonalData.setNombre(personalData.getNombre());
            nuevoPersonalData.setRol(personalData.getRol());
            nuevoPersonalData.setAvatar(personalData.getAvatar());
            nuevoPersonalData.setSpecialties(personalData.getSpecialties());
            nuevoPersonalData.setActivo(true);

            negocioDataService.addPersonal(establecimiento, nuevoPersonalData);

            Personal personalGuardado = ModelConverter.personalDataToPersonal(nuevoPersonalData, establecimiento);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(
                            true,
                            "Personal creado exitosamente",
                            personalGuardado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Error al crear personal: " + e.getMessage(),
                            null));
        }
    }

    // Actualizar miembro del personal
    @PutMapping("/{establecimiento}/{idPersonal}")
    public ResponseEntity<ApiResponse<Personal>> actualizarPersonal(
            @PathVariable String establecimiento,
            @PathVariable Integer idPersonal,
            @RequestBody Personal personalData) {
        try {
            Optional<NegocioData.PersonalData> personalOpt = negocioDataService
                    .findPersonalByIdPersonal(establecimiento, idPersonal);

            if (personalOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Personal no encontrado",
                                null));
            }

            NegocioData.PersonalData personal = personalOpt.get();
            personal.setNombre(personalData.getNombre());
            personal.setRol(personalData.getRol());
            personal.setAvatar(personalData.getAvatar());
            personal.setSpecialties(personalData.getSpecialties());

            // Actualizar usando el servicio
            negocioDataService.updatePersonal(establecimiento, personal.getId(), "nombre", personal.getNombre());
            negocioDataService.updatePersonal(establecimiento, personal.getId(), "rol", personal.getRol());
            negocioDataService.updatePersonal(establecimiento, personal.getId(), "avatar", personal.getAvatar());
            negocioDataService.updatePersonal(establecimiento, personal.getId(), "specialties",
                    personal.getSpecialties());

            Personal personalActualizado = ModelConverter.personalDataToPersonal(personal, establecimiento);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Personal actualizado exitosamente",
                    personalActualizado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Error al actualizar personal: " + e.getMessage(),
                            null));
        }
    }

    // Método auxiliar para desactivar todos los registros duplicados
    private void desactivarDuplicados(String establecimiento, Integer idPersonal) {
        List<NegocioData.PersonalData> duplicados = negocioDataService.getPersonal(establecimiento).stream()
                .filter(p -> p.getIdPersonal().equals(idPersonal))
                .collect(Collectors.toList());

        // Si hay más de uno, desactivar todos excepto el primero activo
        if (duplicados.size() > 1) {
            // Encontrar el primero activo o el primero en general
            NegocioData.PersonalData principal = duplicados.stream()
                    .filter(p -> p.getActivo() != null && p.getActivo())
                    .findFirst()
                    .orElse(duplicados.get(0));

            // Desactivar todos los demás
            for (NegocioData.PersonalData p : duplicados) {
                if (!p.getId().equals(principal.getId())) {
                    negocioDataService.updatePersonal(establecimiento, p.getId(), "activo", false);
                }
            }
        }
    }

    // Eliminar (desactivar) miembro del personal
    @DeleteMapping("/{establecimiento}/{idPersonal}")
    public ResponseEntity<ApiResponse<Void>> eliminarPersonal(
            @PathVariable String establecimiento,
            @PathVariable Integer idPersonal) {
        try {
            // Primero, desactivar duplicados si existen
            desactivarDuplicados(establecimiento, idPersonal);

            Optional<NegocioData.PersonalData> personalOpt = negocioDataService
                    .findPersonalByIdPersonal(establecimiento, idPersonal);

            if (personalOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Personal no encontrado",
                                null));
            }

            NegocioData.PersonalData personal = personalOpt.get();
            String nombrePersonal = personal.getNombre();

            // Buscar todas las reservas del miembro del personal
            List<NegocioData.ReservaData> reservasDelPersonalData = negocioDataService
                    .getReservasByProfesional(establecimiento, idPersonal);

            // Convertir a Reserva para el procesamiento
            List<Reserva> reservasDelPersonal = reservasDelPersonalData.stream()
                    .map(r -> ModelConverter.reservaDataToReserva(r, establecimiento))
                    .collect(Collectors.toList());

            // Guardar información de reservas para enviar emails en segundo plano
            final List<Reserva> reservasParaEmails = new java.util.ArrayList<>(reservasDelPersonal);
            final String nombrePersonalFinal = nombrePersonal;
            final String establecimientoFinal = establecimiento;

            // Eliminar las reservas inmediatamente (sin esperar emails)
            int reservasEliminadas = 0;
            for (NegocioData.ReservaData reservaData : reservasDelPersonalData) {
                try {
                    negocioDataService.removeReserva(establecimiento, reservaData.getId());
                    reservasEliminadas++;
                } catch (Exception e) {
                    System.err.println("Error al eliminar reserva " + reservaData.getId() +
                            " al eliminar personal: " + e.getMessage());
                }
            }

            // Desactivar el miembro del personal inmediatamente
            negocioDataService.updatePersonal(establecimiento, personal.getId(), "activo", false);

            // Enviar emails en segundo plano (no bloquea la respuesta)
            if (!reservasParaEmails.isEmpty()) {
                new Thread(() -> {
                    for (Reserva reserva : reservasParaEmails) {
                        try {
                            // Preparar el mensaje de email
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

                            // Formatear fecha y hora para el mensaje
                            java.text.SimpleDateFormat sdfFecha = new java.text.SimpleDateFormat("dd/MM/yyyy");
                            String fechaFormateada = sdfFecha.format(reserva.getFecha());

                            String asunto = "Cancelación de Turno - " + establecimientoFinal;
                            String mensaje = "Estimado/a " + nombreCompletoCliente + ",\n\n" +
                                    "Lamentamos informarle que su turno ha sido cancelado porque " +
                                    nombrePersonalFinal + " ha finalizado de trabajar con nosotros.\n\n" +
                                    "Detalles del turno cancelado:\n" +
                                    "- Fecha: " + fechaFormateada + "\n" +
                                    "- Hora: " + reserva.getHora() + "\n" +
                                    "- Profesional: " + nombrePersonalFinal + "\n\n" +
                                    "Disculpe las molestias. Si desea otro turno, por favor vuelva a reservar.\n\n" +
                                    "Saludos cordiales,\n" +
                                    "Equipo de " + establecimientoFinal;

                            // Enviar email al cliente (en segundo plano)
                            emailService.enviarEmailPersonalizado(emailCliente, asunto, mensaje);

                        } catch (Exception e) {
                            System.err.println("Error al enviar email para reserva " + reserva.getId() +
                                    " al eliminar personal: " + e.getMessage());
                        }
                    }
                }).start();
            }

            String mensajeRespuesta = "Personal eliminado exitosamente. " +
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
                            "Error al eliminar personal: " + e.getMessage(),
                            null));
        }
    }
}
