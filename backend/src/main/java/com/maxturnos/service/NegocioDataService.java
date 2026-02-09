package com.maxturnos.service;

import com.maxturnos.model.Negocio;
import com.maxturnos.model.NegocioData;
import com.maxturnos.repository.NegocioDataRepository;
import com.maxturnos.repository.NegocioRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio helper para trabajar con NegocioData.
 * Facilita las operaciones comunes sobre los datos de un negocio.
 */
@Service
public class NegocioDataService {
    
    private final NegocioDataRepository negocioDataRepository;
    private final NegocioRepository negocioRepository;
    
    public NegocioDataService(NegocioDataRepository negocioDataRepository, NegocioRepository negocioRepository) {
        this.negocioDataRepository = negocioDataRepository;
        this.negocioRepository = negocioRepository;
    }
    
    /**
     * Obtiene o crea el documento de datos del negocio.
     */
    public NegocioData getOrCreate(String negocioCodigo) {
        return negocioDataRepository.getOrCreate(negocioCodigo);
    }
    
    /**
     * Obtiene el documento de datos del negocio.
     */
    public Optional<NegocioData> get(String negocioCodigo) {
        return negocioDataRepository.findById(negocioCodigo);
    }
    
    /**
     * Guarda el documento de datos del negocio.
     */
    public NegocioData save(String negocioCodigo, NegocioData data) {
        return negocioDataRepository.save(negocioCodigo, data);
    }
    
    // ========== MÉTODOS PARA RESERVAS ==========
    
    public List<NegocioData.ReservaData> getReservas(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getReservas();
    }
    
    public void addReserva(String negocioCodigo, NegocioData.ReservaData reserva) {
        if (reserva.getId() == null || reserva.getId().isEmpty()) {
            reserva.setId(UUID.randomUUID().toString());
        }
        negocioDataRepository.pushToArray(negocioCodigo, "reservas", reserva);
    }
    
    public void removeReserva(String negocioCodigo, String reservaId) {
        negocioDataRepository.removeArrayElement(negocioCodigo, "reservas", "id", reservaId);
    }
    
    public void updateReserva(String negocioCodigo, String reservaId, String field, Object value) {
        negocioDataRepository.updateArrayElement(negocioCodigo, "reservas", "id", reservaId, field, value);
    }
    
    // ========== MÉTODOS PARA RESERVAS HISTÓRICAS ==========
    
    public List<NegocioData.ReservaHistoricaData> getReservasHistoricas(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getReservasHistoricas();
    }
    
    public void addReservaHistorica(String negocioCodigo, NegocioData.ReservaHistoricaData reserva) {
        if (reserva.getId() == null || reserva.getId().isEmpty()) {
            reserva.setId(UUID.randomUUID().toString());
        }
        negocioDataRepository.pushToArray(negocioCodigo, "reservasHistoricas", reserva);
    }
    
    // ========== MÉTODOS PARA RESEÑAS ==========
    
    public List<NegocioData.ResenaData> getResenas(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getResenas();
    }
    
    public void addResena(String negocioCodigo, NegocioData.ResenaData resena) {
        if (resena.getId() == null || resena.getId().isEmpty()) {
            resena.setId(UUID.randomUUID().toString());
        }
        negocioDataRepository.pushToArray(negocioCodigo, "resenas", resena);
    }
    
    public void removeResena(String negocioCodigo, String resenaId) {
        negocioDataRepository.removeArrayElement(negocioCodigo, "resenas", "id", resenaId);
    }
    
    public void updateResena(String negocioCodigo, String resenaId, String field, Object value) {
        negocioDataRepository.updateArrayElement(negocioCodigo, "resenas", "id", resenaId, field, value);
    }
    
    // ========== MÉTODOS PARA DÍAS CANCELADOS ==========
    
    public List<NegocioData.DiaCanceladoData> getDiasCancelados(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getDiasCancelados();
    }
    
    public void addDiaCancelado(String negocioCodigo, NegocioData.DiaCanceladoData diaCancelado) {
        if (diaCancelado.getId() == null || diaCancelado.getId().isEmpty()) {
            diaCancelado.setId(UUID.randomUUID().toString());
        }
        negocioDataRepository.pushToArray(negocioCodigo, "diasCancelados", diaCancelado);
    }
    
    public void removeDiaCancelado(String negocioCodigo, String diaCanceladoId) {
        negocioDataRepository.removeArrayElement(negocioCodigo, "diasCancelados", "id", diaCanceladoId);
    }
    
    // ========== MÉTODOS PARA HORARIOS BLOQUEADOS ==========
    
    public List<NegocioData.HorarioBloqueadoData> getHorariosBloqueados(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getHorariosBloqueados();
    }
    
    public void addHorarioBloqueado(String negocioCodigo, NegocioData.HorarioBloqueadoData horario) {
        if (horario.getId() == null || horario.getId().isEmpty()) {
            horario.setId(UUID.randomUUID().toString());
        }
        negocioDataRepository.pushToArray(negocioCodigo, "horariosBloqueados", horario);
    }
    
