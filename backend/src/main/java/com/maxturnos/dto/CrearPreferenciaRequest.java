package com.maxturnos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearPreferenciaRequest {

    @NotBlank(message = "El establecimiento es requerido")
    private String establecimiento;

    /** Opcional si viene reservaId (se resuelve desde la reserva) */
    private Integer servicioId;

    /** Opcional: referencia externa en Mercado Pago */
    private String reservaId;

    private String payerEmail;

    /**
     * Origen del frontend (ej. https://maucci.net). Se usa para back_urls.
     * Si no viene, se usa app.frontend-base-url.
     */
    private String frontBaseUrl;
}
