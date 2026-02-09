package com.maxturnos.service;

import com.maxturnos.model.Negocio;
import com.maxturnos.model.Reserva;
import com.maxturnos.model.NegocioData;
import com.maxturnos.util.ModelConverter;
import com.maxturnos.repository.NegocioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReservaService {
    
    private final NegocioDataService negocioDataService;
    private final NegocioRepository negocioRepository;
    private final HorarioBloqueadoService horarioBloqueadoService;
    
    public ReservaService(NegocioDataService negocioDataService,
                          NegocioRepository negocioRepository,
                          HorarioBloqueadoService horarioBloqueadoService) {
        this.negocioDataService = negocioDataService;
        this.negocioRepository = negocioRepository;
        this.horarioBloqueadoService = horarioBloqueadoService;
    }
    
    public List<String> calcularHorariosBloqueados(String horaInicio, Integer duracionMinutos, Integer intervalo) {
        List<String> horariosBloqueados = new ArrayList<>();
        String[] partes = horaInicio.split(":");
        int hora = Integer.parseInt(partes[0]);
        int minutos = Integer.parseInt(partes[1]);
        
        int inicioTotalMinutos = hora * 60 + minutos;
        int finTotalMinutos = inicioTotalMinutos + duracionMinutos;
        
        int currentMinutos = inicioTotalMinutos;
        while (currentMinutos < finTotalMinutos) {
            int horas = currentMinutos / 60;
            int mins = currentMinutos % 60;
            String horaFormateada = String.format("%02d:%02d", horas, mins);
            horariosBloqueados.add(horaFormateada);
            currentMinutos += intervalo;
        }
        
        return horariosBloqueados;
    }
    
    public List<String> generarHorariosDisponibles(String inicio, String fin, Integer intervalo) {
        List<String> horarios = new ArrayList<>();
        String[] partesInicio = inicio.split(":");
        String[] partesFin = fin.split(":");
        
        int inicioTotalMinutos = Integer.parseInt(partesInicio[0]) * 60 + Integer.parseInt(partesInicio[1]);
        int finTotalMinutos = Integer.parseInt(partesFin[0]) * 60 + Integer.parseInt(partesFin[1]);
        
        int currentMinutos = inicioTotalMinutos;
        while (currentMinutos <= finTotalMinutos) {
            int horas = currentMinutos / 60;
            int mins = currentMinutos % 60;
            String horaFormateada = String.format("%02d:%02d", horas, mins);
            horarios.add(horaFormateada);
            currentMinutos += intervalo;
        }
        
        return horarios;
    }
    
    public Integer parseDuration(String duration) {
        try {
            String number = duration.replaceAll("[^0-9]", "");
            return Integer.parseInt(number);
        } catch (Exception e) {
            return 0;
        }
    }
    
    @Transactional
    public Reserva crearReserva(Reserva reserva) {
        // Obtener configuración del negocio (global o desde NegocioData)
        Negocio negocio = negocioDataService.getNegocioConfig(reserva.getEstablecimiento());
        
        Integer intervalo = negocio.getHorarios().getIntervalo();
        
        // Buscar reservas existentes
        Calendar cal = Calendar.getInstance();
        cal.setTime(reserva.getFecha());
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date fechaInicio = cal.getTime();
        
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        Date fechaFin = cal.getTime();
        
        // Obtener reservas existentes del día para el profesional
        List<NegocioData.ReservaData> reservasData = negocioDataService.getReservas(reserva.getEstablecimiento());
        List<NegocioData.ReservaData> reservasExistentes = reservasData.stream()
            .filter(r -> {
                Calendar calReserva = Calendar.getInstance();
                calReserva.setTime(r.getFecha());
                return calReserva.get(Calendar.YEAR) == cal.get(Calendar.YEAR) &&
                       calReserva.get(Calendar.MONTH) == cal.get(Calendar.MONTH) &&
                       calReserva.get(Calendar.DAY_OF_MONTH) == cal.get(Calendar.DAY_OF_MONTH) &&
                       r.getProfesional() != null && 
                       r.getProfesional().getId().equals(reserva.getProfesional().getId());
            })
            .collect(Collectors.toList());
        
        // Verificar conflictos
        List<String> horariosBloqueados = calcularHorariosBloqueados(
            reserva.getHora(), 
            reserva.getDuracionMinutos(), 
            intervalo
        );
        
        for (NegocioData.ReservaData reservaExistente : reservasExistentes) {
            List<String> horariosReserva = calcularHorariosBloqueados(
                reservaExistente.getHora(),
                reservaExistente.getDuracionMinutos(),
                intervalo
            );
            
            boolean hayConflicto = horariosBloqueados.stream()
                .anyMatch(horariosReserva::contains);
            
            if (hayConflicto) {
                throw new RuntimeException("El horario seleccionado no está disponible para este profesional");
            }
        }
        
        // Convertir Reserva a ReservaData y guardar
        NegocioData.ReservaData reservaData = ModelConverter.reservaToReservaData(reserva);
        negocioDataService.addReserva(reserva.getEstablecimiento(), reservaData);
        
        // Convertir de vuelta a Reserva para mantener compatibilidad
        return ModelConverter.reservaDataToReserva(reservaData, reserva.getEstablecimiento());
    }
    
    public Map<String, Object> obtenerHorariosDisponibles(
            String establecimientoCodigo,
            Date fecha,
            Integer profesionalId,
            Integer duracionMinutos) {
        
        System.out.println("═══════════════════════════════════════");
        System.out.println("📅 Obteniendo horarios disponibles:");
        System.out.println("Código establecimiento: " + establecimientoCodigo);
        System.out.println("Fecha: " + fecha);
        System.out.println("Profesional ID: " + profesionalId);
        System.out.println("Duración minutos: " + duracionMinutos);
        
        Negocio negocio = negocioDataService.getNegocioConfig(establecimientoCodigo);
        
        System.out.println("✅ Config negocio cargada para: " + establecimientoCodigo + (negocio.getNombre() != null ? " (" + negocio.getNombre() + ")" : ""));
        System.out.println("Horarios: " + negocio.getHorarios().getInicio() + " - " + negocio.getHorarios().getFin());
        System.out.println("Intervalo: " + negocio.getHorarios().getIntervalo() + " minutos");
        System.out.println("Días disponibles: " + negocio.getDiasDisponibles());
        
        // Verificar que la fecha esté en los días disponibles
        Calendar calFecha = Calendar.getInstance();
        calFecha.setTime(fecha);
        int diaSemanaCalendar = calFecha.get(Calendar.DAY_OF_WEEK); // 1 = Domingo, 2 = Lunes, ..., 7 = Sábado
        // Convertir a formato 0-6 (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
        int diaSemana = diaSemanaCalendar == Calendar.SUNDAY ? 0 : diaSemanaCalendar - 1;
        
        System.out.println("Día de la semana (Calendar): " + diaSemanaCalendar + " (1=Domingo, 7=Sábado)");
        System.out.println("Día de la semana (formato 0-6): " + diaSemana + " (0=Domingo, 6=Sábado)");
        
        if (negocio.getDiasDisponibles() != null && !negocio.getDiasDisponibles().isEmpty()) {
            if (!negocio.getDiasDisponibles().contains(diaSemana)) {
                System.out.println("⚠️ El día " + diaSemana + " no está en días disponibles: " + negocio.getDiasDisponibles());
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("horariosDisponibles", new ArrayList<>());
                resultado.put("horariosBloqueados", new ArrayList<>());
                return resultado;
            }
        }
        
        Integer intervalo = negocio.getHorarios().getIntervalo();
        String inicio = negocio.getHorarios().getInicio();
        String fin = negocio.getHorarios().getFin();
        
        // Ajustar hora límite según el día de la semana
        // Sábado (6) hasta las 18:00, lunes a viernes (1-5) hasta las 20:00
        if (diaSemana == 6) { // Sábado
            fin = "18:00";
        } else if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
            fin = "20:00";
        }
        // Domingo (0) mantiene el valor por defecto (20:00)
        
        System.out.println("Hora límite ajustada según día de la semana: " + fin);
        
        // Obtener reservas existentes
        Calendar cal = Calendar.getInstance();
        cal.setTime(fecha);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date fechaInicio = cal.getTime();
        
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        Date fechaFin = cal.getTime();
        
        // Obtener reservas del día para el profesional
        List<NegocioData.ReservaData> reservasData = negocioDataService.getReservas(establecimientoCodigo);
        Calendar calFechaFiltro = Calendar.getInstance();
        calFechaFiltro.setTime(fecha);
        int añoFiltro = calFechaFiltro.get(Calendar.YEAR);
        int mesFiltro = calFechaFiltro.get(Calendar.MONTH);
        int diaFiltro = calFechaFiltro.get(Calendar.DAY_OF_MONTH);
        
        List<NegocioData.ReservaData> reservasDelDia = reservasData.stream()
            .filter(r -> {
                Calendar calReserva = Calendar.getInstance();
                calReserva.setTime(r.getFecha());
                boolean mismoDia = calReserva.get(Calendar.YEAR) == añoFiltro &&
                                  calReserva.get(Calendar.MONTH) == mesFiltro &&
                                  calReserva.get(Calendar.DAY_OF_MONTH) == diaFiltro;
                boolean mismoProfesional = r.getProfesional() != null && 
                                          r.getProfesional().getId().equals(profesionalId);
                return mismoDia && mismoProfesional;
            })
            .collect(Collectors.toList());
        
        System.out.println("📋 Reservas encontradas para el profesional " + profesionalId + ": " + reservasDelDia.size());
        for (NegocioData.ReservaData reserva : reservasDelDia) {
            System.out.println("   - Reserva ID: " + reserva.getId() + 
                             ", Fecha: " + reserva.getFecha() + 
                             ", Hora: " + reserva.getHora() + 
                             ", Duración: " + reserva.getDuracionMinutos() + " min" +
                             ", Profesional: " + (reserva.getProfesional() != null ? reserva.getProfesional().getId() : "null"));
        }
        
        // Convertir a Reserva para el procesamiento
        List<Reserva> reservas = reservasDelDia.stream()
            .map(r -> ModelConverter.reservaDataToReserva(r, establecimientoCodigo))
            .collect(Collectors.toList());
        
        // Generar todos los horarios posibles
        List<String> todosHorarios = generarHorariosDisponibles(inicio, fin, intervalo);
        
        // Convertir hora de cierre a minutos
        String[] partesFin = fin.split(":");
        int finTotalMinutos = Integer.parseInt(partesFin[0]) * 60 + Integer.parseInt(partesFin[1]);
        
        // Convertir reservas existentes a rangos de tiempo (en minutos desde medianoche)
        List<int[]> rangosReservas = new ArrayList<>();
        for (Reserva reserva : reservas) {
            String[] partesHora = reserva.getHora().split(":");
            int inicioReservaMinutos = Integer.parseInt(partesHora[0]) * 60 + Integer.parseInt(partesHora[1]);
            int finReservaMinutos = inicioReservaMinutos + reserva.getDuracionMinutos();
            rangosReservas.add(new int[]{inicioReservaMinutos, finReservaMinutos});
            System.out.println("   ⏰ Reserva " + reserva.getId() + " (" + reserva.getHora() + "): " + 
                             inicioReservaMinutos + " - " + finReservaMinutos + " minutos");
        }
        
        // Obtener horarios bloqueados manualmente
        List<String> horasBloqueadas = horarioBloqueadoService.obtenerHorasBloqueadas(
            establecimientoCodigo, fecha, profesionalId
        );
        System.out.println("🚫 Horarios bloqueados manualmente: " + horasBloqueadas.size());
        if (horasBloqueadas.size() > 0) {
            System.out.println("   Horas bloqueadas: " + horasBloqueadas);
        }
        
        // Filtrar horarios disponibles verificando solapamiento de rangos y horarios bloqueados
        List<String> horariosDisponibles = todosHorarios.stream()
            .filter(hora -> {
                // Verificar si el horario está bloqueado manualmente
                if (horasBloqueadas.contains(hora)) {
                    System.out.println("   ❌ Horario " + hora + " bloqueado manualmente");
                    return false;
                }
                
                String[] partes = hora.split(":");
                int inicioMinutos = Integer.parseInt(partes[0]) * 60 + Integer.parseInt(partes[1]);
                int finMinutos = inicioMinutos + duracionMinutos;
                
                // Verificar que no exceda el horario de cierre
                if (finMinutos > finTotalMinutos) {
                    return false;
                }
                
                // Verificar que no se solape con ninguna reserva existente
                // Dos rangos se solapan si: inicio1 < fin2 Y fin1 > inicio2
                for (int[] rangoReserva : rangosReservas) {
                    int inicioReserva = rangoReserva[0];
                    int finReserva = rangoReserva[1];
                    
                    // Verificar solapamiento: el nuevo servicio se solapa si:
                    // - Empieza antes de que termine la reserva Y
                    // - Termina después de que empiece la reserva
                    if (inicioMinutos < finReserva && finMinutos > inicioReserva) {
                        System.out.println("   ❌ Horario " + hora + " bloqueado por solapamiento con reserva " + 
                                         String.format("%02d:%02d", inicioReserva/60, inicioReserva%60) + 
                                         " - " + String.format("%02d:%02d", finReserva/60, finReserva%60));
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        // Calcular horarios bloqueados para el reporte (reservas + bloqueados manualmente)
        Set<String> horariosBloqueadosSet = new HashSet<>();
        for (Reserva reserva : reservas) {
            horariosBloqueadosSet.add(reserva.getHora());
        }
        // Agregar también los horarios bloqueados manualmente
        horariosBloqueadosSet.addAll(horasBloqueadas);
        
        System.out.println("Horarios disponibles después de filtrar: " + horariosDisponibles.size());
        System.out.println("Horarios bloqueados: " + horariosBloqueadosSet.size());
        if (horariosDisponibles.size() > 0) {
            System.out.println("Primeros horarios disponibles: " + horariosDisponibles.subList(0, Math.min(5, horariosDisponibles.size())));
        }
        System.out.println("═══════════════════════════════════════");
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("horariosDisponibles", horariosDisponibles);
        resultado.put("horariosBloqueados", new ArrayList<>(horariosBloqueadosSet));
        
        return resultado;
    }
    
    public List<Reserva> obtenerReservas(String establecimiento, Date fecha, Integer profesionalId) {
        if (fecha != null) {
            // Obtener reservas de un día específico
            // Extraer año, mes y día de la fecha recibida
            Calendar cal = Calendar.getInstance();
            cal.setTime(fecha);
            int año = cal.get(Calendar.YEAR);
            int mes = cal.get(Calendar.MONTH);
            int dia = cal.get(Calendar.DAY_OF_MONTH);
            
            System.out.println("═══════════════════════════════════════");
            System.out.println("🔍 Buscando reservas para el día:");
            System.out.println("Establecimiento: " + establecimiento);
            System.out.println("Fecha recibida: " + fecha);
            System.out.println("Año: " + año + ", Mes: " + (mes + 1) + ", Día: " + dia);
            
            // Obtener todas las reservas del establecimiento (activas e históricas)
            List<NegocioData.ReservaData> reservasData = negocioDataService.getReservas(establecimiento);
            List<NegocioData.ReservaHistoricaData> reservasHistoricasData = negocioDataService.getReservasHistoricas(establecimiento);
            
            // Filtrar por día y profesional
            List<NegocioData.ReservaData> reservasDelDiaData = reservasData.stream()
                .filter(reserva -> {
                    Calendar calReserva = Calendar.getInstance();
                    calReserva.setTime(reserva.getFecha());
                    boolean mismoDia = calReserva.get(Calendar.YEAR) == año &&
                                      calReserva.get(Calendar.MONTH) == mes &&
                                      calReserva.get(Calendar.DAY_OF_MONTH) == dia;
                    boolean mismoProfesional = profesionalId == null || 
                        (reserva.getProfesional() != null && reserva.getProfesional().getId().equals(profesionalId));
                    return mismoDia && mismoProfesional;
                })
                .collect(Collectors.toList());
            
            List<NegocioData.ReservaHistoricaData> reservasHistoricasDelDiaData = reservasHistoricasData.stream()
                .filter(reserva -> {
                    Calendar calReserva = Calendar.getInstance();
                    calReserva.setTime(reserva.getFecha());
                    boolean mismoDia = calReserva.get(Calendar.YEAR) == año &&
                                      calReserva.get(Calendar.MONTH) == mes &&
                                      calReserva.get(Calendar.DAY_OF_MONTH) == dia;
                    boolean mismoProfesional = profesionalId == null || 
                        (reserva.getProfesional() != null && reserva.getProfesional().getId().equals(profesionalId));
                    return mismoDia && mismoProfesional;
                })
                .collect(Collectors.toList());
            
            // Convertir a Reserva para mantener compatibilidad
            List<Reserva> reservasDelDia = reservasDelDiaData.stream()
                .map(r -> ModelConverter.reservaDataToReserva(r, establecimiento))
                .collect(Collectors.toList());
            
            List<Reserva> reservasHistoricasConvertidas = reservasHistoricasDelDiaData.stream()
                .map(r -> {
                    // Convertir ReservaHistoricaData a Reserva
                    Reserva reserva = new Reserva();
                    reserva.setId(r.getId());
                    reserva.setEstablecimiento(establecimiento);
                    reserva.setFecha(r.getFecha());
                    reserva.setHora(r.getHora());
                    reserva.setDuracionMinutos(r.getDuracionMinutos());
                    reserva.setNotas(r.getNotas());
                    reserva.setUsuarioEmail(r.getUsuarioEmail());
                    reserva.setUsuarioNombre(r.getUsuarioNombre());
                    reserva.setUsuarioApellido(r.getUsuarioApellido());
                    reserva.setFechaCreacion(r.getFechaCreacion());
                    if (r.getServicio() != null) {
                        reserva.setServicio(new Reserva.ServicioInfo(
                            r.getServicio().getId(), r.getServicio().getName(),
                            r.getServicio().getDuration(), r.getServicio().getPrice()));
                    }
                    if (r.getProfesional() != null) {
                        reserva.setProfesional(new Reserva.ProfesionalInfo(
                            r.getProfesional().getId(), r.getProfesional().getName()));
                    }
                    return reserva;
                })
                .collect(Collectors.toList());
            
            // Combinar reservas activas e históricas
            reservasDelDia.addAll(reservasHistoricasConvertidas);
            
            System.out.println("Reservas activas encontradas: " + (reservasDelDia.size() - reservasHistoricasConvertidas.size()));
            System.out.println("Reservas históricas encontradas: " + reservasHistoricasConvertidas.size());
            System.out.println("Total reservas: " + reservasDelDia.size());
            for (Reserva r : reservasDelDia) {
                Calendar calReserva = Calendar.getInstance();
                calReserva.setTime(r.getFecha());
                System.out.println("  - Reserva ID: " + r.getId() + 
                    ", Fecha almacenada: " + r.getFecha() + 
                    ", Año: " + calReserva.get(Calendar.YEAR) + 
                    ", Mes: " + (calReserva.get(Calendar.MONTH) + 1) + 
                    ", Día: " + calReserva.get(Calendar.DAY_OF_MONTH) + 
                    ", Hora: " + r.getHora());
            }
            System.out.println("═══════════════════════════════════════");
            
            return reservasDelDia;
        } else if (profesionalId != null) {
            // Obtener todas las reservas de un profesional
            List<NegocioData.ReservaData> reservasData = negocioDataService.getReservas(establecimiento);
            return reservasData.stream()
                .filter(r -> r.getProfesional() != null && r.getProfesional().getId().equals(profesionalId))
                .map(r -> ModelConverter.reservaDataToReserva(r, establecimiento))
                .collect(Collectors.toList());
        } else {
            // Obtener todas las reservas del establecimiento
            List<NegocioData.ReservaData> reservasData = negocioDataService.getReservas(establecimiento);
            return reservasData.stream()
                .map(r -> ModelConverter.reservaDataToReserva(r, establecimiento))
                .collect(Collectors.toList());
        }
    }
    
    public Map<String, Object> obtenerReservasPorMes(String establecimiento, Integer año, Integer mes) {
        // Crear calendario para el primer día del mes
        Calendar calInicio = Calendar.getInstance();
        calInicio.set(año, mes - 1, 1, 0, 0, 0);
        calInicio.set(Calendar.MILLISECOND, 0);
        Date fechaInicio = calInicio.getTime();
        
        // Crear calendario para el último día del mes
        Calendar calFin = Calendar.getInstance();
        calFin.set(año, mes - 1, calInicio.getActualMaximum(Calendar.DAY_OF_MONTH), 23, 59, 59);
        calFin.set(Calendar.MILLISECOND, 999);
        Date fechaFin = calFin.getTime();
        
        // Obtener todas las reservas del mes (activas e históricas)
        List<NegocioData.ReservaData> reservasData = negocioDataService.getReservas(establecimiento);
        List<NegocioData.ReservaHistoricaData> reservasHistoricasData = negocioDataService.getReservasHistoricas(establecimiento);
        
        // Filtrar por rango de fechas
        List<NegocioData.ReservaData> reservasDelMesData = reservasData.stream()
            .filter(r -> !r.getFecha().before(fechaInicio) && !r.getFecha().after(fechaFin))
            .collect(Collectors.toList());
        
        List<NegocioData.ReservaHistoricaData> reservasHistoricasDelMesData = reservasHistoricasData.stream()
            .filter(r -> !r.getFecha().before(fechaInicio) && !r.getFecha().after(fechaFin))
            .collect(Collectors.toList());
        
        // Convertir a Reserva para mantener compatibilidad
        List<Reserva> reservas = reservasDelMesData.stream()
            .map(r -> ModelConverter.reservaDataToReserva(r, establecimiento))
            .collect(Collectors.toList());
        
        List<Reserva> reservasHistoricasConvertidas = reservasHistoricasDelMesData.stream()
            .map(r -> {
                Reserva reserva = new Reserva();
                reserva.setId(r.getId());
                reserva.setEstablecimiento(establecimiento);
                reserva.setFecha(r.getFecha());
                reserva.setHora(r.getHora());
                reserva.setDuracionMinutos(r.getDuracionMinutos());
                reserva.setNotas(r.getNotas());
                reserva.setUsuarioEmail(r.getUsuarioEmail());
                reserva.setUsuarioNombre(r.getUsuarioNombre());
                reserva.setUsuarioApellido(r.getUsuarioApellido());
                reserva.setFechaCreacion(r.getFechaCreacion());
                if (r.getServicio() != null) {
                    reserva.setServicio(new Reserva.ServicioInfo(
                        r.getServicio().getId(), r.getServicio().getName(),
                        r.getServicio().getDuration(), r.getServicio().getPrice()));
                }
                if (r.getProfesional() != null) {
                    reserva.setProfesional(new Reserva.ProfesionalInfo(
                        r.getProfesional().getId(), r.getProfesional().getName()));
                }
                return reserva;
            })
            .collect(Collectors.toList());
        
        // Combinar reservas activas e históricas
        reservas.addAll(reservasHistoricasConvertidas);
        
        // Contar reservas por día
        Map<String, Integer> contadoresPorDia = new HashMap<>();
        for (Reserva reserva : reservas) {
            Calendar calReserva = Calendar.getInstance();
            calReserva.setTime(reserva.getFecha());
            
            // Asegurarse de usar la zona horaria local correctamente
            // Extraer año, mes y día de forma explícita
            int añoReserva = calReserva.get(Calendar.YEAR);
            int mesReserva = calReserva.get(Calendar.MONTH) + 1; // Calendar.MONTH es 0-based
            int diaReserva = calReserva.get(Calendar.DAY_OF_MONTH);
            
            String claveDia = String.format("%04d-%02d-%02d", añoReserva, mesReserva, diaReserva);
            
            System.out.println("📊 Contando reserva - Fecha almacenada: " + reserva.getFecha() + 
                ", Clave día: " + claveDia + 
                " (Año: " + añoReserva + ", Mes: " + mesReserva + ", Día: " + diaReserva + ")");
            
            contadoresPorDia.put(claveDia, contadoresPorDia.getOrDefault(claveDia, 0) + 1);
        }
        
        System.out.println("📊 Contadores por día: " + contadoresPorDia);
        System.out.println("📊 Total reservas (activas + históricas): " + reservas.size());
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("contadoresPorDia", contadoresPorDia);
        resultado.put("totalReservas", reservas.size());
        resultado.put("reservas", reservas);
        
        return resultado;
    }
    
}