    public void removeHorarioBloqueado(String negocioCodigo, String horarioId) {
        negocioDataRepository.removeArrayElement(negocioCodigo, "horariosBloqueados", "id", horarioId);
    }
    
    // ========== MÉTODOS PARA PERSONAL ==========
    
    public List<NegocioData.PersonalData> getPersonal(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getPersonal();
    }
    
    public void addPersonal(String negocioCodigo, NegocioData.PersonalData personal) {
        if (personal.getId() == null || personal.getId().isEmpty()) {
            personal.setId(UUID.randomUUID().toString());
        }
        negocioDataRepository.pushToArray(negocioCodigo, "personal", personal);
    }
    
    public void removePersonal(String negocioCodigo, String personalId) {
        negocioDataRepository.removeArrayElement(negocioCodigo, "personal", "id", personalId);
    }
    
    public void updatePersonal(String negocioCodigo, String personalId, String field, Object value) {
        negocioDataRepository.updateArrayElement(negocioCodigo, "personal", "id", personalId, field, value);
    }
    
    /**
     * Reordena el personal según la lista de idPersonal (orden de visualización).
     */
    public void reordenarPersonal(String negocioCodigo, List<Integer> idsPersonalEnOrden) {
        List<NegocioData.PersonalData> actuales = getPersonal(negocioCodigo);
        if (actuales == null || actuales.isEmpty() || idsPersonalEnOrden == null || idsPersonalEnOrden.isEmpty()) {
            return;
        }
        java.util.Map<Integer, NegocioData.PersonalData> porIdPersonal = new java.util.HashMap<>();
        for (NegocioData.PersonalData p : actuales) {
            if (p.getIdPersonal() != null) {
                porIdPersonal.put(p.getIdPersonal(), p);
            }
        }
        List<NegocioData.PersonalData> ordenados = new java.util.ArrayList<>();
        for (Integer idPers : idsPersonalEnOrden) {
            NegocioData.PersonalData p = porIdPersonal.get(idPers);
            if (p != null) {
                ordenados.add(p);
            }
        }
        for (NegocioData.PersonalData p : actuales) {
            if (!idsPersonalEnOrden.contains(p.getIdPersonal())) {
                ordenados.add(p);
            }
        }
        negocioDataRepository.replaceArray(negocioCodigo, "personal", ordenados);
    }
    
    // ========== MÉTODOS PARA SERVICIOS ==========
    
    public List<NegocioData.ServicioData> getServicios(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getServicios();
    }
    
    public void addServicio(String negocioCodigo, NegocioData.ServicioData servicio) {
        if (servicio.getId() == null || servicio.getId().isEmpty()) {
            servicio.setId(UUID.randomUUID().toString());
        }
        negocioDataRepository.pushToArray(negocioCodigo, "servicios", servicio);
    }
    
    public void removeServicio(String negocioCodigo, String servicioId) {
        negocioDataRepository.removeArrayElement(negocioCodigo, "servicios", "id", servicioId);
    }
    
    public void updateServicio(String negocioCodigo, String servicioId, String field, Object value) {
        negocioDataRepository.updateArrayElement(negocioCodigo, "servicios", "id", servicioId, field, value);
    }
    
    /**
     * Reordena los servicios según la lista de idServicio (orden de visualización).
     */
    public void reordenarServicios(String negocioCodigo, List<Integer> idsServicioEnOrden) {
        List<NegocioData.ServicioData> actuales = getServicios(negocioCodigo);
        if (actuales == null || actuales.isEmpty() || idsServicioEnOrden == null || idsServicioEnOrden.isEmpty()) {
            return;
        }
        java.util.Map<Integer, NegocioData.ServicioData> porIdServicio = new java.util.HashMap<>();
        for (NegocioData.ServicioData s : actuales) {
            if (s.getIdServicio() != null) {
                porIdServicio.put(s.getIdServicio(), s);
            }
        }
        List<NegocioData.ServicioData> ordenados = new java.util.ArrayList<>();
        for (Integer idServ : idsServicioEnOrden) {
            NegocioData.ServicioData s = porIdServicio.get(idServ);
            if (s != null) {
                ordenados.add(s);
            }
        }
        for (NegocioData.ServicioData s : actuales) {
            if (!idsServicioEnOrden.contains(s.getIdServicio())) {
                ordenados.add(s);
            }
        }
        negocioDataRepository.replaceArray(negocioCodigo, "servicios", ordenados);
    }
    
    // ========== MÉTODOS PARA CATEGORÍAS ==========
    
    public List<String> getCategorias(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        return data.getCategorias() != null ? data.getCategorias() : new java.util.ArrayList<>();
    }
    
    public void setCategorias(String negocioCodigo, List<String> categorias) {
        NegocioData data = getOrCreate(negocioCodigo);
        data.setCategorias(categorias != null ? categorias : new java.util.ArrayList<>());
        negocioDataRepository.save(negocioCodigo, data);
    }
    
