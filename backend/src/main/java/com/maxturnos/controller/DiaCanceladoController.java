package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.model.DiaCancelado;
import com.maxturnos.model.NegocioData;
import com.maxturnos.util.ModelConverter;
import com.maxturnos.service.DiaCanceladoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/dias-cancelados")
@CrossOrigin(origins = "*")
public class DiaCanceladoController {
    
    private final DiaCanceladoService diaCanceladoService;
    
    public DiaCanceladoController(DiaCanceladoService diaCanceladoService) {
        this.diaCanceladoService = diaCanceladoService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<DiaCancelado>> cancelarDia(
            @RequestParam String establecimiento,
            @RequestParam String fecha,
            @RequestParam(required = false) String motivo) {
        try {
            // Parsear fecha desde string "YYYY-MM-DD"
            Date fechaDate = parseFecha(fecha);
            
            NegocioData.DiaCanceladoData diaCanceladoData = diaCanceladoService.cancelarDia(
                establecimiento, fechaDate, motivo
            );
            
            DiaCancelado diaCancelado = ModelConverter.diaCanceladoDataToDiaCancelado(diaCanceladoData, establecimiento);
            
            return ResponseEntity.ok(ApiResponse.success(diaCancelado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al cancelar día: " + e.getMessage()));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> restaurarDia(
            @RequestParam String establecimiento,
            @RequestParam String fecha) {
        try {
            // Parsear fecha desde string "YYYY-MM-DD"
            Date fechaDate = parseFecha(fecha);
            
            diaCanceladoService.restaurarDia(establecimiento, fechaDate);
            
            return ResponseEntity.ok(ApiResponse.success("Día restaurado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al restaurar día: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{establecimiento}")
    public ResponseEntity<ApiResponse<List<DiaCancelado>>> obtenerDiasCancelados(
            @PathVariable String establecimiento,
            @RequestParam(required = false) String fechaDesde) {
        try {
            List<NegocioData.DiaCanceladoData> diasCanceladosData;
            
            if (fechaDesde != null && !fechaDesde.isEmpty()) {
                Date fechaDate = parseFecha(fechaDesde);
                diasCanceladosData = diaCanceladoService.obtenerDiasCanceladosFuturos(establecimiento, fechaDate);
            } else {
                diasCanceladosData = diaCanceladoService.obtenerDiasCancelados(establecimiento);
            }
            
            List<DiaCancelado> diasCancelados = diasCanceladosData.stream()
                .map(data -> ModelConverter.diaCanceladoDataToDiaCancelado(data, establecimiento))
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(diasCancelados));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al obtener días cancelados: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{establecimiento}/verificar")
    public ResponseEntity<ApiResponse<Boolean>> verificarDiaCancelado(
            @PathVariable String establecimiento,
            @RequestParam String fecha) {
        try {
            // Parsear fecha desde string "YYYY-MM-DD"
            Date fechaDate = parseFecha(fecha);
            
            boolean esCancelado = diaCanceladoService.esDiaCancelado(establecimiento, fechaDate);
            
            return ResponseEntity.ok(ApiResponse.success(esCancelado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al verificar día: " + e.getMessage()));
        }
    }
    
    // Método auxiliar para parsear fecha desde string "YYYY-MM-DD"
    private Date parseFecha(String fechaStr) {
        try {
            String[] partes = fechaStr.split("-");
            if (partes.length != 3) {
                throw new IllegalArgumentException("Formato de fecha inválido. Use YYYY-MM-DD");
            }
            
            int año = Integer.parseInt(partes[0]);
            int mes = Integer.parseInt(partes[1]) - 1; // Calendar.MONTH es 0-based
            int dia = Integer.parseInt(partes[2]);
            
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.YEAR, año);
            cal.set(Calendar.MONTH, mes);
            cal.set(Calendar.DAY_OF_MONTH, dia);
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            
            return cal.getTime();
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al parsear fecha: " + e.getMessage());
        }
    }
}






