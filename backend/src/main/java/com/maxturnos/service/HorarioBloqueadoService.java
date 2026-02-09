package com.maxturnos.service;

import com.maxturnos.model.NegocioData;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HorarioBloqueadoService {
    
    private final NegocioDataService negocioDataService;
    
    public HorarioBloqueadoService(NegocioDataService negocioDataService) {
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
    public NegocioData.HorarioBloqueadoData bloquearHorario(String establecimiento, Date fecha, String hora, Integer profesionalId, String motivo) {
        Date fechaNormalizada = normalizarFecha(fecha);
        
        // Verificar si ya existe
        List<NegocioData.HorarioBloqueadoData> horarios = negocioDataService.getHorariosBloqueados(establecimiento);
        NegocioData.HorarioBloqueadoData existente = horarios.stream()
            .filter(h -> h.getFecha().equals(fechaNormalizada) && 
                        h.getHora().equals(hora) && 
                        h.getProfesionalId().equals(profesionalId))
            .findFirst()
            .orElse(null);
        
        if (existente != null) {
            return existente;
        }
        
        NegocioData.HorarioBloqueadoData horarioBloqueado = new NegocioData.HorarioBloqueadoData();
        horarioBloqueado.setId(UUID.randomUUID().toString());
        horarioBloqueado.setFecha(fechaNormalizada);
        horarioBloqueado.setHora(hora);
        horarioBloqueado.setProfesionalId(profesionalId);
        horarioBloqueado.setMotivo(motivo != null ? motivo : "Bloqueado desde panel de negocio");
        
        negocioDataService.addHorarioBloqueado(establecimiento, horarioBloqueado);
        return horarioBloqueado;
    }
    
    @Transactional
    public void desbloquearHorario(String establecimiento, Date fecha, String hora, Integer profesionalId) {
        Date fechaNormalizada = normalizarFecha(fecha);
        
        List<NegocioData.HorarioBloqueadoData> horarios = negocioDataService.getHorariosBloqueados(establecimiento);
        NegocioData.HorarioBloqueadoData horario = horarios.stream()
            .filter(h -> h.getFecha().equals(fechaNormalizada) && 
                        h.getHora().equals(hora) && 
                        h.getProfesionalId().equals(profesionalId))
            .findFirst()
            .orElse(null);
        
        if (horario != null) {
            negocioDataService.removeHorarioBloqueado(establecimiento, horario.getId());
        }
    }
    
    public List<NegocioData.HorarioBloqueadoData> obtenerHorariosBloqueados(String establecimiento, Date fecha, Integer profesionalId) {
        Date fechaNormalizada = normalizarFecha(fecha);
        
        return negocioDataService.getHorariosBloqueados(establecimiento).stream()
            .filter(h -> h.getFecha().equals(fechaNormalizada) && 
                        (profesionalId == null || h.getProfesionalId().equals(profesionalId)))
            .collect(Collectors.toList());
    }
    
    public List<String> obtenerHorasBloqueadas(String establecimiento, Date fecha, Integer profesionalId) {
        return obtenerHorariosBloqueados(establecimiento, fecha, profesionalId).stream()
            .map(NegocioData.HorarioBloqueadoData::getHora)
            .collect(Collectors.toList());
    }
}

