package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    /** Historial de turnos del usuario (reservas realizadas en la app). */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservaEnHistorial {
        private String id;
        private String establecimiento;
        private Date fecha;
        private String hora;
        private String servicioNombre;
        private String profesionalNombre;
    }
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String nombre;
    
    private String apellido;
    
    private String nombreNegocio;
    
    private String password;
    
    private String rol = "usuario"; // "usuario" o "admin"
    
    private Boolean emailVerificado = false;
    
    private String codigoVerificacion;
    
    private Date codigoVerificacionExpira;
    
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    private List<ReservaEnHistorial> historialReservas = new ArrayList<>();
    
    public void generarCodigoVerificacion() {
        this.codigoVerificacion = String.valueOf((int)(Math.random() * 900000) + 100000);
        this.codigoVerificacionExpira = new Date(System.currentTimeMillis() + 15 * 60 * 1000); // 15 minutos
    }
    
    public boolean codigoExpirado() {
        return codigoVerificacionExpira != null && 
               codigoVerificacionExpira.before(new Date());
    }
}

