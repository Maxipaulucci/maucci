package com.maxturnos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearPreferenciaRequest {

    @NotBlank(message = "El establecimiento es requerido")
    private String establecimiento;

    @NotNull(message = "El id del servicio es requerido")
    private Integer servicioId;

    /** Opcional: referencia externa en Mercado Pago */
    private String reservaId;

    private String payerEmail;
}
