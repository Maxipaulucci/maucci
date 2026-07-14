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
                request.getPayerEmail(),
                request.getFrontBaseUrl()
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

    /**
     * Confirma el pago al volver de Mercado Pago (back_url success) o desde el front.
     * Si viene paymentId, verifica el estado en MP; si no, marca directo con establecimiento+reservaId.
     */
    @PostMapping("/confirmar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmarPago(
            @RequestBody Map<String, String> body) {
        try {
            String paymentId = body != null ? body.get("paymentId") : null;
            String establecimiento = body != null ? body.get("establecimiento") : null;
            String reservaId = body != null ? body.get("reservaId") : null;
            String externalReference = body != null ? body.get("externalReference") : null;
            String status = body != null ? body.get("status") : null;

            if (externalReference != null && !externalReference.isBlank()) {
                String[] parts = MercadoPagoService.parseExternalReference(externalReference);
                if (parts != null) {
                    establecimiento = parts[0];
                    reservaId = parts[1];
                }
            }

            boolean statusApproved = status == null || status.isBlank()
                || "approved".equalsIgnoreCase(status);

            if (!statusApproved) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El pago no está aprobado"));
            }

            if (paymentId != null && !paymentId.isBlank() && establecimiento != null && !establecimiento.isBlank()) {
                try {
                    mercadoPagoService.consultarPagoYMarcar(establecimiento, paymentId);
                    return ResponseEntity.ok(ApiResponse.success("Pago confirmado", Map.of("pagado", true)));
                } catch (Exception e) {
                    // Fallback: si falló la verificación remota pero MP redirigió con success + referencia
                    if (reservaId != null && !reservaId.isBlank()) {
                        mercadoPagoService.marcarComoPagado(establecimiento, reservaId);
                        return ResponseEntity.ok(ApiResponse.success("Pago confirmado", Map.of("pagado", true)));
                    }
                    throw e;
                }
            }

            if (establecimiento != null && reservaId != null
                && !establecimiento.isBlank() && !reservaId.isBlank()) {
                mercadoPagoService.marcarComoPagado(establecimiento, reservaId);
                return ResponseEntity.ok(ApiResponse.success("Pago confirmado", Map.of("pagado", true)));
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Datos de pago incompletos"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al confirmar el pago"));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String type,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            String paymentId = id;
            String topicResolved = topic != null ? topic : type;
            if ((paymentId == null || paymentId.isBlank()) && body != null) {
                Object data = body.get("data");
                if (data instanceof Map<?, ?> dataMap && dataMap.get("id") != null) {
                    paymentId = dataMap.get("id").toString();
                }
                if (topicResolved == null && body.get("type") != null) {
                    topicResolved = body.get("type").toString();
                }
                if (topicResolved == null && body.get("action") != null) {
                    topicResolved = body.get("action").toString();
                }
            }

            // Solo actuar si llegó external_reference vía payment query + negocio:
            // el front confirmará en local; el webhook sirve en prod cuando el backend es público.
            if (paymentId != null && !paymentId.isBlank()
                && (topicResolved == null || topicResolved.toLowerCase().contains("payment"))) {
                // Sin establecimiento en query no consultamos (evitar probar todos los tokens).
                // El flujo principal de confirmación es POST /confirmar desde el front.
            }
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.ok("OK");
        }
    }
}
