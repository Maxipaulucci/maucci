package com.maxturnos.service;

import com.maxturnos.model.NegocioData;
import com.maxturnos.util.ModelConverter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DiaCanceladoService {
    
    private final NegocioDataService negocioDataService;
    
    public DiaCanceladoService(NegocioDataService negocioDataService) {
        this.negocioDataService = negocioDataService;
    }
    
    private Date normalizarFecha(Date fecha) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(fecha);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }
    
    @Transactional
    public NegocioData.DiaCanceladoData cancelarDia(String establecimiento, Date fecha, String motivo) {
        Date fechaNormalizada = normalizarFecha(fecha);
        
        // Verificar si ya existe
        List<NegocioData.DiaCanceladoData> diasCancelados = negocioDataService.getDiasCancelados(establecimiento);
        NegocioData.DiaCanceladoData existente = diasCancelados.stream()
            .filter(d -> d.getFecha().equals(fechaNormalizada))
            .findFirst()
            .orElse(null);
        
        if (existente != null) {
            return existente;
        }
        
        NegocioData.DiaCanceladoData diaCancelado = new NegocioData.DiaCanceladoData();
        diaCancelado.setId(UUID.randomUUID().toString());
        diaCancelado.setFecha(fechaNormalizada);
        diaCancelado.setMotivo(motivo != null ? motivo : "Día cancelado desde panel de negocio");
        diaCancelado.setFechaCreacion(new Date());
        
        negocioDataService.addDiaCancelado(establecimiento, diaCancelado);
        return diaCancelado;
    }
    
    @Transactional
    public void restaurarDia(String establecimiento, Date fecha) {
        Date fechaNormalizada = normalizarFecha(fecha);
        
        List<NegocioData.DiaCanceladoData> diasCancelados = negocioDataService.getDiasCancelados(establecimiento);
        NegocioData.DiaCanceladoData dia = diasCancelados.stream()
            .filter(d -> d.getFecha().equals(fechaNormalizada))
            .findFirst()
            .orElse(null);
        
        if (dia != null) {
            negocioDataService.removeDiaCancelado(establecimiento, dia.getId());
        }
    }
    
    public List<NegocioData.DiaCanceladoData> obtenerDiasCancelados(String establecimiento) {
        return negocioDataService.getDiasCancelados(establecimiento);
    }
    
    public List<NegocioData.DiaCanceladoData> obtenerDiasCanceladosFuturos(String establecimiento, Date fechaDesde) {
        Date fechaNormalizada = normalizarFecha(fechaDesde);
        
        return negocioDataService.getDiasCancelados(establecimiento).stream()
            .filter(d -> !d.getFecha().before(fechaNormalizada))
            .collect(Collectors.toList());
    }
    
    public boolean esDiaCancelado(String establecimiento, Date fecha) {
        Date fechaNormalizada = normalizarFecha(fecha);
        
        return negocioDataService.getDiasCancelados(establecimiento).stream()
            .anyMatch(d -> d.getFecha().equals(fechaNormalizada));
    }
}

