package com.maxturnos.service;

import com.maxturnos.model.Negocio;
import com.maxturnos.model.NegocioData;
import com.maxturnos.repository.NegocioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaCleanupService {

    private final NegocioDataService negocioDataService;
    private final NegocioRepository negocioRepository;

    @Autowired
    public ReservaCleanupService(NegocioDataService negocioDataService,
                                  NegocioRepository negocioRepository) {
        this.negocioDataService = negocioDataService;
        this.negocioRepository = negocioRepository;
    }

    /**
     * Archiva y elimina automáticamente las reservas cuya fecha ya pasó.
     * Se ejecuta una vez al día a las 2:00 AM (hora local del servidor).
     * 
     * Proceso:
     * 1. Obtiene todos los negocios activos
     * 2. Para cada negocio, busca reservas con fecha anterior a hoy
     * 3. Las archiva en reservas históricas (para el resumen)
     * 4. Las elimina de las reservas activas
     * 
     * Esto permite mantener el historial para el resumen sin ocupar espacio
     * en la tabla principal de reservas activas.
     */
    @Scheduled(cron = "0 0 2 * * ?") // Se ejecuta todos los días a las 2:00 AM
    public void eliminarReservasPasadas() {
        try {
            // Calcular la fecha de hoy a las 00:00:00
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            Date fechaLimite = cal.getTime();

            // Obtener todos los negocios activos
            List<Negocio> negocios = negocioRepository.findByActivoTrue();
            
            int totalReservasArchivadas = 0;
            int totalReservasEliminadas = 0;

            System.out.println("═══════════════════════════════════════");
            System.out.println("🧹 Limpieza automática de reservas pasadas");
            System.out.println("📅 Fecha límite (hoy a las 00:00): " + fechaLimite);
            System.out.println("🏢 Procesando " + negocios.size() + " negocio(s)");

            for (Negocio negocio : negocios) {
                String negocioCodigo = negocio.getCodigo();
                
                // Obtener todas las reservas del negocio
                List<NegocioData.ReservaData> reservas = negocioDataService.getReservas(negocioCodigo);
                
                // Filtrar reservas con fecha anterior a hoy
                List<NegocioData.ReservaData> reservasAEliminar = reservas.stream()
                    .filter(r -> r.getFecha().before(fechaLimite))
                    .collect(Collectors.toList());

                if (!reservasAEliminar.isEmpty()) {
                    System.out.println("📊 Negocio: " + negocioCodigo + " - " + reservasAEliminar.size() + " reservas a archivar");

                    // Convertir reservas a reservas históricas
                    for (NegocioData.ReservaData reserva : reservasAEliminar) {
                        NegocioData.ReservaHistoricaData historica = new NegocioData.ReservaHistoricaData();
                        historica.setId(reserva.getId());
                        historica.setFecha(reserva.getFecha());
                        historica.setHora(reserva.getHora());
                        historica.setServicio(reserva.getServicio());
                        historica.setProfesional(reserva.getProfesional());
                        historica.setDuracionMinutos(reserva.getDuracionMinutos());
                        historica.setNotas(reserva.getNotas());
                        historica.setUsuarioEmail(reserva.getUsuarioEmail());
                        historica.setUsuarioNombre(reserva.getUsuarioNombre());
                        historica.setUsuarioApellido(reserva.getUsuarioApellido());
                        historica.setFechaCreacion(reserva.getFechaCreacion());
                        historica.setFechaArchivado(java.time.LocalDateTime.now());

                        // Agregar a reservas históricas
                        negocioDataService.addReservaHistorica(negocioCodigo, historica);
                        totalReservasArchivadas++;

                        // Eliminar de reservas activas
                        negocioDataService.removeReserva(negocioCodigo, reserva.getId());
                        totalReservasEliminadas++;

                        System.out.println("   - Reserva ID: " + reserva.getId() +
                                ", Fecha: " + reserva.getFecha() +
                                ", Hora: " + reserva.getHora() +
                                ", Usuario: " + reserva.getUsuarioEmail());
                    }
                }
            }

            System.out.println("✅ " + totalReservasArchivadas + " reservas archivadas en historial");
            System.out.println("✅ " + totalReservasEliminadas + " reservas eliminadas de colecciones activas");
            System.out.println("═══════════════════════════════════════");
            
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar reservas pasadas: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
