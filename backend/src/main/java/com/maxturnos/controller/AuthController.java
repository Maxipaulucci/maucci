package com.maxturnos.controller;

import com.maxturnos.dto.*;
import com.maxturnos.model.Usuario;
import com.maxturnos.model.Negocio;
import com.maxturnos.repository.UsuarioRepository;
import com.maxturnos.repository.NegocioRepository;
import com.maxturnos.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final UsuarioRepository usuarioRepository;
    private final NegocioRepository negocioRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;
    
    public AuthController(UsuarioRepository usuarioRepository, 
                         NegocioRepository negocioRepository,
                         EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.negocioRepository = negocioRepository;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    // Función helper para normalizar nombre/apellido: primera letra mayúscula, resto minúscula
    private String normalizarNombre(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return texto;
        }
        String textoTrimmed = texto.trim();
        if (textoTrimmed.length() == 0) {
            return textoTrimmed;
        }
        return textoTrimmed.substring(0, 1).toUpperCase() + 
               textoTrimmed.substring(1).toLowerCase();
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
                String nombreNegocio = request.getNombreNegocio();
                if (nombreNegocio != null && !nombreNegocio.trim().isEmpty()) {
                    nombreNegocio = nombreNegocio.trim().toLowerCase();
                    if (usuarioRepository.existsByNombreNegocioAndRol(nombreNegocio, "admin")) {
                        System.out.println("⚠️ Ya existe un admin con el negocio: " + nombreNegocio);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error("Ya existe un administrador registrado para este negocio. Solo puede haber un administrador por negocio."));
                    }
                }
            }
            
            // Crear nuevo usuario
            Usuario usuario = new Usuario();
            // Normalizar nombre y apellido: primera letra mayúscula, resto minúscula
            String nombreNormalizado = normalizarNombre(request.getNombre());
            String apellidoNormalizado = normalizarNombre(request.getApellido());
            usuario.setNombre(nombreNormalizado);
            usuario.setApellido(apellidoNormalizado);
            
            // Log para debug
            System.out.println("═══════════════════════════════════════");
            System.out.println("📝 Datos de registro recibidos:");
            System.out.println("Tipo de registro: " + request.getTipoRegistro());
            System.out.println("Nombre negocio recibido: " + request.getNombreNegocio());
            
            if (request.getNombreNegocio() != null && !request.getNombreNegocio().trim().isEmpty()) {
                usuario.setNombreNegocio(request.getNombreNegocio().trim().toLowerCase());
                System.out.println("✅ Nombre negocio asignado: " + usuario.getNombreNegocio());
            } else {
                System.out.println("⚠️ Nombre negocio vacío o null");
            }
            
            usuario.setEmail(request.getEmail().toLowerCase().trim());
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
            // Asignar rol según el tipo de registro
            if ("negocio".equalsIgnoreCase(request.getTipoRegistro())) {
                usuario.setRol("admin");
                System.out.println("✅ Rol asignado: admin");
            } else {
                usuario.setRol("usuario");
                System.out.println("✅ Rol asignado: usuario");
            }
            usuario.generarCodigoVerificacion();
            
            // Enviar código por email
            boolean emailEnviado = emailService.enviarCodigoVerificacion(
                usuario.getEmail(), 
                usuario.getCodigoVerificacion()
            );
            
            // Si falla el envío y no es modo desarrollo, no crear el usuario
            if (!emailEnviado && !usuario.getCodigoVerificacion().equals("000000")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error al enviar el código de verificación. Por favor intenta nuevamente."));
            }
            
            // Guardar usuario en MongoDB
            System.out.println("💾 Guardando usuario en MongoDB...");
            System.out.println("Email: " + usuario.getEmail());
            System.out.println("Nombre: " + usuario.getNombre());
            System.out.println("Apellido: " + usuario.getApellido());
            System.out.println("Nombre Negocio: " + usuario.getNombreNegocio());
            System.out.println("Rol: " + usuario.getRol());
            System.out.println("Código: " + usuario.getCodigoVerificacion());
            try {
                usuario = usuarioRepository.save(usuario);
                System.out.println("✅ Usuario guardado exitosamente. ID: " + usuario.getId());
                System.out.println("✅ Nombre Negocio guardado: " + usuario.getNombreNegocio());
                System.out.println("═══════════════════════════════════════");
            } catch (Exception e) {
                System.err.println("❌ Error al guardar usuario: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("mensaje", emailEnviado ? 
                "Usuario registrado. Revisa tu email para el código de verificación." :
                "Usuario registrado. Revisa la consola del servidor para el código de verificación (modo desarrollo).");
            
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
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            if (usuario.getEmailVerificado()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El email ya está verificado"));
            }
            
            if (usuario.getCodigoVerificacion() == null || 
                !usuario.getCodigoVerificacion().equals(request.getCodigo())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Código de verificación inválido"));
            }
            
            if (usuario.codigoExpirado()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El código de verificación ha expirado"));
            }
            
            usuario.setEmailVerificado(true);
            usuario.setCodigoVerificacion(null);
            usuario.setCodigoVerificacionExpira(null);
            usuarioRepository.save(usuario);
            
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
            System.out.println("═══════════════════════════════════════");
            System.out.println("🔐 Intentando login...");
            System.out.println("Email: " + request.getEmail());
            
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> {
                    System.out.println("❌ Usuario no encontrado en MongoDB");
                    return new RuntimeException("Credenciales inválidas");
                });
            
            System.out.println("✅ Usuario encontrado. ID: " + usuario.getId());
            System.out.println("Email verificado: " + usuario.getEmailVerificado());
            
            if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                System.out.println("❌ Contraseña incorrecta");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Credenciales inválidas"));
            }
            
            if (!usuario.getEmailVerificado()) {
                System.out.println("❌ Email no verificado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Debes verificar tu email antes de iniciar sesión"));
            }
            
            System.out.println("✅ Login exitoso");
            System.out.println("Rol: " + usuario.getRol());
            
            // Si el usuario es admin (negocio), verificar si existe el negocio en la base de datos
            if ("admin".equals(usuario.getRol())) {
                String nombreNegocio = usuario.getNombreNegocio();
                if (nombreNegocio == null || nombreNegocio.trim().isEmpty()) {
                    System.out.println("⚠️ Usuario admin sin nombre de negocio");
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("negocioNoEncontrado", true);
                    errorData.put("email", usuario.getEmail());
                    errorData.put("nombreNegocio", "No especificado");
                    return ResponseEntity.status(HttpStatus.OK)
                        .body(ApiResponse.error("Negocio no encontrado", errorData));
                }
                
                // Buscar el negocio primero por código, luego por nombre
                String nombreNegocioLower = nombreNegocio.toLowerCase().trim();
                Optional<Negocio> negocioOpt = negocioRepository.findByCodigoAndActivoTrue(nombreNegocioLower);
                
                // Si no se encuentra por código, buscar por nombre (con activo)
                if (negocioOpt.isEmpty()) {
                    negocioOpt = negocioRepository.findByNombreAndActivoTrue(nombreNegocioLower);
                }
                
                // Si aún no se encuentra, buscar por nombre sin condición de activo
                if (negocioOpt.isEmpty()) {
                    negocioOpt = negocioRepository.findByNombre(nombreNegocioLower);
                }
                
                if (negocioOpt.isEmpty()) {
                    System.out.println("⚠️ Negocio no encontrado por código ni por nombre: " + nombreNegocio);
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("negocioNoEncontrado", true);
                    errorData.put("email", usuario.getEmail());
                    errorData.put("nombreNegocio", nombreNegocio);
                    return ResponseEntity.status(HttpStatus.OK)
                        .body(ApiResponse.error("Negocio no encontrado", errorData));
                }
                
                System.out.println("✅ Negocio encontrado: " + negocioOpt.get().getNombre());
            }
            
            System.out.println("═══════════════════════════════════════");
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("emailVerificado", usuario.getEmailVerificado());
            data.put("rol", usuario.getRol());
            data.put("nombreNegocio", usuario.getNombreNegocio());
            
            return ResponseEntity.ok(ApiResponse.success("Inicio de sesión exitoso", data));
            
        } catch (Exception e) {
            System.err.println("❌ Error en login: " + e.getMessage());
            e.printStackTrace();
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
            
            Usuario usuario = usuarioRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            if (usuario.getEmailVerificado()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("El email ya está verificado"));
            }
            
            usuario.generarCodigoVerificacion();
            usuarioRepository.save(usuario);
            
            boolean emailEnviado = emailService.enviarCodigoVerificacion(
                usuario.getEmail(), 
                usuario.getCodigoVerificacion()
            );
            
            Map<String, Object> data = new HashMap<>();
            data.put("mensaje", emailEnviado ? 
                "Código reenviado. Revisa tu email." :
                "Código reenviado. Revisa la consola del servidor (modo desarrollo).");
            
            return ResponseEntity.ok(ApiResponse.success("Código reenviado exitosamente", data));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
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
            
            System.out.println("✅ Usuario eliminado: " + email);
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", email);
            data.put("mensaje", "Cuenta eliminada exitosamente. El email ahora puede ser utilizado para registrarse nuevamente.");
            
            return ResponseEntity.ok(ApiResponse.success("Cuenta eliminada exitosamente", data));
            
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar cuenta: " + e.getMessage());
            e.printStackTrace();
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
            
            Map<String, Object> data = new HashMap<>();
            data.put("email", usuario.getEmail());
            data.put("mensaje", emailEnviado ? 
                "Código de recuperación enviado. Revisa tu email." :
                "Código de recuperación generado. Revisa la consola del servidor (modo desarrollo).");
            
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

