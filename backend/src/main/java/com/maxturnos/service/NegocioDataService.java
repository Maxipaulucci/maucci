package com.maxturnos.service;

import com.maxturnos.dto.LocalAdheridoDTO;
import com.maxturnos.model.Negocio;
import com.maxturnos.model.NegocioData;
import com.maxturnos.repository.NegocioDataRepository;
import com.maxturnos.repository.NegocioRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
    private final MongoTemplate mongoTemplate;
    
    public NegocioDataService(NegocioDataRepository negocioDataRepository,
                              NegocioRepository negocioRepository,
                              MongoTemplate mongoTemplate) {
        this.negocioDataRepository = negocioDataRepository;
        this.negocioRepository = negocioRepository;
        this.mongoTemplate = mongoTemplate;
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
     * Actualiza un miembro del personal reemplazando el array completo (persiste todos los campos incluido tituloCertificado).
     */
    public void updatePersonalCompleto(String negocioCodigo, Integer idPersonal,
            String nombre, String rol, String avatar, List<String> specialties, String tituloCertificado) {
        List<NegocioData.PersonalData> lista = getPersonal(negocioCodigo);
        if (lista == null) return;
        for (NegocioData.PersonalData p : lista) {
            if (idPersonal.equals(p.getIdPersonal())) {
                p.setNombre(nombre);
                p.setRol(rol);
                p.setAvatar(avatar);
                p.setSpecialties(specialties != null ? specialties : new ArrayList<>());
                p.setTituloCertificado(tituloCertificado);
                break;
            }
        }
        negocioDataRepository.replaceArray(negocioCodigo, "personal", lista);
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

    public List<NegocioData.BloqueHorarioData> getBloquesHorario(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo);
        List<NegocioData.BloqueHorarioData> list = data.getBloquesHorario();
        return list != null ? list : new ArrayList<>();
    }

    public void setBloquesHorario(String negocioCodigo, List<Negocio.BloqueHorario> bloques) {
        NegocioData data = getOrCreate(negocioCodigo);
        List<NegocioData.BloqueHorarioData> list = new ArrayList<>();
        if (bloques != null) {
            for (Negocio.BloqueHorario b : bloques) {
                NegocioData.BloqueHorarioData d = new NegocioData.BloqueHorarioData();
                d.setId(b.getId());
                d.setDias(b.getDias() != null ? new ArrayList<>(b.getDias()) : new ArrayList<>());
                d.setInicio(b.getInicio() != null ? b.getInicio() : "09:00");
                d.setFin(b.getFin() != null ? b.getFin() : "20:00");
                d.setIntervalo(b.getIntervalo() != null ? b.getIntervalo() : 30);
                list.add(d);
            }
        }
        data.setBloquesHorario(list);
        negocioDataRepository.save(negocioCodigo, data);
    }

    public void setDiasDisponibles(String negocioCodigo, List<Integer> diasDisponibles) {
        NegocioData data = getOrCreate(negocioCodigo);
        data.setDiasDisponibles(diasDisponibles != null ? diasDisponibles : new ArrayList<>());
        negocioDataRepository.save(negocioCodigo, data);
    }

    public void setOrdenResenas(String negocioCodigo, String ordenResenas) {
        NegocioData data = getOrCreate(negocioCodigo);
        data.setOrdenResenas(ordenResenas != null ? ordenResenas : "reciente-antigua");
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
            Optional<NegocioData> dataOpt = negocioDataRepository.findById(codigoLower);
            if (dataOpt.isPresent()) {
                NegocioData data = dataOpt.get();
                if (negocio.getHorarios() == null) {
                    negocio.setHorarios(getHorarios(codigoLower));
                }
                // Siempre devolver los días disponibles y orden de reseñas definidos en el panel (NegocioData)
                List<Integer> dias = data.getDiasDisponibles();
                negocio.setDiasDisponibles(dias != null && !dias.isEmpty()
                    ? dias
                    : Arrays.asList(1, 2, 3, 4, 5, 6));
                String orden = data.getOrdenResenas();
                negocio.setOrdenResenas(orden != null && !orden.isEmpty() ? orden : "reciente-antigua");
                aplicarConfigPagoPublica(negocio, data);
            } else {
                aplicarConfigPagoPublica(negocio, null);
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
        n.setOrdenResenas(data.getOrdenResenas() != null && !data.getOrdenResenas().isEmpty() ? data.getOrdenResenas() : "reciente-antigua");
        List<NegocioData.BloqueHorarioData> bloquesData = data.getBloquesHorario();
        List<Negocio.BloqueHorario> bloques = new ArrayList<>();
        if (bloquesData != null) {
            for (NegocioData.BloqueHorarioData b : bloquesData) {
                Negocio.BloqueHorario bh = new Negocio.BloqueHorario();
                bh.setId(b.getId());
                bh.setDias(b.getDias() != null ? new ArrayList<>(b.getDias()) : new ArrayList<>());
                bh.setInicio(b.getInicio());
                bh.setFin(b.getFin());
                bh.setIntervalo(b.getIntervalo());
                bloques.add(bh);
            }
        }
        n.setBloquesHorario(bloques);
        aplicarConfigPagoPublica(n, data);
        return n;
    }

    public void aplicarConfigPagoPublica(Negocio negocio, NegocioData data) {
        String metodo = resolveMetodoPago(data);
        negocio.setMetodoPago(metodo);

        boolean transferenciaOk = isTransferenciaConfigurada(data);
        boolean mpOk = isMercadoPagoConfigurado(data);

        if ("TRANSFERENCIA".equals(metodo) && transferenciaOk) {
            Negocio.PagoTransferenciaInfo info = new Negocio.PagoTransferenciaInfo();
            info.setAlias(data.getPagoAlias().trim());
            info.setCvuCbu(data.getPagoCvuCbu().trim());
            info.setTitular(data.getPagoTitular().trim());
            negocio.setPagoTransferencia(info);
            negocio.setPagoHabilitado(true);
            negocio.setMercadoPagoHabilitado(false);
        } else if ("MERCADO_PAGO".equals(metodo) && mpOk) {
            negocio.setPagoTransferencia(null);
            negocio.setPagoHabilitado(true);
            negocio.setMercadoPagoHabilitado(true);
        } else {
            negocio.setPagoTransferencia(null);
            negocio.setPagoHabilitado(false);
            negocio.setMercadoPagoHabilitado(false);
        }
    }

    public String resolveMetodoPago(NegocioData data) {
        if (data == null) {
            return "NINGUNO";
        }
        String metodo = data.getMetodoPago();
        if (metodo != null && !metodo.trim().isEmpty()) {
            return metodo.trim().toUpperCase();
        }
        // Compatibilidad: si ya había token de MP y no eligió método, asumir MP
        if (isMercadoPagoConfigurado(data)) {
            return "MERCADO_PAGO";
        }
        return "NINGUNO";
    }

    public boolean isTransferenciaConfigurada(NegocioData data) {
        if (data == null) {
            return false;
        }
        return notBlank(data.getPagoAlias())
            && notBlank(data.getPagoCvuCbu())
            && notBlank(data.getPagoTitular());
    }

    public boolean isMercadoPagoConfigurado(String negocioCodigo) {
        return findMercadoPagoAccessToken(negocioCodigo).isPresent();
    }

    public boolean isMercadoPagoConfigurado(NegocioData data) {
        String token = data != null ? data.getMercadoPagoAccessToken() : null;
        return token != null && !token.trim().isEmpty();
    }

    public Optional<String> findMercadoPagoAccessToken(String negocioCodigo) {
        return negocioDataRepository.findById(negocioCodigo.toLowerCase())
            .map(NegocioData::getMercadoPagoAccessToken)
            .filter(token -> token != null && !token.trim().isEmpty())
            .map(String::trim);
    }

    public void setMercadoPagoAccessToken(String negocioCodigo, String accessToken) {
        String codigo = negocioCodigo.toLowerCase();
        getOrCreate(codigo);
        String value = accessToken != null ? accessToken.trim() : "";
        negocioDataRepository.updateField(codigo, "mercadoPagoAccessToken", value);
    }

    public Map<String, Object> getConfigPagoPanel(String negocioCodigo) {
        NegocioData data = getOrCreate(negocioCodigo.toLowerCase());
        String metodo = resolveMetodoPago(data);
        Map<String, Object> result = new HashMap<>();
        result.put("metodoPago", metodo);
        result.put("alias", data.getPagoAlias() != null ? data.getPagoAlias() : "");
        result.put("cvuCbu", data.getPagoCvuCbu() != null ? data.getPagoCvuCbu() : "");
        result.put("titular", data.getPagoTitular() != null ? data.getPagoTitular() : "");
        result.put("transferenciaConfigurada", isTransferenciaConfigurada(data));
        result.put("mercadoPagoConfigurado", isMercadoPagoConfigurado(data));
        result.put("pagoHabilitado",
            ("TRANSFERENCIA".equals(metodo) && isTransferenciaConfigurada(data))
                || ("MERCADO_PAGO".equals(metodo) && isMercadoPagoConfigurado(data)));
        return result;
    }

    public Map<String, Object> setConfigPagoPanel(String negocioCodigo, String metodoPago,
                                                   String alias, String cvuCbu, String titular) {
        String codigo = negocioCodigo.toLowerCase();
        getOrCreate(codigo);

        String metodo = metodoPago != null ? metodoPago.trim().toUpperCase() : "NINGUNO";
        if (!Set.of("NINGUNO", "TRANSFERENCIA", "MERCADO_PAGO").contains(metodo)) {
            throw new IllegalArgumentException("Método de pago inválido");
        }

        negocioDataRepository.updateField(codigo, "metodoPago", metodo);

        if ("TRANSFERENCIA".equals(metodo) || alias != null || cvuCbu != null || titular != null) {
            if (alias != null) {
                negocioDataRepository.updateField(codigo, "pagoAlias", alias.trim());
            }
            if (cvuCbu != null) {
                negocioDataRepository.updateField(codigo, "pagoCvuCbu", cvuCbu.trim());
            }
            if (titular != null) {
                negocioDataRepository.updateField(codigo, "pagoTitular", titular.trim());
            }
        }

        if ("TRANSFERENCIA".equals(metodo) && !isTransferenciaConfigurada(getOrCreate(codigo))) {
            throw new IllegalArgumentException("Completá alias, CVU/CBU y nombre del titular para activar transferencia");
        }
        if ("MERCADO_PAGO".equals(metodo) && !isMercadoPagoConfigurado(codigo)) {
            throw new IllegalArgumentException("Configurá el Access Token de Mercado Pago antes de activar ese método");
        }

        return getConfigPagoPanel(codigo);
    }

    private static boolean notBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public Optional<NegocioData.ServicioData> findServicioById(String negocioCodigo, Integer idServicio) {
        if (idServicio == null) {
            return Optional.empty();
        }
        return getServicios(negocioCodigo.toLowerCase()).stream()
            .filter(s -> s.getActivo() == null || Boolean.TRUE.equals(s.getActivo()))
            .filter(s -> idServicio.equals(s.getIdServicio()))
            .findFirst();
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

    /**
     * Lista negocios visibles para la página de Locales Adheridos y enlaces públicos.
     */
    public List<LocalAdheridoDTO> listLocalesAdheridosPublicos() {
        Set<String> excluir = new HashSet<>(Arrays.asList("usuario", "negocios"));
        List<String> codigos = new ArrayList<>();
        for (String name : mongoTemplate.getCollectionNames()) {
            if (!excluir.contains(name)) {
                codigos.add(name);
            }
        }
        codigos.sort(String::compareToIgnoreCase);

        List<LocalAdheridoDTO> locales = new ArrayList<>();
        for (String codigo : codigos) {
            Optional<NegocioData> dataOpt = negocioDataRepository.findById(codigo);
            NegocioData.PerfilPublicoData perfil = dataOpt.map(NegocioData::getPerfilPublico).orElse(null);
            if (perfil != null && Boolean.FALSE.equals(perfil.getVisibleEnLocalesAdheridos())) {
                continue;
            }

            List<NegocioData.ResenaData> resenas = dataOpt.map(NegocioData::getResenas).orElse(new ArrayList<>());
            List<NegocioData.ResenaData> aprobadas = resenas.stream()
                .filter(r -> Boolean.TRUE.equals(r.getAprobada()))
                .collect(Collectors.toList());

            double rating = 0;
            if (!aprobadas.isEmpty()) {
                rating = aprobadas.stream()
                    .mapToInt(r -> r.getRating() != null ? r.getRating() : 0)
                    .average()
                    .orElse(0);
            }

            Negocio negocioGlobal = negocioRepository.findByCodigoAndActivoTrue(codigo).orElse(null);
            String nombre = resolverNombrePublico(codigo, perfil, negocioGlobal);
            String horarios = formatearHorariosPublicos(getHorarios(codigo));

            LocalAdheridoDTO dto = new LocalAdheridoDTO();
            dto.setCodigo(codigo);
            dto.setNombre(nombre);
            dto.setCategoria(perfil != null && perfil.getCategoria() != null ? perfil.getCategoria() : "Negocio");
            dto.setDescripcion(perfil != null ? perfil.getDescripcion() : null);
            dto.setDireccion(perfil != null ? perfil.getDireccion() : null);
            dto.setTelefono(perfil != null ? perfil.getTelefono() : null);
            dto.setRating(Math.round(rating * 10.0) / 10.0);
            dto.setReviewCount(aprobadas.size());
            dto.setHorarios(horarios);
            dto.setImagen(resolverImagenPortada(codigo, perfil));
            dto.setWebsite("/local/" + codigo);
            locales.add(dto);
        }
        return locales;
    }

    private String resolverNombrePublico(String codigo, NegocioData.PerfilPublicoData perfil, Negocio negocioGlobal) {
        if (perfil != null && perfil.getNombre() != null && !perfil.getNombre().trim().isEmpty()) {
            return perfil.getNombre().trim();
        }
        if (negocioGlobal != null && negocioGlobal.getNombre() != null && !negocioGlobal.getNombre().trim().isEmpty()) {
            return negocioGlobal.getNombre().trim();
        }
        return humanizarCodigo(codigo);
    }

    private String humanizarCodigo(String codigo) {
        if (codigo == null || codigo.isEmpty()) return "";
        String[] partes = codigo.split("_");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < partes.length; i++) {
            if (i > 0) sb.append(' ');
            String p = partes[i];
            if (!p.isEmpty()) {
                sb.append(Character.toUpperCase(p.charAt(0)));
                if (p.length() > 1) sb.append(p.substring(1));
            }
        }
        return sb.toString();
    }

    private String formatearHorariosPublicos(Negocio.HorariosConfig horarios) {
        if (horarios == null) return "Consultar horarios";
        String inicio = horarios.getInicio() != null ? horarios.getInicio() : "09:00";
        String fin = horarios.getFin() != null ? horarios.getFin() : "20:00";
        return inicio + " - " + fin;
    }

    private String resolverImagenPortada(String codigo, NegocioData.PerfilPublicoData perfil) {
        if (perfil != null && perfil.getImagenPortada() != null && !perfil.getImagenPortada().trim().isEmpty()) {
            return perfil.getImagenPortada().trim();
        }
        if ("barberia_clasica".equals(codigo)) {
            return "/assets/img/establecimientos/barberia_ejemplo/portada/portada1.jpg";
        }
        return "/assets/img/establecimientos/barberia_ejemplo/portada/portada1.jpg";
    }
}
