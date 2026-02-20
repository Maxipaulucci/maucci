package com.maxturnos.controller;

import com.maxturnos.dto.*;
import com.maxturnos.model.Usuario;
import com.maxturnos.model.Negocio;
import com.maxturnos.repository.UsuarioRepository;
import com.maxturnos.repository.NegocioRepository;
import com.maxturnos.model.NegocioData;
import com.maxturnos.repository.NegocioDataRepository;
import com.maxturnos.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    /** Registros pendientes de verificación de email (solo en memoria). Se guardan en DB al verificar. */
    private final Map<String, PendingReg> pendientes = new ConcurrentHashMap<>();

    private static final class PendingReg {
        String nombre, apellido, password, rol, nombreNegocio;
        String codigoVerificacion;
        Date codigoVerificacionExpira;
    }

    private final UsuarioRepository usuarioRepository;
    private final NegocioRepository negocioRepository;
    private final NegocioDataRepository negocioDataRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository,
                          NegocioRepository negocioRepository,
                          NegocioDataRepository negocioDataRepository,
                          EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.negocioRepository = negocioRepository;
        this.negocioDataRepository = negocioDataRepository;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    /**
     * Normaliza nombre o apellido: primera letra de cada palabra en mayúscula, resto en minúscula.
     * Soporta varios nombres/apellidos separados por espacio (ej. "maximo augusto" -> "Maximo Augusto").
     */
    private String normalizarNombre(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return texto == null ? null : texto.trim();
        }
        String textoTrimmed = texto.trim();
        if (textoTrimmed.isEmpty()) {
            return textoTrimmed;
        }
        String[] palabras = textoTrimmed.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < palabras.length; i++) {
            if (i > 0) sb.append(" ");
            String p = palabras[i];
            if (!p.isEmpty()) {
                sb.append(p.substring(0, 1).toUpperCase()).append(p.substring(1).toLowerCase());
            }
        }
        return sb.toString();
    }

    /**
     * Normaliza el nombre del negocio: todo en minúscula y espacios reemplazados por guion bajo.
     * Ej. "Barberia Clasica" -> "barberia_clasica", "mi   negocio" -> "mi_negocio"
     */
    private String normalizarNombreNegocio(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return texto == null ? null : texto.trim().toLowerCase();
        }
        return texto.trim().toLowerCase().replaceAll("\\s+", "_");
    }

    private void limpiarPendientesExpirados() {
        Date ahora = new Date();
        pendientes.entrySet().removeIf(e ->
            e.getValue().codigoVerificacionExpira != null
                && e.getValue().codigoVerificacionExpira.before(ahora));
    }

    @Scheduled(fixedRate = 900000)
    public void limpiarPendientesExpiradosProgramado() {
        int antes = pendientes.size();
        limpiarPendientesExpirados();
        int despues = pendientes.size();
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Verificar si el usuario ya existe
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Este email ya está registrado"));
            }
            
            // Si es registro de negocio, verificar que no exista otro admin con ese nombreNegocio
            if ("negocio".equalsIgnoreCase(request.getTipoRegistro())) {
                String nombreNegocio = normalizarNombreNegocio(request.getNombreNegocio());
                if (nombreNegocio != null && !nombreNegocio.isEmpty()) {
                    if (usuarioRepository.existsByNombreNegocioAndRol(nombreNegocio, "admin")) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error("Ya existe un administrador registrado para este negocio. Solo puede haber un administrador por negocio."));
                    }
                }
            }
            
            // Crear nuevo usuario
            Usuario usuario = new Usuario();
            // Normalizar nombre y apellido: primera letra de cada palabra en mayúscula (ej. "maximo augusto" -> "Maximo Augusto")
            String nombreNormalizado = normalizarNombre(request.getNombre());
            String apellidoNormalizado = normalizarNombre(request.getApellido());
            usuario.setNombre(nombreNormalizado);
            usuario.setApellido(apellidoNormalizado);
            
            if (request.getNombreNegocio() != null && !request.getNombreNegocio().trim().isEmpty()) {
                usuario.setNombreNegocio(normalizarNombreNegocio(request.getNombreNegocio()));
            }
            
            String emailLower = request.getEmail().toLowerCase().trim();
            usuario.setEmail(emailLower);
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
            if ("negocio".equalsIgnoreCase(request.getTipoRegistro())) {
                usuario.setRol("admin");
            } else {
                usuario.setRol("usuario");
            }
            usuario.generarCodigoVerificacion();

            // Enviar código por email (usuario aún no se guarda en DB)
            boolean emailEnviado = emailService.enviarCodigoVerificacion(
                usuario.getEmail(),
                usuario.getCodigoVerificacion()
            );

            if (!emailEnviado && emailService.isEmailConfigured()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al enviar el código de verificación. Por favor intenta nuevamente."));
            }

            // Guardar solo en memoria hasta que verifique el email
            limpiarPendientesExpirados();
            PendingReg pr = new PendingReg();
            pr.nombre = usuario.getNombre();
            pr.apellido = usuario.getApellido();
            pr.password = usuario.getPassword();
            pr.rol = usuario.getRol();
            pr.nombreNegocio = usuario.getNombreNegocio();
            pr.codigoVerificacion = usuario.getCodigoVerificacion();
            pr.codigoVerificacionExpira = usuario.getCodigoVerificacionExpira();
            pendientes.put(emailLower, pr);

            boolean correoConfigurado = emailService.isEmailConfigured();
            String mensajeRegistro = (correoConfigurado && emailEnviado)
                ? "Usuario registrado. Revisa tu email para el código de verificación."
                : "Usuario registrado. Revisa la consola del servidor para el código de verificación (modo desarrollo).";

            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("mensaje", mensajeRegistro);

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Usuario registrado exitosamente", data));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al registrar usuario: " + e.getMessage()));
        }
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        try {
            String emailLower = request.getEmail().toLowerCase().trim();
            PendingReg pr = pendientes.get(emailLower);

            if (pr == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Usuario no encontrado o código expirado. Volvé a registrarte."));
            }
            if (pr.codigoVerificacion == null || !pr.codigoVerificacion.equals(request.getCodigo())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Código de verificación inválido"));
            }
            if (pr.codigoVerificacionExpira != null && pr.codigoVerificacionExpira.before(new Date())) {
                pendientes.remove(emailLower);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El código de verificación ha expirado. Volvé a registrarte."));
            }

            // Crear usuario y guardarlo en la base de datos
            Usuario usuario = new Usuario();
            usuario.setNombre(pr.nombre);
            usuario.setApellido(pr.apellido);
            usuario.setEmail(emailLower);
            usuario.setPassword(pr.password);
            usuario.setRol(pr.rol);
            usuario.setNombreNegocio(pr.nombreNegocio);
            usuario.setEmailVerificado(true);
            usuario.setCodigoVerificacion(null);
            usuario.setCodigoVerificacionExpira(null);

            usuario = usuarioRepository.save(usuario);
            pendientes.remove(emailLower);

            if ("admin".equals(usuario.getRol()) && usuario.getNombreNegocio() != null && !usuario.getNombreNegocio().isEmpty()) {
                String codigo = usuario.getNombreNegocio().trim().toLowerCase();
                Optional<NegocioData> dataOpt = negocioDataRepository.findById(codigo);
                NegocioData data;
                if (dataOpt.isPresent()) {
                    data = dataOpt.get();
                    data.setMailAsociado(usuario.getEmail());
                } else {
                    data = new NegocioData();
                    data.setId(codigo);
                    data.setMailAsociado(usuario.getEmail());
                }
                negocioDataRepository.save(codigo, data);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("emailVerificado", true);

            return ResponseEntity.ok(ApiResponse.success("Email verificado exitosamente", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));
            
            if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Credenciales inválidas"));
            }
            
            if (!usuario.getEmailVerificado()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Debes verificar tu email antes de iniciar sesión"));
            }
            
            if ("admin".equals(usuario.getRol())) {
                String nombreNegocio = usuario.getNombreNegocio();
                if (nombreNegocio == null || nombreNegocio.trim().isEmpty()) {
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("negocioNoEncontrado", true);
                    errorData.put("email", usuario.getEmail());
                    errorData.put("nombreNegocio", "No especificado");
                    return ResponseEntity.status(HttpStatus.OK)
                        .body(ApiResponse.error("Negocio no encontrado", errorData));
                }
                
                // Vincular usuario con negocio: documento.id = nombreNegocio Y documento.mailAsociado = usuario.email
                String nombreNegocioLower = nombreNegocio.toLowerCase().trim();
                Optional<NegocioData> dataOpt = negocioDataRepository.findById(nombreNegocioLower);
                if (dataOpt.isEmpty()) {
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("negocioNoEncontrado", true);
                    errorData.put("email", usuario.getEmail());
                    errorData.put("nombreNegocio", nombreNegocio);
                    return ResponseEntity.status(HttpStatus.OK)
                        .body(ApiResponse.error("Negocio no encontrado", errorData));
                }
                NegocioData data = dataOpt.get();
                String mailAsociado = data.getMailAsociado();
                // Si el documento tiene mailAsociado, debe coincidir con el email del usuario
                if (mailAsociado != null && !mailAsociado.trim().isEmpty()
                    && !mailAsociado.trim().equalsIgnoreCase(usuario.getEmail().trim())) {
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("negocioNoEncontrado", true);
                    errorData.put("email", usuario.getEmail());
                    errorData.put("nombreNegocio", nombreNegocio);
                    return ResponseEntity.status(HttpStatus.OK)
                        .body(ApiResponse.error("Negocio no encontrado", errorData));
                }
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("emailVerificado", usuario.getEmailVerificado());
            data.put("rol", usuario.getRol());
            data.put("nombreNegocio", usuario.getNombreNegocio());
            data.put("isSuperAdmin", "pauluccimaximo81@gmail.com".equalsIgnoreCase(usuario.getEmail().trim()));
            
            return ResponseEntity.ok(ApiResponse.success("Inicio de sesión exitoso", data));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Credenciales inválidas"));
        }
    }
    
    @PostMapping("/resend-code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resendCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El email es requerido"));
            }
            String emailLower = email.toLowerCase().trim();
            PendingReg pr = pendientes.get(emailLower);
            if (pr == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Usuario no encontrado. Volvé a registrarte."));
            }

            String nuevoCodigo = String.valueOf((int) (Math.random() * 900000) + 100000);
            Date expira = new Date(System.currentTimeMillis() + 15 * 60 * 1000);
            pr.codigoVerificacion = nuevoCodigo;
            pr.codigoVerificacionExpira = expira;

            boolean emailEnviado = emailService.enviarCodigoVerificacion(emailLower, nuevoCodigo);
            boolean correoConfigurado = emailService.isEmailConfigured();
            String mensaje = (correoConfigurado && emailEnviado)
                ? "Código reenviado. Revisa tu email."
                : "Código reenviado. Revisa la consola del servidor (modo desarrollo).";

            Map<String, Object> data = new HashMap<>();
            data.put("mensaje", mensaje);

            return ResponseEntity.ok(ApiResponse.success("Código reenviado exitosamente", data));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/mi-historial")
    public ResponseEntity<ApiResponse<List<Usuario.ReservaEnHistorial>>> getMiHistorial(@RequestParam String email) {
        try {
            String emailLower = email != null ? email.toLowerCase().trim() : "";
            if (emailLower.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El email es requerido"));
            }
            Usuario usuario = usuarioRepository.findByEmail(emailLower)
                .orElse(null);
            List<Usuario.ReservaEnHistorial> historial = usuario != null && usuario.getHistorialReservas() != null
                ? new ArrayList<>(usuario.getHistorialReservas())
                : new ArrayList<>();
            Collections.reverse(historial);
            return ResponseEntity.ok(ApiResponse.success("OK", historial));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/delete-account")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAccount(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El email es requerido"));
            }
            
            Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Eliminar el usuario de la base de datos
            usuarioRepository.delete(usuario);
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", email);
            data.put("mensaje", "Cuenta eliminada exitosamente. El email ahora puede ser utilizado para registrarse nuevamente.");
            
            return ResponseEntity.ok(ApiResponse.success("Cuenta eliminada exitosamente", data));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Error al eliminar cuenta: " + e.getMessage()));
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El email es requerido"));
            }
            
            Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Email no encontrado"));
            
            // Generar código de recuperación
            usuario.generarCodigoVerificacion();
            usuarioRepository.save(usuario);
            
            // Enviar código por email
            boolean emailEnviado = emailService.enviarCodigoVerificacion(
                usuario.getEmail(), 
                usuario.getCodigoVerificacion()
            );
            boolean correoConfigurado = emailService.isEmailConfigured();
            String mensaje = (correoConfigurado && emailEnviado)
                ? "Código de recuperación enviado. Revisa tu email."
                : "Código de recuperación generado. Revisa la consola del servidor (modo desarrollo).";
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("mensaje", mensaje);
            
            return ResponseEntity.ok(ApiResponse.success("Código de recuperación enviado", data));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/verify-password-reset-code")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPasswordResetCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String codigo = request.get("codigo");
            
            if (email == null || email.isEmpty() || codigo == null || codigo.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Email y código son requeridos"));
            }
            
            Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Verificar código (sin importar si el email está verificado o no)
            if (usuario.getCodigoVerificacion() == null || 
                !usuario.getCodigoVerificacion().equals(codigo)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Código de verificación inválido"));
            }
            
            if (usuario.codigoExpirado()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El código de verificación ha expirado"));
            }
            
            // No marcamos el email como verificado ni limpiamos el código aquí
            // Solo verificamos que el código sea válido para permitir cambiar la contraseña
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("codigoValido", true);
            
            return ResponseEntity.ok(ApiResponse.success("Código verificado correctamente", data));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String codigo = request.get("codigo");
            String nuevaPassword = request.get("nuevaPassword");
            
            if (email == null || email.isEmpty() || codigo == null || codigo.isEmpty() || 
                nuevaPassword == null || nuevaPassword.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Todos los campos son requeridos"));
            }
            
            Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Verificar código
            if (usuario.getCodigoVerificacion() == null || 
                !usuario.getCodigoVerificacion().equals(codigo)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Código de verificación inválido"));
            }
            
            if (usuario.codigoExpirado()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El código de verificación ha expirado"));
            }
            
            // Cambiar contraseña
            usuario.setPassword(passwordEncoder.encode(nuevaPassword));
            usuario.setCodigoVerificacion(null);
            usuario.setCodigoVerificacionExpira(null);
            usuarioRepository.save(usuario);
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("mensaje", "Contraseña restablecida exitosamente");
            
            return ResponseEntity.ok(ApiResponse.success("Contraseña restablecida exitosamente", data));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> changePassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (email == null || email.isEmpty() || currentPassword == null || currentPassword.isEmpty() || 
                newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Todos los campos son requeridos"));
            }
            
            Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Verificar que la contraseña actual sea correcta
            if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("La contraseña actual es incorrecta"));
            }
            
            // Verificar que la nueva contraseña sea diferente a la actual
            if (passwordEncoder.matches(newPassword, usuario.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("La nueva contraseña debe ser diferente a la contraseña actual"));
            }
            
            // Cambiar contraseña
            usuario.setPassword(passwordEncoder.encode(newPassword));
            usuarioRepository.save(usuario);
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("mensaje", "Contraseña cambiada exitosamente");
            
            return ResponseEntity.ok(ApiResponse.success("Contraseña cambiada exitosamente", data));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}

