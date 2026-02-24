package com.maxturnos.util;

import com.maxturnos.model.*;
import com.maxturnos.model.NegocioData.*;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * Utilidad para convertir entre los modelos antiguos (colecciones separadas)
 * y el nuevo modelo (NegocioData con todo agrupado).
 */
public class ModelConverter {
    
    // ========== CONVERSIÓN DE RESERVAS ==========
    
    public static ReservaData reservaToReservaData(Reserva reserva) {
        ReservaData data = new ReservaData();
        data.setId(reserva.getId());
        data.setFecha(reserva.getFecha());
        data.setHora(reserva.getHora());
        data.setDuracionMinutos(reserva.getDuracionMinutos());
        data.setNotas(reserva.getNotas());
        data.setUsuarioEmail(reserva.getUsuarioEmail());
        data.setUsuarioNombre(reserva.getUsuarioNombre());
        data.setUsuarioApellido(reserva.getUsuarioApellido());
        data.setFechaCreacion(reserva.getFechaCreacion());
        
        if (reserva.getServicio() != null) {
            data.setServicio(servicioInfoToServicioInfo(reserva.getServicio()));
        }
        
        if (reserva.getProfesional() != null) {
            data.setProfesional(profesionalInfoToProfesionalInfo(reserva.getProfesional()));
        }
        
        return data;
    }
    
    public static Reserva reservaDataToReserva(ReservaData data, String establecimiento) {
        Reserva reserva = new Reserva();
        reserva.setId(data.getId());
        reserva.setEstablecimiento(establecimiento);
        reserva.setFecha(data.getFecha());
        reserva.setHora(data.getHora());
        reserva.setDuracionMinutos(data.getDuracionMinutos());
        reserva.setNotas(data.getNotas());
        reserva.setUsuarioEmail(data.getUsuarioEmail());
        reserva.setUsuarioNombre(data.getUsuarioNombre());
        reserva.setUsuarioApellido(data.getUsuarioApellido());
        reserva.setFechaCreacion(data.getFechaCreacion());
        
        if (data.getServicio() != null) {
            reserva.setServicio(servicioInfoToReservaServicioInfo(data.getServicio()));
        }
        
        if (data.getProfesional() != null) {
            reserva.setProfesional(profesionalInfoToReservaProfesionalInfo(data.getProfesional()));
        }
        
        return reserva;
    }
    
    // ========== CONVERSIÓN DE RESERVAS HISTÓRICAS ==========
    
    public static ReservaHistoricaData reservaHistoricaToReservaHistoricaData(ReservaHistorica historica) {
        ReservaHistoricaData data = new ReservaHistoricaData();
        data.setId(historica.getId());
        data.setFecha(historica.getFecha());
        data.setHora(historica.getHora());
        data.setDuracionMinutos(historica.getDuracionMinutos());
        data.setNotas(historica.getNotas());
        data.setUsuarioEmail(historica.getUsuarioEmail());
        data.setUsuarioNombre(historica.getUsuarioNombre());
        data.setUsuarioApellido(historica.getUsuarioApellido());
        data.setFechaCreacion(historica.getFechaCreacion());
        data.setFechaArchivado(historica.getFechaArchivado());
        
        if (historica.getServicio() != null) {
            data.setServicio(new NegocioData.ServicioInfo(
                historica.getServicio().getId(),
                historica.getServicio().getName(),
                historica.getServicio().getDuration(),
                historica.getServicio().getPrice()
            ));
        }
        
        if (historica.getProfesional() != null) {
            data.setProfesional(new NegocioData.ProfesionalInfo(
                historica.getProfesional().getId(),
                historica.getProfesional().getName()
            ));
        }
        
        return data;
    }
    
    // ========== CONVERSIÓN DE RESEÑAS ==========
    
    public static ResenaData resenaToResenaData(Resena resena) {
        ResenaData data = new ResenaData();
        data.setId(resena.getId());
        data.setUsuarioEmail(resena.getUsuarioEmail());
        data.setUsuarioNombre(resena.getUsuarioNombre());
        data.setUsuarioApellido(resena.getUsuarioApellido());
        data.setRating(resena.getRating());
        data.setTexto(resena.getTexto());
        data.setAprobada(resena.getAprobada());
        data.setFechaCreacion(resena.getFechaCreacion());
        data.setFechaAprobacion(resena.getFechaAprobacion());
        return data;
    }
    
    public static Resena resenaDataToResena(ResenaData data, String negocioCodigo) {
        Resena resena = new Resena();
        resena.setId(data.getId());
        resena.setNegocioCodigo(negocioCodigo);
        resena.setUsuarioEmail(data.getUsuarioEmail());
        resena.setUsuarioNombre(data.getUsuarioNombre());
        resena.setUsuarioApellido(data.getUsuarioApellido());
        resena.setRating(data.getRating());
        resena.setTexto(data.getTexto());
        resena.setAprobada(data.getAprobada());
        resena.setFechaCreacion(data.getFechaCreacion());
        resena.setFechaAprobacion(data.getFechaAprobacion());
        return resena;
    }
    
    // ========== CONVERSIÓN DE DÍAS CANCELADOS ==========
    
    public static DiaCanceladoData diaCanceladoToDiaCanceladoData(DiaCancelado diaCancelado) {
        DiaCanceladoData data = new DiaCanceladoData();
        data.setId(diaCancelado.getId());
        data.setFecha(diaCancelado.getFecha());
        data.setMotivo(diaCancelado.getMotivo());
        data.setFechaCreacion(diaCancelado.getFechaCreacion());
        return data;
    }
    
