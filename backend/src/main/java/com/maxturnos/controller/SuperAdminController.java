package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.model.NegocioData;
import com.maxturnos.repository.NegocioDataRepository;
import com.maxturnos.util.CollectionNameHelper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Panel del programador/admin de la aplicación.
 * Solo el email configurado como super admin puede usar estos endpoints.
 */
@RestController
@RequestMapping("/api/superadmin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private static final String SUPER_ADMIN_EMAIL = "pauluccimaximo81@gmail.com";

    private final NegocioDataRepository negocioDataRepository;
    private final MongoTemplate mongoTemplate;

    public SuperAdminController(NegocioDataRepository negocioDataRepository, MongoTemplate mongoTemplate) {
        this.negocioDataRepository = negocioDataRepository;
        this.mongoTemplate = mongoTemplate;
    }

    private boolean isSuperAdmin(String email) {
        return email != null && SUPER_ADMIN_EMAIL.equalsIgnoreCase(email.trim());
    }

    private String normalizarId(String id) {
        if (id == null || id.trim().isEmpty()) return id == null ? null : "";
        return id.trim().toLowerCase().replaceAll("\\s+", "_");
    }

    /**
     * Crear una nueva colección de negocio con un documento plantilla (id + mailAsociado).
     */
    @PostMapping("/negocios")
    public ResponseEntity<ApiResponse<Map<String, Object>>> crearNegocio(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String id = body.get("id");
        String mailAsociado = body.get("mailAsociado");

        if (!isSuperAdmin(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("No autorizado"));
        }
        if (id == null || id.trim().isEmpty() || mailAsociado == null || mailAsociado.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("id y mailAsociado son obligatorios"));
        }

        String codigo = normalizarId(id);
        if (codigo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("id no válido"));
        }

        Optional<NegocioData> existente = negocioDataRepository.findById(codigo);
        if (existente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Ya existe un negocio con ese id"));
        }

        NegocioData data = new NegocioData();
        data.setId(codigo);
        data.setMailAsociado(mailAsociado.trim());
        negocioDataRepository.save(codigo, data);

        Map<String, Object> result = new HashMap<>();
        result.put("id", codigo);
        result.put("mailAsociado", mailAsociado.trim());
        return ResponseEntity.ok(ApiResponse.success("Negocio creado", result));
    }

    /**
     * Listar ids de colecciones de negocios.
     * Si details=true, devuelve lista de { id, mailAsociado } para Modificar.
     */
    @GetMapping("/negocios")
    public ResponseEntity<ApiResponse<?>> listarNegocios(
            @RequestParam String email,
            @RequestParam(required = false, defaultValue = "false") boolean details) {
        if (!isSuperAdmin(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("No autorizado"));
        }

        Set<String> all = mongoTemplate.getCollectionNames();
        List<String> nombres = new ArrayList<>();
        for (String name : all) {
            if (!"usuario".equals(name)) {
                nombres.add(name);
            }
        }
        nombres.sort(String::compareToIgnoreCase);

        if (!details) {
            return ResponseEntity.ok(ApiResponse.success("OK", nombres));
        }

        List<Map<String, String>> conDetalles = new ArrayList<>();
        for (String id : nombres) {
            Optional<NegocioData> dataOpt = negocioDataRepository.findById(id);
            String mail = dataOpt.map(NegocioData::getMailAsociado).orElse(null);
            Map<String, String> item = new HashMap<>();
            item.put("id", id);
            item.put("mailAsociado", mail != null ? mail : "");
            conDetalles.add(item);
        }
        return ResponseEntity.ok(ApiResponse.success("OK", conDetalles));
    }

    /**
     * Actualizar solo el mailAsociado de un negocio.
     */
    @PutMapping("/negocios/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> actualizarMailAsociado(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String mailAsociado = body.get("mailAsociado");
        if (!isSuperAdmin(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("No autorizado"));
        }

        String codigo = normalizarId(id);
        if (codigo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("id no válido"));
        }

        Optional<NegocioData> dataOpt = negocioDataRepository.findById(codigo);
        if (dataOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Negocio no encontrado"));
        }

        String nuevoMail = mailAsociado != null ? mailAsociado.trim() : "";
        negocioDataRepository.updateField(codigo, "mailAsociado", nuevoMail);

        Map<String, Object> result = new HashMap<>();
        result.put("id", codigo);
        result.put("mailAsociado", nuevoMail);
        return ResponseEntity.ok(ApiResponse.success("Mail asociado actualizado", result));
    }

    /**
     * Eliminar la colección de un negocio.
     */
    @DeleteMapping("/negocios/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminarNegocio(@PathVariable String id, @RequestParam String email) {
        if (!isSuperAdmin(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("No autorizado"));
        }

        String codigo = normalizarId(id);
        if (codigo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("id no válido"));
        }

        String collectionName = CollectionNameHelper.getNegocioCollection(codigo);
        if (!mongoTemplate.collectionExists(collectionName)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Negocio no encontrado"));
        }
        mongoTemplate.dropCollection(collectionName);

        return ResponseEntity.ok(ApiResponse.success("Negocio eliminado", null));
    }
}
