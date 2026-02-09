package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;
import java.util.Date;

@Document(collection = "reserva")
@CompoundIndex(name = "establecimiento_fecha_hora_profesional", 
               def = "{'establecimiento': 1, 'fecha': 1, 'hora': 1, 'profesional.id': 1}")
@CompoundIndex(name = "establecimiento_fecha", 
               def = "{'establecimiento': 1, 'fecha': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {
    
    @Id
    private String id;
    
    @Indexed
    private String establecimiento;
    
    private Date fecha;
    
    private String hora;
    
    private ServicioInfo servicio;
    
    private ProfesionalInfo profesional;
    
    private Integer duracionMinutos;
    
    private String notas = "";
    
    private String usuarioEmail;
    
    private String usuarioNombre; // Nombre del usuario que hizo la reserva
    
    private String usuarioApellido; // Apellido del usuario que hizo la reserva
    
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicioInfo {
        private Integer id;
        private String name;
        private String duration;
        private String price;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfesionalInfo {
        private Integer id;
        private String name;
    }
}

