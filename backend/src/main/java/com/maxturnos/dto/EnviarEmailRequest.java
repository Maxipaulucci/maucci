package com.maxturnos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnviarEmailRequest {
    @NotBlank(message = "El asunto es requerido")
    private String asunto;
    
    @NotBlank(message = "El mensaje es requerido")
    private String mensaje;
}






