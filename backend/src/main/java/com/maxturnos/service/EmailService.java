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
    
    public boolean enviarCodigoVerificacion(String email, String codigo) {
        // Si no hay configuración de email, usar modo desarrollo
        if (fromEmail == null || fromEmail.isEmpty() || emailPassword == null || emailPassword.isEmpty()) {
            System.out.println("═══════════════════════════════════════");
            System.out.println("📧 MODO DESARROLLO - Email no configurado");
            System.out.println("═══════════════════════════════════════");
            System.out.println("Email destino: " + email);
            System.out.println("Código de verificación: " + codigo);
            System.out.println("═══════════════════════════════════════");
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
            System.err.println("Error al enviar email: " + e.getMessage());
            return false;
        }
    }
    
    public boolean enviarEmailPersonalizado(String email, String asunto, String mensaje) {
        // Si no hay configuración de email, usar modo desarrollo
        if (fromEmail == null || fromEmail.isEmpty() || emailPassword == null || emailPassword.isEmpty()) {
            System.out.println("═══════════════════════════════════════");
            System.out.println("📧 MODO DESARROLLO - Email no configurado");
            System.out.println("═══════════════════════════════════════");
            System.out.println("Email destino: " + email);
            System.out.println("Asunto: " + asunto);
            System.out.println("Mensaje: " + mensaje);
            System.out.println("═══════════════════════════════════════");
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
            System.err.println("Error al enviar email: " + e.getMessage());
            return false;
        }
    }
}

