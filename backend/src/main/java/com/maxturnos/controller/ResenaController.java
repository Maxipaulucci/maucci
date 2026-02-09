package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.dto.ResenaRequest;
import com.maxturnos.model.Resena;
import com.maxturnos.model.NegocioData;
import com.maxturnos.model.Usuario;
import com.maxturnos.util.ModelConverter;
import com.maxturnos.service.NegocioDataService;
import com.maxturnos.repository.UsuarioRepository;
import com.maxturnos.repository.NegocioRepository;
import jakarta.validation.Valid;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Collections;
import java.util.Comparator;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "*")
public class ResenaController {

    private final NegocioDataService negocioDataService;
    private final UsuarioRepository usuarioRepository;
    private final NegocioRepository negocioRepository;
    private final MongoTemplate mongoTemplate;

    public ResenaController(NegocioDataService negocioDataService,
            UsuarioRepository usuarioRepository,
            NegocioRepository negocioRepository,
            MongoTemplate mongoTemplate) {
        this.negocioDataService = negocioDataService;
        this.usuarioRepository = usuarioRepository;
        this.negocioRepository = negocioRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // Crear una nueva reseña
    @PostMapping
    public ResponseEntity<ApiResponse<Resena>> crearResena(@Valid @RequestBody ResenaRequest request) {
        try {
            // Normalizar el código del negocio
            String negocioCodigo = request.getNegocioCodigo() != null
                    ? request.getNegocioCodigo().toLowerCase().trim()
                    : null;

            if (negocioCodigo == null || negocioCodigo.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("El código del negocio es requerido"));
            }

            // Obtener el usuario para obtener su nombre y apellido
            String usuarioEmail = request.getUsuarioEmail().toLowerCase().trim();
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(usuarioEmail);

            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();

            System.out.println("═══════════════════════════════════════");
            System.out.println("📝 Creando reseña:");
            System.out.println("Código negocio recibido: " + request.getNegocioCodigo());
            System.out.println("Código negocio normalizado: " + negocioCodigo);
            System.out.println("Nombre de colección: " + com.maxturnos.util.CollectionNameHelper.getNegocioCollection(negocioCodigo));
            System.out.println("Email usuario: " + usuarioEmail);
            System.out.println("Nombre usuario: " + usuario.getNombre());
            System.out.println("Apellido usuario: " + usuario.getApellido());

            NegocioData.ResenaData resenaData = new NegocioData.ResenaData();
            resenaData.setUsuarioEmail(usuarioEmail);
            resenaData.setUsuarioNombre(usuario.getNombre());
            resenaData.setUsuarioApellido(usuario.getApellido());
            resenaData.setRating(request.getRating());
            resenaData.setTexto(request.getTexto() != null ? request.getTexto().trim() : "");
            resenaData.setAprobada(null); // Por defecto está pendiente (null)
            resenaData.setFechaCreacion(LocalDateTime.now());

            negocioDataService.addResena(negocioCodigo, resenaData);
            
            System.out.println("✅ Reseña agregada al servicio. ID: " + resenaData.getId());

            Resena nuevaResena = ModelConverter.resenaDataToResena(resenaData, negocioCodigo);

            System.out.println("✅ Reseña guardada:");
            System.out.println("ID: " + nuevaResena.getId());
            System.out.println("Nombre guardado: " + nuevaResena.getUsuarioNombre());
            System.out.println("Apellido guardado: " + nuevaResena.getUsuarioApellido());
            System.out.println("═══════════════════════════════════════");

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Reseña creada exitosamente", nuevaResena));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al crear reseña: " + e.getMessage()));
        }
    }

    // Obtener reseñas de un negocio (para el panel del dueño - todas, aprobadas y
    // no aprobadas)
    @GetMapping("/negocio/{codigo}")
    public ResponseEntity<ApiResponse<List<Resena>>> obtenerResenasPorNegocio(@PathVariable String codigo) {
        try {
            String negocioCodigo = codigo.toLowerCase().trim();
            System.out.println("═══════════════════════════════════════");
            System.out.println("📋 Obteniendo reseñas para el negocio:");
            System.out.println("Código recibido: " + codigo);
            System.out.println("Código normalizado: " + negocioCodigo);
            System.out.println("Nombre de colección: "
                    + com.maxturnos.util.CollectionNameHelper.getNegocioCollection(negocioCodigo));

            List<NegocioData.ResenaData> resenasData = negocioDataService.getResenas(negocioCodigo);
            System.out.println("Reseñas encontradas: " + resenasData.size());

            List<Resena> resenas = resenasData.stream()
                    .map(r -> ModelConverter.resenaDataToResena(r, negocioCodigo))
                    .collect(java.util.stream.Collectors.toList());

            System.out.println("Reseñas convertidas: " + resenas.size());
            System.out.println("═══════════════════════════════════════");

            return ResponseEntity.ok(ApiResponse.success(resenas));
        } catch (Exception e) {
            System.err.println("❌ Error al obtener reseñas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al obtener reseñas: " + e.getMessage()));
        }
    }

    // Obtener solo reseñas aprobadas (para mostrar públicamente)
    @GetMapping("/negocio/{codigo}/publicas")
    public ResponseEntity<ApiResponse<List<Resena>>> obtenerResenasPublicas(@PathVariable String codigo) {
        try {
            List<NegocioData.ResenaData> resenasData = negocioDataService.getResenas(codigo.toLowerCase()).stream()
                    .filter(r -> r.getAprobada() != null && r.getAprobada())
                    .collect(java.util.stream.Collectors.toList());

            List<Resena> resenas = resenasData.stream()
                    .map(r -> ModelConverter.resenaDataToResena(r, codigo.toLowerCase()))
                    .collect(java.util.stream.Collectors.toList());

            // Obtener el negocio para ver el ordenamiento preferido
            Optional<com.maxturnos.model.Negocio> negocioOpt = negocioRepository
                    .findByCodigoAndActivoTrue(codigo.toLowerCase());
            String ordenResenas = "reciente-antigua"; // Por defecto: más reciente primero

            if (negocioOpt.isPresent() && negocioOpt.get().getOrdenResenas() != null) {
                ordenResenas = negocioOpt.get().getOrdenResenas();
            }

            // Ordenar según la preferencia del negocio
            switch (ordenResenas) {
                case "antigua-reciente":
                    resenas.sort((a, b) -> {
                        if (a.getFechaCreacion() == null && b.getFechaCreacion() == null)
                            return 0;
                        if (a.getFechaCreacion() == null)
                            return 1;
                        if (b.getFechaCreacion() == null)
                            return -1;
                        return a.getFechaCreacion().compareTo(b.getFechaCreacion());
                    });
                    break;
                case "reciente-antigua":
                    resenas.sort((a, b) -> {
                        if (a.getFechaCreacion() == null && b.getFechaCreacion() == null)
                            return 0;
                        if (a.getFechaCreacion() == null)
                            return 1;
                        if (b.getFechaCreacion() == null)
                            return -1;
                        return b.getFechaCreacion().compareTo(a.getFechaCreacion());
                    });
                    break;
                case "mayor-menor":
                    resenas.sort((a, b) -> {
                        if (a.getRating() == null && b.getRating() == null)
                            return 0;
                        if (a.getRating() == null)
                            return 1;
                        if (b.getRating() == null)
                            return -1;
                        return b.getRating().compareTo(a.getRating());
                    });
                    break;
                case "menor-mayor":
                    resenas.sort((a, b) -> {
                        if (a.getRating() == null && b.getRating() == null)
                            return 0;
                        if (a.getRating() == null)
                            return 1;
                        if (b.getRating() == null)
                            return -1;
                        return a.getRating().compareTo(b.getRating());
                    });
                    break;
            }

            return ResponseEntity.ok(ApiResponse.success(resenas));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al obtener reseñas: " + e.getMessage()));
        }
    }

    // Aprobar, rechazar o poner en pendiente una reseña
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<ApiResponse<Resena>> aprobarResena(
            @PathVariable String id,
            @RequestParam String negocioCodigo,
            @RequestBody Map<String, Object> request) {
        try {
            // Verificar que el campo 'aprobar' existe en el request (puede ser null, true,
            // o false)
            if (!request.containsKey("aprobar")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("El campo 'aprobar' es requerido"));
            }

            Object aprobarObj = request.get("aprobar");

            System.out.println("═══════════════════════════════════════");
            System.out.println("📝 Actualizando estado de reseña:");
            System.out.println("ID: " + id);
            System.out.println("Negocio: " + negocioCodigo);
            System.out.println(
                    "Valor recibido (tipo): " + (aprobarObj != null ? aprobarObj.getClass().getName() : "null"));
            System.out.println("Valor recibido: " + aprobarObj);

            // Buscar la reseña en la colección del negocio
            List<NegocioData.ResenaData> resenas = negocioDataService.getResenas(negocioCodigo.toLowerCase());
            Optional<NegocioData.ResenaData> resenaOpt = resenas.stream()
                    .filter(r -> r.getId().equals(id))
                    .findFirst();

            if (resenaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Reseña no encontrada"));
            }

            NegocioData.ResenaData resenaData = resenaOpt.get();
            System.out.println("Estado actual de la reseña - aprobada: " + resenaData.getAprobada());

            Boolean aprobarFinal = null;

            // Si aprobar es null, poner en pendiente (aprobada = null)
            if (aprobarObj == null) {
                aprobarFinal = null;
                System.out.println("✅ Estableciendo aprobada = null (pendiente)");
            } else {
                Boolean aprobar;
                // Manejar diferentes tipos de entrada
                if (aprobarObj instanceof Boolean) {
                    aprobar = (Boolean) aprobarObj;
                } else if (aprobarObj instanceof String) {
                    String str = ((String) aprobarObj).toLowerCase().trim();
                    if ("null".equals(str) || "".equals(str)) {
                        aprobar = null;
                    } else {
                        aprobar = Boolean.parseBoolean(str);
                    }
                } else {
                    aprobar = Boolean.parseBoolean(String.valueOf(aprobarObj));
                }

                aprobarFinal = aprobar;

                if (aprobar == null) {
                    System.out.println("✅ Estableciendo aprobada = null (pendiente)");
                } else {
                    System.out.println("✅ Estableciendo aprobada = " + aprobar);
                }
            }

            // Actualizar usando el servicio
            if (aprobarFinal == null) {
                negocioDataService.updateResena(negocioCodigo.toLowerCase(), id, "aprobada", null);
                negocioDataService.updateResena(negocioCodigo.toLowerCase(), id, "fechaAprobacion", null);
            } else {
                negocioDataService.updateResena(negocioCodigo.toLowerCase(), id, "aprobada", aprobarFinal);
                negocioDataService.updateResena(negocioCodigo.toLowerCase(), id, "fechaAprobacion",
                        LocalDateTime.now());
            }

            // Recargar la reseña actualizada
            resenas = negocioDataService.getResenas(negocioCodigo.toLowerCase());
            NegocioData.ResenaData resenaActualizadaData = resenas.stream()
                    .filter(r -> r.getId().equals(id))
                    .findFirst()
                    .orElse(resenaData);

            Resena resenaActualizada = ModelConverter.resenaDataToResena(resenaActualizadaData,
                    negocioCodigo.toLowerCase());

            System.out.println("Estado después de guardar - aprobada: " + resenaActualizada.getAprobada());
            System.out.println("═══════════════════════════════════════");

            String mensaje;
            if (resenaActualizada.getAprobada() == null) {
                mensaje = "Reseña puesta en pendiente exitosamente";
            } else if (resenaActualizada.getAprobada()) {
                mensaje = "Reseña aprobada exitosamente";
            } else {
                mensaje = "Reseña rechazada exitosamente";
            }

            return ResponseEntity.ok(ApiResponse.success(mensaje, resenaActualizada));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al actualizar reseña: " + e.getMessage()));
        }
    }

    // Eliminar una reseña
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> eliminarResena(
            @PathVariable String id,
            @RequestParam String negocioCodigo) {
        try {
            // Buscar la reseña en la colección del negocio
            List<NegocioData.ResenaData> resenas = negocioDataService.getResenas(negocioCodigo.toLowerCase());
            Optional<NegocioData.ResenaData> resenaOpt = resenas.stream()
                    .filter(r -> r.getId().equals(id))
                    .findFirst();

            if (resenaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Reseña no encontrada"));
            }

            negocioDataService.removeResena(negocioCodigo.toLowerCase(), id);

            Map<String, Object> data = new HashMap<>();
            data.put("id", id);
            data.put("mensaje", "Reseña eliminada exitosamente");

            return ResponseEntity.ok(ApiResponse.success("Reseña eliminada exitosamente", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al eliminar reseña: " + e.getMessage()));
        }
    }
}
