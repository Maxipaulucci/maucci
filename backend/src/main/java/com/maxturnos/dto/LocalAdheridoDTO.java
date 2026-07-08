package com.maxturnos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocalAdheridoDTO {
    private String codigo;
    private String nombre;
    private String categoria;
    private String descripcion;
    private String direccion;
    private String telefono;
    private Double rating;
    private Integer reviewCount;
    private String horarios;
    private String imagen;
    private String website;
}