    // ========== MÉTODOS PARA HORARIOS (inicio/fin/intervalo) ==========
    
    public Negocio.HorariosConfig getHorarios(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        NegocioData.HorariosConfigData h = data.getHorarios();
        if (h == null) {
            h = new NegocioData.HorariosConfigData();
        }
        return new Negocio.HorariosConfig(
            h.getInicio() != null ? h.getInicio() : "09:00",
            h.getFin() != null ? h.getFin() : "20:00",
            h.getIntervalo() != null ? h.getIntervalo() : 30
        );
    }
    
    public void setHorarios(String negocioCodigo, Negocio.HorariosConfig horarios) {
        NegocioData data = getOrCreate(negocioCodigo);
        NegocioData.HorariosConfigData h = new NegocioData.HorariosConfigData();
        h.setInicio(horarios != null && horarios.getInicio() != null ? horarios.getInicio() : "09:00");
        h.setFin(horarios != null && horarios.getFin() != null ? horarios.getFin() : "20:00");
        h.setIntervalo(horarios != null && horarios.getIntervalo() != null ? horarios.getIntervalo() : 30);
        data.setHorarios(h);
        negocioDataRepository.save(negocioCodigo, data);
    }
    
    /**
     * Obtiene la configuración del negocio: desde la colección global o, si no existe,
     * construye una desde NegocioData (para negocios como barberia_clasica).
     */
    public Negocio getNegocioConfig(String codigo) {
        String codigoLower = codigo.toLowerCase();
        Optional<Negocio> opt = negocioRepository.findByCodigoAndActivoTrue(codigoLower);
        if (opt.isPresent()) {
            Negocio negocio = opt.get();
            if (negocio.getHorarios() == null && negocioDataRepository.findById(codigoLower).isPresent()) {
                negocio.setHorarios(getHorarios(codigoLower));
            }
            return negocio;
        }
        NegocioData data = getOrCreate(codigoLower);
        Negocio n = new Negocio();
        n.setCodigo(codigoLower);
        n.setHorarios(getHorarios(codigoLower));
        n.setCategorias(getCategorias(codigoLower));
        n.setDiasDisponibles(data.getDiasDisponibles() != null && !data.getDiasDisponibles().isEmpty()
            ? data.getDiasDisponibles()
            : Arrays.asList(1, 2, 3, 4, 5, 6));
        return n;
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    /**
     * Obtiene el siguiente ID disponible para personal
     */
    public Integer obtenerSiguienteIdPersonal(String negocioCodigo) {
        List<NegocioData.PersonalData> personal = getPersonal(negocioCodigo).stream()
            .filter(p -> p.getActivo() != null && p.getActivo())
            .collect(java.util.stream.Collectors.toList());
        if (personal.isEmpty()) {
            return 1;
        }
        return personal.stream()
            .mapToInt(NegocioData.PersonalData::getIdPersonal)
            .max()
            .orElse(0) + 1;
    }
    
    /**
     * Obtiene el siguiente ID disponible para servicios
     */
    public Integer obtenerSiguienteIdServicio(String negocioCodigo) {
        List<NegocioData.ServicioData> servicios = getServicios(negocioCodigo).stream()
            .filter(s -> s.getActivo() != null && s.getActivo())
            .collect(java.util.stream.Collectors.toList());
        if (servicios.isEmpty()) {
            return 1;
        }
        return servicios.stream()
            .mapToInt(NegocioData.ServicioData::getIdServicio)
            .max()
            .orElse(0) + 1;
    }
    
    /**
     * Busca personal por idPersonal
     */
    public Optional<NegocioData.PersonalData> findPersonalByIdPersonal(String negocioCodigo, Integer idPersonal) {
        return getPersonal(negocioCodigo).stream()
            .filter(p -> p.getIdPersonal().equals(idPersonal))
            .findFirst();
    }
    
    /**
     * Busca servicio por idServicio
     */
    public Optional<NegocioData.ServicioData> findServicioByIdServicio(String negocioCodigo, Integer idServicio) {
        return getServicios(negocioCodigo).stream()
            .filter(s -> s.getIdServicio().equals(idServicio))
            .findFirst();
    }
    
    /**
     * Obtiene todas las reservas de un profesional
     */
    public List<NegocioData.ReservaData> getReservasByProfesional(String negocioCodigo, Integer profesionalId) {
        return getReservas(negocioCodigo).stream()
            .filter(r -> r.getProfesional() != null && r.getProfesional().getId().equals(profesionalId))
            .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Obtiene todas las reservas de un servicio
     */
    public List<NegocioData.ReservaData> getReservasByServicio(String negocioCodigo, Integer servicioId) {
        return getReservas(negocioCodigo).stream()
            .filter(r -> r.getServicio() != null && r.getServicio().getId().equals(servicioId))
            .collect(java.util.stream.Collectors.toList());
    }
}