    public static DiaCancelado diaCanceladoDataToDiaCancelado(DiaCanceladoData data, String establecimiento) {
        DiaCancelado diaCancelado = new DiaCancelado();
        diaCancelado.setId(data.getId());
        diaCancelado.setEstablecimiento(establecimiento);
        diaCancelado.setFecha(data.getFecha());
        diaCancelado.setMotivo(data.getMotivo());
        diaCancelado.setFechaCreacion(data.getFechaCreacion());
        return diaCancelado;
    }
    
    // ========== CONVERSIÓN DE HORARIOS BLOQUEADOS ==========
    
    public static HorarioBloqueadoData horarioBloqueadoToHorarioBloqueadoData(HorarioBloqueado horario) {
        HorarioBloqueadoData data = new HorarioBloqueadoData();
        data.setId(horario.getId());
        data.setFecha(horario.getFecha());
        data.setHora(horario.getHora());
        data.setProfesionalId(horario.getProfesionalId());
        data.setMotivo(horario.getMotivo());
        return data;
    }
    
    public static HorarioBloqueado horarioBloqueadoDataToHorarioBloqueado(HorarioBloqueadoData data, String establecimiento) {
        HorarioBloqueado horario = new HorarioBloqueado();
        horario.setId(data.getId());
        horario.setEstablecimiento(establecimiento);
        horario.setFecha(data.getFecha());
        horario.setHora(data.getHora());
        horario.setProfesionalId(data.getProfesionalId());
        horario.setMotivo(data.getMotivo());
        return horario;
    }
    
    // ========== CONVERSIÓN DE PERSONAL ==========
    
    public static PersonalData personalToPersonalData(Personal personal) {
        PersonalData data = new PersonalData();
        data.setId(personal.getId());
        data.setIdPersonal(personal.getIdPersonal());
        data.setNombre(personal.getNombre());
        data.setRol(personal.getRol());
        data.setAvatar(personal.getAvatar());
        data.setSpecialties(personal.getSpecialties());
        data.setTituloCertificado(personal.getTituloCertificado());
        data.setFechaCreacion(personal.getFechaCreacion());
        data.setActivo(personal.getActivo());
        return data;
    }
    
    public static Personal personalDataToPersonal(PersonalData data, String establecimiento) {
        Personal personal = new Personal();
        personal.setId(data.getId());
        personal.setEstablecimiento(establecimiento);
        personal.setIdPersonal(data.getIdPersonal());
        personal.setNombre(data.getNombre());
        personal.setRol(data.getRol());
        personal.setAvatar(data.getAvatar());
        personal.setSpecialties(data.getSpecialties());
        personal.setTituloCertificado(data.getTituloCertificado());
        personal.setFechaCreacion(data.getFechaCreacion());
        personal.setActivo(data.getActivo());
        return personal;
    }
    
    // ========== CONVERSIÓN DE SERVICIOS ==========
    
    public static ServicioData servicioToServicioData(Servicio servicio) {
        ServicioData data = new ServicioData();
        data.setId(servicio.getId());
        data.setIdServicio(servicio.getIdServicio());
        data.setNombre(servicio.getNombre());
        data.setCategoria(servicio.getCategoria());
        data.setDuracion(servicio.getDuracion());
        data.setPrecio(servicio.getPrecio());
        data.setDescripcion(servicio.getDescripcion());
        data.setFechaCreacion(servicio.getFechaCreacion());
        data.setActivo(servicio.getActivo());
        return data;
    }
    
    public static Servicio servicioDataToServicio(ServicioData data, String establecimiento) {
        Servicio servicio = new Servicio();
        servicio.setId(data.getId());
        servicio.setEstablecimiento(establecimiento);
        servicio.setIdServicio(data.getIdServicio());
        servicio.setNombre(data.getNombre());
        servicio.setCategoria(data.getCategoria());
        servicio.setDuracion(data.getDuracion());
        servicio.setPrecio(data.getPrecio());
        servicio.setDescripcion(data.getDescripcion());
        servicio.setFechaCreacion(data.getFechaCreacion());
        servicio.setActivo(data.getActivo());
        return servicio;
    }
    
    // ========== CONVERSIÓN DE SERVICIOINFO Y PROFESIONALINFO ==========
    
    private static ServicioInfo servicioInfoToServicioInfo(Reserva.ServicioInfo servicioInfo) {
        return new ServicioInfo(
            servicioInfo.getId(),
            servicioInfo.getName(),
            servicioInfo.getDuration(),
            servicioInfo.getPrice()
        );
    }
    
    private static Reserva.ServicioInfo servicioInfoToReservaServicioInfo(ServicioInfo servicioInfo) {
        return new Reserva.ServicioInfo(
            servicioInfo.getId(),
            servicioInfo.getName(),
            servicioInfo.getDuration(),
            servicioInfo.getPrice()
        );
    }
    
    private static ProfesionalInfo profesionalInfoToProfesionalInfo(Reserva.ProfesionalInfo profesionalInfo) {
        return new ProfesionalInfo(
            profesionalInfo.getId(),
            profesionalInfo.getName()
        );
    }
    
    private static Reserva.ProfesionalInfo profesionalInfoToReservaProfesionalInfo(ProfesionalInfo profesionalInfo) {
        return new Reserva.ProfesionalInfo(
            profesionalInfo.getId(),
            profesionalInfo.getName()
        );
    }
}
