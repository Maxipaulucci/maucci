package com.maxturnos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResenaRequest {
    
    @NotBlank(message = "El código del negocio es requerido")
    private String negocioCodigo;
    
    @NotBlank(message = "El email del usuario es requerido")
    @Email(message = "El email debe ser válido")
    private String usuarioEmail;
    
    @NotNull(message = "La calificación es requerida")
    @Min(value = 1, message = "La calificación debe ser al menos 1")
    @Max(value = 5, message = "La calificación debe ser máximo 5")
    private Integer rating;
    
    @Size(max = 500, message = "El texto de la reseña no puede exceder 500 caracteres")
    private String texto;
}

