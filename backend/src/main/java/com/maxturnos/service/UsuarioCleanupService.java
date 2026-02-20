package com.maxturnos.service;

import com.maxturnos.model.Usuario;
import com.maxturnos.repository.UsuarioRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Elimina usuarios que nunca verificaron su email, 1 hora después de haberse registrado.
 */
@Service
public class UsuarioCleanupService {

    private static final int HORAS_ANTES_DE_ELIMINAR = 1;

    private final UsuarioRepository usuarioRepository;

    public UsuarioCleanupService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Elimina usuarios no verificados creados hace más de 1 hora.
     * Se ejecuta cada 15 minutos.
     */
    @Scheduled(fixedRate = 900000) // 900000 ms = 15 minutos
    public void eliminarUsuariosNoVerificadosAntiguos() {
        try {
            LocalDateTime fechaLimite = LocalDateTime.now().minusHours(HORAS_ANTES_DE_ELIMINAR);
            List<Usuario> usuariosAEliminar = usuarioRepository.findNoVerificadosParaEliminar(fechaLimite);

            if (!usuariosAEliminar.isEmpty()) {
                usuarioRepository.deleteAll(usuariosAEliminar);
            }
        } catch (Exception e) {
            // Ignorar fallo en limpieza programada; se reintentará en la próxima ejecución
        }
    }
}
