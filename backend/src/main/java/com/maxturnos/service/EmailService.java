package com.maxturnos.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${spring.mail.password:}")
    private String emailPassword;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void logEmailConfigurationStatus() {
        if (!isEmailConfigured()) {
            log.error(
                "Email SMTP NO configurado. Definí SPRING_MAIL_USERNAME y SPRING_MAIL_PASSWORD "
                    + "en las variables de entorno del servidor (Render). Los mails no se enviarán."
            );
            return;
        }

        log.info("Email SMTP configurado (remitente: {})", fromEmail.trim());

        if (mailSender instanceof JavaMailSenderImpl impl) {
            try {
                impl.testConnection();
                log.info("Conexión SMTP con Gmail verificada correctamente al iniciar");
            } catch (Exception e) {
                log.error(
                    "FALLO la conexión SMTP al iniciar: {}. "
                        + "Usá una contraseña de aplicación de Gmail (no la contraseña normal), sin espacios. "
                        + "Usuario: {}",
                    e.getMessage(),
                    fromEmail.trim(),
                    e
                );
            }
        }
    }

    private String normalizedFromEmail() {
        return fromEmail == null ? "" : fromEmail.trim();
    }

    private String normalizedPassword() {
        if (emailPassword == null) {
            return "";
        }
        return emailPassword.trim().replace(" ", "");
    }

    /**
     * Indica si el correo está configurado (usuario y contraseña definidos).
     * Si no, los códigos solo se imprimen en consola (modo desarrollo).
     */
    public boolean isEmailConfigured() {
        return !normalizedFromEmail().isEmpty() && !normalizedPassword().isEmpty();
    }
    
    public boolean enviarCodigoVerificacion(String email, String codigo) {
        if (!isEmailConfigured()) {
            log.debug("Email no configurado: no se envía código de verificación (solo desarrollo)");
            return true;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(normalizedFromEmail());
            message.setTo(email);
            message.setSubject("Código de Verificación - Maxturnos");
            message.setText("Tu código de verificación es: " + codigo + "\n\nEste código expira en 15 minutos.");
            mailSender.send(message);
            log.info("Código de verificación enviado a {}", email);
            return true;
        } catch (Exception e) {
            log.error("Error al enviar código de verificación a {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
    
    public boolean enviarEmailPersonalizado(String email, String asunto, String mensaje) {
        if (!isEmailConfigured()) {
            log.error(
                "Email no configurado: no se envía a {}. Configure SPRING_MAIL_USERNAME y SPRING_MAIL_PASSWORD en Render.",
                email
            );
            return false;
        }
        if (email == null || email.trim().isEmpty()) {
            log.warn("Destinatario de email vacío, no se envía.");
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(normalizedFromEmail());
            message.setTo(email.trim());
            message.setSubject(asunto != null ? asunto : "(Sin asunto)");
            message.setText(mensaje != null ? mensaje : "");
            mailSender.send(message);
            log.info("Email enviado correctamente a {} (asunto: {})", email, asunto);
            return true;
        } catch (Exception e) {
            log.error("Error al enviar email a {} (asunto: {}): {}", email, asunto, e.getMessage(), e);
            return false;
        }
    }
}

