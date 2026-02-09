package com.maxturnos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
public class ReservaRequest {
    
    @NotBlank(message = "El establecimiento es requerido")
    private String establecimiento;
    
    // Cambiar a String para evitar problemas de zona horaria al deserializar
    // El formato esperado es "YYYY-MM-DD"
    @NotBlank(message = "La fecha es requerida")
    private String fecha;
    
    @NotBlank(message = "La hora es requerida")
    private String hora;
    
    @NotNull(message = "El servicio es requerido")
    @Valid
    private ServicioDto servicio;
    
    @NotNull(message = "El profesional es requerido")
    @Valid
    private ProfesionalDto profesional;
    
    private String notas;
    
    @NotBlank(message = "El email del usuario es requerido")
    private String usuarioEmail;
    
    @Data
    public static class ServicioDto {
        @NotNull
        private Integer id;
        @NotBlank
        private String name;
        @NotBlank
        private String duration;
        @NotBlank
        private String price;
    }
    
    @Data
    public static class ProfesionalDto {
        @NotNull
        private Integer id;
        @NotBlank
        private String name;
    }
}

