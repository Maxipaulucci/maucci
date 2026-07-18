package com.maxturnos.service;

import com.maxturnos.model.NegocioData;
import com.maxturnos.model.Usuario;
import com.maxturnos.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class TransferenciaPagoService {

    private static final Logger log = LoggerFactory.getLogger(TransferenciaPagoService.class);
    private static final int MAX_COMPROBANTE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> CONTENT_TYPES_PERMITIDOS = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"
    );

    private final NegocioDataService negocioDataService;
    private final UsuarioRepository usuarioRepository;

    public TransferenciaPagoService(NegocioDataService negocioDataService,
                                    UsuarioRepository usuarioRepository) {
        this.negocioDataService = negocioDataService;
        this.usuarioRepository = usuarioRepository;
    }

    public void confirmarPagoConComprobante(
            String establecimiento,
            String reservaId,
            String comprobanteBase64,
            String comprobanteNombre,
            String comprobanteContentType) {

        String codigo = establecimiento.toLowerCase(Locale.ROOT).trim();
        String id = reservaId.trim();

        NegocioData data = negocioDataService.getOrCreate(codigo);
        if (!"TRANSFERENCIA".equals(negocioDataService.resolveMetodoPago(data))
            || !negocioDataService.isTransferenciaConfigurada(data)) {
            throw new IllegalStateException("Este negocio no tiene pago por transferencia activo");
        }

        if (comprobanteBase64 == null || comprobanteBase64.isBlank()) {
            throw new IllegalArgumentException("Debés adjuntar un comprobante");
        }

        String raw = stripDataUrlPrefix(comprobanteBase64.trim());
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(raw);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("El comprobante no es un archivo válido");
        }
        if (bytes.length == 0) {
            throw new IllegalArgumentException("El comprobante está vacío");
        }
        if (bytes.length > MAX_COMPROBANTE_BYTES) {
            throw new IllegalArgumentException("El comprobante no puede superar los 5 MB");
        }

        String contentType = normalizeContentType(comprobanteContentType, comprobanteNombre);
        if (!CONTENT_TYPES_PERMITIDOS.contains(contentType)) {
            throw new IllegalArgumentException("Formato no permitido. Usá JPG, PNG, WEBP o PDF");
        }

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

        String nombre = (comprobanteNombre != null && !comprobanteNombre.isBlank())
            ? comprobanteNombre.trim()
            : "comprobante";

        negocioDataService.updateReserva(codigo, id, "comprobantePago", raw);
        negocioDataService.updateReserva(codigo, id, "comprobanteNombre", nombre);
        negocioDataService.updateReserva(codigo, id, "comprobanteContentType", contentType);
        negocioDataService.updateReserva(codigo, id, "pagado", true);

        String email = reserva.getUsuarioEmail();
        if (email != null && !email.isBlank()) {
            usuarioRepository.findByEmail(email.toLowerCase(Locale.ROOT).trim()).ifPresent(usuario -> {
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

        log.info("Pago por transferencia confirmado con comprobante para reserva {} en {}", id, codigo);
    }

    private static String stripDataUrlPrefix(String value) {
        int comma = value.indexOf(',');
        if (value.startsWith("data:") && comma >= 0) {
            return value.substring(comma + 1);
        }
        return value;
    }

    private static String normalizeContentType(String contentType, String fileName) {
        if (contentType != null && !contentType.isBlank()) {
            String ct = contentType.trim().toLowerCase(Locale.ROOT);
            int semi = ct.indexOf(';');
            if (semi >= 0) {
                ct = ct.substring(0, semi);
            }
            if ("image/jpg".equals(ct)) {
                return "image/jpeg";
            }
            return ct;
        }
        if (fileName != null) {
            String lower = fileName.toLowerCase(Locale.ROOT);
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".pdf")) return "application/pdf";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        }
        return "application/octet-stream";
    }
}
