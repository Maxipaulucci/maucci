package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "resenas")
@org.springframework.data.mongodb.core.index.CompoundIndex(name = "negocio_aprobada_fecha", 
               def = "{'negocioCodigo': 1, 'aprobada': 1, 'fechaCreacion': -1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resena {
    
    @Id
    private String id;
    
    @Indexed
    private String negocioCodigo;
    
    @Indexed
    private String usuarioEmail;
    
    private String usuarioNombre;
    
    private String usuarioApellido;
    
    private Integer rating;
    
    private String texto;
    
    private Boolean aprobada; // null = pendiente, true = aprobada, false = rechazada
    
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaAprobacion;
}
