package com.maxturnos.controller;

import com.maxturnos.dto.ApiResponse;
import com.maxturnos.dto.CrearPreferenciaRequest;
import com.maxturnos.service.MercadoPagoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    private final MercadoPagoService mercadoPagoService;

    public PagoController(MercadoPagoService mercadoPagoService) {
        this.mercadoPagoService = mercadoPagoService;
    }

    @PostMapping("/preferencia")
    public ResponseEntity<ApiResponse<Map<String, Object>>> crearPreferencia(
            @Valid @RequestBody CrearPreferenciaRequest request) {
        try {
            Map<String, Object> data = mercadoPagoService.crearPreferencia(
                request.getEstablecimiento(),
                request.getServicioId(),
                request.getReservaId(),
                request.getPayerEmail()
            );
            return ResponseEntity.ok(ApiResponse.success("Preferencia creada", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al crear preferencia de pago"));
        }
    }
}
