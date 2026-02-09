package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "servicios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Servicio {

    @Id
    private String id;

    @Indexed
    private String establecimiento;

    private Integer idServicio; // ID numérico único dentro del establecimiento

    private String nombre;

    private String categoria;

    private String duracion; // Ejemplo: "30 min", "45 min"

    private String precio; // Ejemplo: "$2500", "$3000"

    private String descripcion;

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    private Boolean activo = true;
}






