package com.maxturnos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmarPagoRequest {

    @NotBlank(message = "El establecimiento es requerido")
    private String establecimiento;

    @NotBlank(message = "El id de la reserva es requerido")
    private String reservaId;
}
