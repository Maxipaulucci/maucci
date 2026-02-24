package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "personal")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Personal {
    
    @Id
    private String id;
    
    @Indexed
    private String establecimiento;
    
    private Integer idPersonal; // ID numérico único dentro del establecimiento
    
    private String nombre;
    
    private String rol;
    
    private String avatar; // URL o base64 de la imagen
    
    private List<String> specialties; // Cualidades/especialidades

    /** Texto del certificado/badge en la tarjeta pública (ej. "Experto"). Si es null o vacío, no se muestra. */
    private String tituloCertificado;
    
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    private Boolean activo = true;
}






