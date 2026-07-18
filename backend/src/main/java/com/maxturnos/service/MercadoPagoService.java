package com.maxturnos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.maxturnos.model.NegocioData;
import com.maxturnos.model.Usuario;
import com.maxturnos.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MercadoPagoService {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoService.class);
    private static final String PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";
    private static final String PAYMENTS_URL = "https://api.mercadopago.com/v1/payments/";
    public static final String REF_SEPARATOR = "::";

    private final NegocioDataService negocioDataService;
    private final UsuarioRepository usuarioRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String frontendBaseUrl;
    private final String backendBaseUrl;

    public MercadoPagoService(
            NegocioDataService negocioDataService,
            UsuarioRepository usuarioRepository,
            ObjectMapper objectMapper,
            @Value("${app.frontend-base-url:http://localhost:3000}") String frontendBaseUrl,
            @Value("${app.backend-base-url:http://localhost:5000}") String backendBaseUrl) {
        this.negocioDataService = negocioDataService;
        this.usuarioRepository = usuarioRepository;
        this.objectMapper = objectMapper;
        this.frontendBaseUrl = trimTrailingSlash(frontendBaseUrl);
        this.backendBaseUrl = trimTrailingSlash(backendBaseUrl);
        this.restTemplate = new RestTemplate();
    }

    public static String buildExternalReference(String establecimiento, String reservaId) {
        return establecimiento.toLowerCase().trim() + REF_SEPARATOR + reservaId.trim();
    }

    public static String[] parseExternalReference(String externalReference) {
        if (externalReference == null || !externalReference.contains(REF_SEPARATOR)) {
            return null;
        }
        int idx = externalReference.indexOf(REF_SEPARATOR);
        String establecimiento = externalReference.substring(0, idx).trim();
        String reservaId = externalReference.substring(idx + REF_SEPARATOR.length()).trim();
        if (establecimiento.isEmpty() || reservaId.isEmpty()) {
            return null;
        }
        return new String[]{establecimiento, reservaId};
    }

    public Map<String, Object> crearPreferencia(
            String establecimiento,
            Integer servicioId,
            String reservaId,
            String payerEmail,
            String frontBaseUrlOverride) {

        String codigo = establecimiento.toLowerCase().trim();
        NegocioData negocioPago = negocioDataService.getOrCreate(codigo);
        if (!"MERCADO_PAGO".equals(negocioDataService.resolveMetodoPago(negocioPago))) {
            throw new IllegalStateException("Este negocio no tiene Mercado Pago como método de pago activo");
        }
        String accessToken = negocioDataService.findMercadoPagoAccessToken(codigo)
                .orElseThrow(() -> new IllegalStateException(
                        "Este negocio aún no configuró Mercado Pago"));

        Integer resolvedServicioId = servicioId;
        if (resolvedServicioId == null && reservaId != null && !reservaId.isBlank()) {
            NegocioData.ReservaData reserva = negocioDataService.getReservas(codigo).stream()
                    .filter(r -> reservaId.trim().equals(r.getId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
            if (reserva.getServicio() == null || reserva.getServicio().getId() == null) {
                throw new IllegalArgumentException("La reserva no tiene un servicio asociado");
            }
            resolvedServicioId = reserva.getServicio().getId();
        }

        if (resolvedServicioId == null) {
            throw new IllegalArgumentException("El id del servicio es requerido");
        }

        NegocioData.ServicioData servicio = negocioDataService.findServicioById(codigo, resolvedServicioId)
                .orElseThrow(() -> new IllegalArgumentException("Servicio no encontrado"));

        double unitPrice = parsePrecio(servicio.getPrecio());
        if (unitPrice <= 0) {
            throw new IllegalArgumentException("El precio del servicio no es válido");
        }

        String title = servicio.getNombre() != null && !servicio.getNombre().isBlank()
                ? servicio.getNombre().trim()
                : "Servicio";

        String resolvedFront = resolveFrontBaseUrl(frontBaseUrlOverride);
        String localBase = resolvedFront + "/local/" + codigo;
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
            body.put("external_reference", buildExternalReference(codigo, reservaId));
        }

        if (isPublicHttpUrl(backendBaseUrl)) {
            body.put("notification_url", backendBaseUrl + "/api/pagos/webhook");
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
                    String.class);
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
            String mpBody = e.getResponseBodyAsString();
            log.error("Error Mercado Pago al crear preferencia (HTTP {}): {}", e.getStatusCode().value(), mpBody);
            String detail = extractMpErrorMessage(mpBody);
            int code = e.getStatusCode().value();
            if (code == 401 || code == 403) {
                throw new IllegalStateException(
                        "Access Token de Mercado Pago inválido o sin permisos. Revisá el token en el panel Pagos.");
            }
            throw new IllegalStateException(
                    "No se pudo crear el pago en Mercado Pago"
                            + (detail != null ? ": " + detail : ". Verificá el Access Token y las URLs configuradas."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al crear preferencia Mercado Pago: {}", e.getMessage(), e);
            throw new IllegalStateException("Error al conectar con Mercado Pago");
        }
    }

    public void marcarComoPagado(String establecimiento, String reservaId) {
        String codigo = establecimiento.toLowerCase().trim();
        String id = reservaId.trim();

        Optional<NegocioData.ReservaData> reservaOpt = negocioDataService.getReservas(codigo).stream()
                .filter(r -> id.equals(r.getId()))
                .findFirst();

        if (reservaOpt.isEmpty()) {
            throw new IllegalArgumentException("Reserva no encontrada");
        }

        NegocioData.ReservaData reserva = reservaOpt.get();
        if (Boolean.TRUE.equals(reserva.getPagado())) {
            return;
        }

        negocioDataService.updateReserva(codigo, id, "pagado", true);

        String email = reserva.getUsuarioEmail();
        if (email != null && !email.isBlank()) {
            usuarioRepository.findByEmail(email.toLowerCase().trim()).ifPresent(usuario -> {
                List<Usuario.ReservaEnHistorial> historial = usuario.getHistorialReservas();
                if (historial == null) {
                    return;
                }
                boolean changed = false;
                for (Usuario.ReservaEnHistorial item : historial) {
                    if (id.equals(item.getId())) {
                        item.setPagado(true);
                        changed = true;
                        break;
                    }
                }
                if (changed) {
                    usuarioRepository.save(usuario);
                }
            });
        }
        log.info("Pago confirmado para reserva {} en {}", id, codigo);
    }

    public void consultarPagoYMarcar(String establecimiento, String paymentId) {
        String codigo = establecimiento.toLowerCase().trim();
        String accessToken = negocioDataService.findMercadoPagoAccessToken(codigo)
                .orElseThrow(() -> new IllegalStateException("Mercado Pago no configurado"));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    PAYMENTS_URL + paymentId,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String status = textOrNull(root, "status");
            if (!"approved".equalsIgnoreCase(status)) {
                log.info("Pago MP {} estado={}, no se marca como pagado", paymentId, status);
                return;
            }
            String externalRef = textOrNull(root, "external_reference");
            String[] parts = parseExternalReference(externalRef);
            if (parts == null) {
                log.warn("Pago MP {} sin external_reference válida", paymentId);
                return;
            }
            marcarComoPagado(parts[0], parts[1]);
        } catch (HttpStatusCodeException e) {
            log.error("Error al consultar pago MP {}: {}", paymentId, e.getResponseBodyAsString());
            throw new IllegalStateException("No se pudo verificar el pago en Mercado Pago");
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al procesar pago MP {}: {}", paymentId, e.getMessage(), e);
            throw new IllegalStateException("Error al procesar el pago");
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

    private String resolveFrontBaseUrl(String override) {
        if (override != null && !override.isBlank()) {
            String cleaned = trimTrailingSlash(override.trim());
            if (isAllowedFrontUrl(cleaned)) {
                return cleaned;
            }
            log.warn("frontBaseUrl ignorada (no permitida): {}", override);
        }
        return frontendBaseUrl;
    }

    private static boolean isAllowedFrontUrl(String url) {
        if (url == null) {
            return false;
        }
        String lower = url.toLowerCase();
        return lower.startsWith("https://")
                || lower.startsWith("http://localhost")
                || lower.startsWith("http://127.0.0.1");
    }

    private static boolean isPublicHttpUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String lower = url.toLowerCase();
        return lower.startsWith("https://")
                && !lower.contains("localhost")
                && !lower.contains("127.0.0.1");
    }

    private String extractMpErrorMessage(String body) {
        if (body == null || body.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            if (root.has("message") && !root.get("message").asText().isBlank()) {
                return root.get("message").asText();
            }
            if (root.has("cause") && root.get("cause").isArray() && root.get("cause").size() > 0) {
                JsonNode first = root.get("cause").get(0);
                if (first.has("description")) {
                    return first.get("description").asText();
                }
                if (first.has("message")) {
                    return first.get("message").asText();
                }
            }
        } catch (Exception ignored) {
            // ignore
        }
        return null;
    }

    private static String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return url;
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private static String textOrNull(JsonNode root, String field) {
        JsonNode node = root.get(field);
        return node != null && !node.isNull() ? node.asText() : null;
    }
}
