package com.maxturnos.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
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
            return false;
        }
    }
    
    public boolean enviarEmailPersonalizado(String email, String asunto, String mensaje) {
        if (fromEmail == null || fromEmail.isEmpty() || emailPassword == null || emailPassword.isEmpty()) {
            return true;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject(asunto);
            message.setText(mensaje);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

