package com.maxturnos.dto;

import lombok.Data;

@Data
public class ModificarReservaRequest {
    private String fecha; // YYYY-MM-DD
    private String hora;
}
