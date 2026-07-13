package com.maxturnos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.maxturnos.model.NegocioData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class MercadoPagoService {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoService.class);
    private static final String PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";

    private final NegocioDataService negocioDataService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String frontendBaseUrl;

    public MercadoPagoService(
            NegocioDataService negocioDataService,
            ObjectMapper objectMapper,
            @Value("${app.frontend-base-url:http://localhost:3000}") String frontendBaseUrl) {
        this.negocioDataService = negocioDataService;
        this.objectMapper = objectMapper;
        this.frontendBaseUrl = frontendBaseUrl.endsWith("/")
            ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
            : frontendBaseUrl;
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> crearPreferencia(
            String establecimiento,
            Integer servicioId,
            String reservaId,
            String payerEmail) {

        String codigo = establecimiento.toLowerCase().trim();
        String accessToken = negocioDataService.findMercadoPagoAccessToken(codigo)
            .orElseThrow(() -> new IllegalStateException(
                "Este negocio aún no configuró Mercado Pago"
            ));

        NegocioData.ServicioData servicio = negocioDataService.findServicioById(codigo, servicioId)
            .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado"));

        double unitPrice = parsePrecio(servicio.getPrecio());
        if (unitPrice <= 0) {
            throw new IllegalArgumentException("El precio del servicio no es válido");
        }

        String title = servicio.getNombre() != null && !servicio.getNombre().isBlank()
            ? servicio.getNombre().trim()
            : "Servicio";

        String localBase = frontendBaseUrl + "/local/" + codigo;
        String backUrl = localBase + "/servicios";

        ObjectNode body = objectMapper.createObjectNode();
        ArrayNode items = body.putArray("items");
        ObjectNode item = items.addObject();
        item.put("title", title);
        item.put("quantity", 1);
        item.put("currency_id", "ARS");
        item.put("unit_price", unitPrice);

        ObjectNode backUrls = body.putObject("back_urls");
        backUrls.put("success", backUrl + "?pago=success");
        backUrls.put("failure", backUrl + "?pago=failure");
        backUrls.put("pending", backUrl + "?pago=pending");
        body.put("auto_return", "approved");

        if (reservaId != null && !reservaId.isBlank()) {
            body.put("external_reference", reservaId.trim());
        }

        if (payerEmail != null && !payerEmail.isBlank()) {
            ObjectNode payer = body.putObject("payer");
            payer.put("email", payerEmail.trim().toLowerCase());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                PREFERENCES_URL,
                new HttpEntity<>(body.toString(), headers),
                String.class
            );
            JsonNode root = objectMapper.readTree(response.getBody());
            String initPoint = textOrNull(root, "init_point");
            String sandboxInitPoint = textOrNull(root, "sandbox_init_point");
            String preferenceId = textOrNull(root, "id");

            String redirectUrl = initPoint != null && !initPoint.isBlank() ? initPoint : sandboxInitPoint;
            if (redirectUrl == null || redirectUrl.isBlank()) {
                throw new IllegalStateException("Mercado Pago no devolvió una URL de pago");
            }

            Map<String, Object> result = new HashMap<>();
            result.put("initPoint", redirectUrl);
            result.put("preferenceId", preferenceId);
            result.put("amount", unitPrice);
            result.put("title", title);
            return result;
        } catch (HttpStatusCodeException e) {
            log.error("Error Mercado Pago al crear preferencia (HTTP {}): {}", e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new IllegalStateException("No se pudo crear el pago en Mercado Pago. Verificá el Access Token del negocio.");
        } catch (IllegalStateException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al crear preferencia Mercado Pago: {}", e.getMessage(), e);
            throw new IllegalStateException("Error al conectar con Mercado Pago");
        }
    }

    public static double parsePrecio(String precio) {
        if (precio == null || precio.trim().isEmpty()) {
            throw new IllegalArgumentException("Precio vacío");
        }
        String s = precio.trim().replace("$", "").replace(" ", "");
        if (s.contains(",") && s.contains(".")) {
            s = s.replace(".", "").replace(",", ".");
        } else if (s.contains(",")) {
            s = s.replace(",", ".");
        }
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Precio inválido: " + precio);
        }
    }

    private static String textOrNull(JsonNode root, String field) {
        JsonNode node = root.get(field);
        return node != null && !node.isNull() ? node.asText() : null;
    }
}
