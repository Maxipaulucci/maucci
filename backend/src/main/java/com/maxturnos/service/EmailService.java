package com.maxturnos.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    /**
     * Indica si el correo está configurado (usuario y contraseña definidos).
     * Si no, los códigos solo se imprimen en consola (modo desarrollo).
     */
    public boolean isEmailConfigured() {
        return fromEmail != null && !fromEmail.isEmpty()
            && emailPassword != null && !emailPassword.isEmpty();
    }
    
    public boolean enviarCodigoVerificacion(String email, String codigo) {
        if (fromEmail == null || fromEmail.isEmpty() || emailPassword == null || emailPassword.isEmpty()) {
            log.debug("Email no configurado: no se envía código de verificación (solo desarrollo)");
            return true;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Código de Verificación - Maxturnos");
            message.setText("Tu código de verificación es: " + codigo + "\n\nEste código expira en 15 minutos.");
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            log.error("Error al enviar código de verificación a {}: {}", email, e.getMessage(), e);
            return false;
        }
    }
    
    public boolean enviarEmailPersonalizado(String email, String asunto, String mensaje) {
        if (fromEmail == null || fromEmail.isEmpty() || emailPassword == null || emailPassword.isEmpty()) {
            log.warn("Email no configurado (spring.mail.username/password): no se envía email a {}. Configure SPRING_MAIL_USERNAME y SPRING_MAIL_PASSWORD.", email);
            return true;
        }
        if (email == null || email.trim().isEmpty()) {
            log.warn("Destinatario de email vacío, no se envía.");
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email.trim());
            message.setSubject(asunto != null ? asunto : "(Sin asunto)");
            message.setText(mensaje != null ? mensaje : "");
            mailSender.send(message);
            log.debug("Email enviado correctamente a {} (asunto: {})", email, asunto);
            return true;
        } catch (Exception e) {
            log.error("Error al enviar email a {} (asunto: {}): {}", email, asunto, e.getMessage(), e);
            return false;
        }
    }
}

