package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.model.HorarioBloqueado;
import com.maxturnos.model.NegocioData;
import com.maxturnos.util.ModelConverter;
import com.maxturnos.service.HorarioBloqueadoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/horarios-bloqueados")
@CrossOrigin(origins = "*")
public class HorarioBloqueadoController {
    
    private final HorarioBloqueadoService horarioBloqueadoService;
    
    public HorarioBloqueadoController(HorarioBloqueadoService horarioBloqueadoService) {
        this.horarioBloqueadoService = horarioBloqueadoService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<HorarioBloqueado>> bloquearHorario(
            @RequestParam String establecimiento,
            @RequestParam String fecha,
            @RequestParam String hora,
            @RequestParam Integer profesionalId,
            @RequestParam(required = false) String motivo) {
        try {
            // Parsear fecha desde string "YYYY-MM-DD"
            Date fechaDate = parseFecha(fecha);
            
            NegocioData.HorarioBloqueadoData bloqueadoData = horarioBloqueadoService.bloquearHorario(
                establecimiento, fechaDate, hora, profesionalId, motivo
            );
            
            HorarioBloqueado bloqueado = ModelConverter.horarioBloqueadoDataToHorarioBloqueado(bloqueadoData, establecimiento);
            
            return ResponseEntity.ok(ApiResponse.success(bloqueado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al bloquear horario: " + e.getMessage()));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> desbloquearHorario(
            @RequestParam String establecimiento,
            @RequestParam String fecha,
            @RequestParam String hora,
            @RequestParam Integer profesionalId) {
        try {
            // Parsear fecha desde string "YYYY-MM-DD"
            Date fechaDate = parseFecha(fecha);
            
            horarioBloqueadoService.desbloquearHorario(
                establecimiento, fechaDate, hora, profesionalId
            );
            
            return ResponseEntity.ok(ApiResponse.success("Horario desbloqueado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al desbloquear horario: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<HorarioBloqueado>>> obtenerHorariosBloqueados(
            @RequestParam String establecimiento,
            @RequestParam String fecha,
            @RequestParam Integer profesionalId) {
        try {
            // Parsear fecha desde string "YYYY-MM-DD"
            Date fechaDate = parseFecha(fecha);
            
            List<NegocioData.HorarioBloqueadoData> bloqueadosData = horarioBloqueadoService.obtenerHorariosBloqueados(
                establecimiento, fechaDate, profesionalId
            );
            
            List<HorarioBloqueado> bloqueados = bloqueadosData.stream()
                .map(data -> ModelConverter.horarioBloqueadoDataToHorarioBloqueado(data, establecimiento))
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(bloqueados));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Error al obtener horarios bloqueados: " + e.getMessage()));
        }
    }
    
    private Date parseFecha(String fechaStr) {
        try {
            String[] partes = fechaStr.split("-");
            if (partes.length == 3) {
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
            } else {
                throw new RuntimeException("Formato de fecha inválido. Use YYYY-MM-DD");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear la fecha: " + e.getMessage());
        }
    }
}

