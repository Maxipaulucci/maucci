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
                // Enriquecer con categorías desde la colección del negocio (NegocioData)
                List<String> categoriasData = negocioDataService.getCategorias(codigoLower);
                if (categoriasData != null && !categoriasData.isEmpty()) {
                    negocio.setCategorias(categoriasData);
                }
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
            
            Negocio negocio = negocioRepository
                .findByCodigoAndActivoTrue(codigo.toLowerCase())
                .orElseThrow(() -> new RuntimeException("Negocio no encontrado"));
            
            negocio.setOrdenResenas(ordenResenas);
            Negocio actualizado = negocioRepository.save(negocio);
            
            return ResponseEntity.ok(ApiResponse.success("Ordenamiento de reseñas actualizado exitosamente", actualizado));
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
            
            Negocio respuesta = new Negocio();
            respuesta.setCodigo(codigoLower);
            respuesta.setHorarios(horarios);
            return ResponseEntity.ok(ApiResponse.success("Horarios actualizados exitosamente", respuesta));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al actualizar horarios: " + e.getMessage()));
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









