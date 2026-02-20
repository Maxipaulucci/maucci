package com.maxturnos.service;

import com.maxturnos.model.Negocio;
import com.maxturnos.model.NegocioData;
import com.maxturnos.repository.NegocioRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResenaCleanupService {

    private final NegocioDataService negocioDataService;
    private final NegocioRepository negocioRepository;

    public ResenaCleanupService(NegocioDataService negocioDataService,
                                NegocioRepository negocioRepository) {
        this.negocioDataService = negocioDataService;
        this.negocioRepository = negocioRepository;
    }

    /**
     * Elimina automáticamente las reseñas rechazadas que tienen más de 24 horas.
     * Recorre los datos de cada negocio (colecciones por negocio).
     * Se ejecuta cada hora.
     */
    @Scheduled(fixedRate = 3600000) // 3600000 ms = 1 hora
    public void eliminarResenasRechazadasAntiguas() {
        try {
            LocalDateTime fechaLimite = LocalDateTime.now().minusHours(24);
            List<Negocio> negocios = negocioRepository.findByActivoTrue();
            for (Negocio negocio : negocios) {
                String codigo = negocio.getCodigo();
                if (codigo == null || codigo.isEmpty()) continue;
                List<NegocioData.ResenaData> resenas = negocioDataService.getResenas(codigo);
                List<NegocioData.ResenaData> aEliminar = resenas.stream()
                    .filter(r -> Boolean.FALSE.equals(r.getAprobada())
                        && r.getFechaAprobacion() != null
                        && r.getFechaAprobacion().isBefore(fechaLimite))
                    .collect(Collectors.toList());
                for (NegocioData.ResenaData r : aEliminar) {
                    if (r.getId() != null) {
                        negocioDataService.removeResena(codigo, r.getId());
                    }
                }
            }

        } catch (Exception e) {
            // Ignorar fallo en limpieza programada; se reintentará en la próxima ejecución
        }
    }
}
