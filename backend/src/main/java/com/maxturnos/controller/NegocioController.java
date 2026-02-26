package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.model.Negocio;
import com.maxturnos.repository.NegocioRepository;
import com.maxturnos.service.NegocioDataService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/negocios")
@CrossOrigin(origins = "*")
public class NegocioController {
    
    private final NegocioRepository negocioRepository;
    private final NegocioDataService negocioDataService;
    
    public NegocioController(NegocioRepository negocioRepository, NegocioDataService negocioDataService) {
        this.negocioRepository = negocioRepository;
        this.negocioDataService = negocioDataService;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Negocio>>> obtenerTodos() {
        try {
            List<Negocio> negocios = negocioRepository.findByActivoTrue();
            return ResponseEntity.ok(ApiResponse.success(negocios));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al obtener negocios: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{codigo}")
    public ResponseEntity<ApiResponse<Negocio>> obtenerPorCodigo(@PathVariable String codigo) {
        try {
            String codigoLower = codigo.toLowerCase();
            java.util.Optional<Negocio> negocioOpt = negocioRepository.findByCodigoAndActivoTrue(codigoLower);
            
            if (negocioOpt.isPresent()) {
                Negocio negocio = negocioOpt.get();
                // Enriquecer con datos guardados en el panel (NegocioData): categorías, bloques y días disponibles
                List<String> categoriasData = negocioDataService.getCategorias(codigoLower);
                if (categoriasData != null && !categoriasData.isEmpty()) {
                    negocio.setCategorias(categoriasData);
                }
                List<com.maxturnos.model.NegocioData.BloqueHorarioData> bloquesData = negocioDataService.getBloquesHorario(codigoLower);
                List<Negocio.BloqueHorario> bloques = new java.util.ArrayList<>();
                if (bloquesData != null) {
                    for (com.maxturnos.model.NegocioData.BloqueHorarioData b : bloquesData) {
                        Negocio.BloqueHorario bh = new Negocio.BloqueHorario();
                        bh.setId(b.getId());
                        bh.setDias(b.getDias() != null ? new java.util.ArrayList<>(b.getDias()) : new java.util.ArrayList<>());
                        bh.setInicio(b.getInicio());
                        bh.setFin(b.getFin());
                        bh.setIntervalo(b.getIntervalo());
                        bloques.add(bh);
                    }
                }
                negocio.setBloquesHorario(bloques);
                // Días disponibles y orden de reseñas: siempre devolver los guardados en el panel (NegocioData)
                negocioDataService.get(codigoLower).ifPresent(data -> {
                    List<Integer> dias = data.getDiasDisponibles();
                    negocio.setDiasDisponibles(dias != null ? new java.util.ArrayList<>(dias) : new java.util.ArrayList<>());
                    if (data.getOrdenResenas() != null && !data.getOrdenResenas().isEmpty()) {
                        negocio.setOrdenResenas(data.getOrdenResenas());
                    }
                });
                return ResponseEntity.ok(ApiResponse.success(negocio));
            }
            
            // Si no existe en la colección global, devolver datos mínimos desde NegocioData (ej. barberia_clasica)
            Negocio negocioMinimo = negocioDataService.getNegocioConfig(codigoLower);
            return ResponseEntity.ok(ApiResponse.success(negocioMinimo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Negocio>> crearNegocio(
            @Valid @RequestBody Negocio negocio) {
        try {
            if (negocioRepository.existsByCodigo(negocio.getCodigo())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Ya existe un negocio con ese código"));
            }
            
            negocio.setCodigo(negocio.getCodigo().toLowerCase());
            Negocio nuevo = negocioRepository.save(negocio);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Negocio creado exitosamente", nuevo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al crear negocio: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{codigo}/orden-resenas")
    public ResponseEntity<ApiResponse<Negocio>> actualizarOrdenResenas(
            @PathVariable String codigo,
            @RequestBody Map<String, String> request) {
        try {
            String codigoLower = codigo.toLowerCase();
            String ordenResenas = request.get("ordenResenas");
            
            if (ordenResenas == null || ordenResenas.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El campo 'ordenResenas' es requerido"));
            }
            
            // Validar que el orden sea uno de los valores permitidos
            if (!ordenResenas.equals("antigua-reciente") && 
                !ordenResenas.equals("reciente-antigua") && 
                !ordenResenas.equals("mayor-menor") && 
                !ordenResenas.equals("menor-mayor")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Valor de ordenamiento inválido"));
            }
            
            // Guardar en NegocioData (colección del negocio) para que funcione aunque el negocio no esté en la colección global
            negocioDataService.setOrdenResenas(codigoLower, ordenResenas);
            
            Negocio respuesta = negocioDataService.getNegocioConfig(codigoLower);
            return ResponseEntity.ok(ApiResponse.success("Ordenamiento de reseñas actualizado exitosamente", respuesta));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al actualizar ordenamiento: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{codigo}/horarios")
    public ResponseEntity<ApiResponse<Negocio>> actualizarHorarios(
            @PathVariable String codigo,
            @RequestBody Map<String, Object> request) {
        try {
            String codigoLower = codigo.toLowerCase();
            // Usar NegocioData (colección del negocio), no la colección global
            Negocio.HorariosConfig horarios = negocioDataService.getHorarios(codigoLower);
            
            if (request.containsKey("inicio")) {
                horarios.setInicio((String) request.get("inicio"));
            }
            if (request.containsKey("fin")) {
                horarios.setFin((String) request.get("fin"));
            }
            if (request.containsKey("intervalo")) {
                Object intervaloObj = request.get("intervalo");
                if (intervaloObj instanceof Integer) {
                    horarios.setIntervalo((Integer) intervaloObj);
                } else if (intervaloObj instanceof String) {
                    horarios.setIntervalo(Integer.parseInt((String) intervaloObj));
                }
            }
            
            negocioDataService.setHorarios(codigoLower, horarios);
            
            if (request.containsKey("bloquesHorario")) {
                Object rawList = request.get("bloquesHorario");
                List<Negocio.BloqueHorario> bloques = new java.util.ArrayList<>();
                if (rawList instanceof List) {
                    for (Object item : (List<?>) rawList) {
                        if (!(item instanceof Map)) continue;
                        @SuppressWarnings("unchecked")
                        Map<String, Object> m = (Map<String, Object>) item;
                        Negocio.BloqueHorario bh = new Negocio.BloqueHorario();
                        if (m.containsKey("id")) bh.setId(m.get("id") != null ? m.get("id").toString() : null);
                        if (m.containsKey("dias") && m.get("dias") instanceof List) {
                            List<Integer> dias = new java.util.ArrayList<>();
                            for (Object o : (List<?>) m.get("dias")) {
                                if (o instanceof Number) dias.add(((Number) o).intValue());
                            }
                            bh.setDias(dias);
                        } else {
                            bh.setDias(new java.util.ArrayList<>());
                        }
                        bh.setInicio(m.containsKey("inicio") && m.get("inicio") != null ? m.get("inicio").toString() : "09:00");
                        bh.setFin(m.containsKey("fin") && m.get("fin") != null ? m.get("fin").toString() : "20:00");
                        if (m.containsKey("intervalo") && m.get("intervalo") != null) {
                            Object i = m.get("intervalo");
                            try {
                                bh.setIntervalo(i instanceof Number ? ((Number) i).intValue() : Integer.parseInt(i.toString()));
                            } catch (NumberFormatException ignored) {
                                bh.setIntervalo(30);
                            }
                        } else {
                            bh.setIntervalo(30);
                        }
                        bloques.add(bh);
                    }
                }
                negocioDataService.setBloquesHorario(codigoLower, bloques);
            }
            
            Negocio respuesta = new Negocio();
            respuesta.setCodigo(codigoLower);
            respuesta.setHorarios(horarios);
            return ResponseEntity.ok(ApiResponse.success("Horarios actualizados exitosamente", respuesta));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al actualizar horarios: " + e.getMessage()));
        }
    }

    @PutMapping("/{codigo}/dias-disponibles")
    public ResponseEntity<ApiResponse<Negocio>> actualizarDiasDisponibles(
            @PathVariable String codigo,
            @RequestBody Map<String, Object> request) {
        try {
            String codigoLower = codigo.toLowerCase();
            Object diasObj = request.get("diasDisponibles");
            if (diasObj == null || !(diasObj instanceof List)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El campo 'diasDisponibles' es requerido y debe ser un array"));
            }
            List<?> raw = (List<?>) diasObj;
            List<Integer> diasDisponibles = new java.util.ArrayList<>();
            for (Object o : raw) {
                if (o instanceof Number) diasDisponibles.add(((Number) o).intValue());
            }
            negocioDataService.setDiasDisponibles(codigoLower, diasDisponibles);
            Negocio respuesta = new Negocio();
            respuesta.setCodigo(codigoLower);
            respuesta.setDiasDisponibles(diasDisponibles);
            return ResponseEntity.ok(ApiResponse.success("Días disponibles actualizados exitosamente", respuesta));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al actualizar días disponibles: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{codigo}/categorias")
    public ResponseEntity<ApiResponse<Negocio>> actualizarCategorias(
            @PathVariable String codigo,
            @RequestBody Map<String, List<String>> request) {
        try {
            List<String> categorias = request.get("categorias");
            
            if (categorias == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El campo 'categorias' es requerido"));
            }
            
            // Guardar en la colección del negocio (NegocioData), no en la global
            negocioDataService.setCategorias(codigo.toLowerCase(), categorias);
            
            Negocio respuesta = new Negocio();
            respuesta.setCodigo(codigo.toLowerCase());
            respuesta.setCategorias(categorias);
            return ResponseEntity.ok(ApiResponse.success("Categorías actualizadas exitosamente", respuesta));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al actualizar categorías: " + e.getMessage()));
        }
    }
}









