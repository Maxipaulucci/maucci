package com.maxturnos.service;

import com.maxturnos.model.Resena;
import com.maxturnos.repository.ResenaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResenaCleanupService {

    private final ResenaRepository resenaRepository;

    @Autowired
    public ResenaCleanupService(ResenaRepository resenaRepository) {
        this.resenaRepository = resenaRepository;
    }

    /**
     * Elimina automáticamente las reseñas rechazadas que tienen más de 24 horas.
     * Se ejecuta cada hora.
     */
    @Scheduled(fixedRate = 3600000) // 3600000 ms = 1 hora
    public void eliminarResenasRechazadasAntiguas() {
        try {
            // Calcular la fecha límite: hace 24 horas
            LocalDateTime fechaLimite = LocalDateTime.now().minusHours(24);
            
            // Buscar reseñas rechazadas con fechaAprobacion anterior a hace 24 horas
            List<Resena> resenasAEliminar = resenaRepository.findByAprobadaFalseAndFechaAprobacionBefore(fechaLimite);
            
            if (!resenasAEliminar.isEmpty()) {
                System.out.println("═══════════════════════════════════════");
                System.out.println("🧹 Limpieza automática de reseñas rechazadas");
                System.out.println("📅 Fecha límite: " + fechaLimite);
                System.out.println("📊 Reseñas a eliminar: " + resenasAEliminar.size());
                
                // Eliminar las reseñas
                resenaRepository.deleteAll(resenasAEliminar);
                
                System.out.println("✅ Reseñas eliminadas exitosamente");
                System.out.println("═══════════════════════════════════════");
            }
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar reseñas rechazadas antiguas: " + e.getMessage());
            e.printStackTrace();
        }
    }
}








