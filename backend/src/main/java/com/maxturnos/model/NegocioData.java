package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Modelo que agrupa todos los datos de un negocio en una sola colección.
 * La colección se nombra dinámicamente como "negocio_{codigoNegocio}".
 * El nombre de la colección se maneja en el repositorio, no aquí.
 */
@Document
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NegocioData {
    
    @Id
    private String id; // Será el código del negocio
    
    // ========== RESERVAS ==========
    private List<ReservaData> reservas = new ArrayList<>();
    private List<ReservaHistoricaData> reservasHistoricas = new ArrayList<>();
    
    // ========== RESEÑAS ==========
    private List<ResenaData> resenas = new ArrayList<>();
    
    // ========== DÍAS CANCELADOS ==========
    private List<DiaCanceladoData> diasCancelados = new ArrayList<>();
    
    // ========== HORARIOS BLOQUEADOS ==========
    private List<HorarioBloqueadoData> horariosBloqueados = new ArrayList<>();
    
    // ========== PERSONAL ==========
    private List<PersonalData> personal = new ArrayList<>();
    
    // ========== SERVICIOS ==========
    private List<ServicioData> servicios = new ArrayList<>();
    
    // ========== CATEGORÍAS (para servicios) ==========
    private List<String> categorias = new ArrayList<>();
    
    // ========== CONFIGURACIÓN DE HORARIOS (inicio/fin/intervalo) ==========
    private HorariosConfigData horarios = new HorariosConfigData();
    
    // ========== DÍAS DISPONIBLES (0=Domingo ... 6=Sábado) ==========
    private List<Integer> diasDisponibles;
    
    // ========== INNER CLASSES ==========
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HorariosConfigData {
        private String inicio = "09:00";
        private String fin = "20:00";
        private Integer intervalo = 30;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservaData {
        private String id;
        private Date fecha;
        private String hora;
        private ServicioInfo servicio;
        private ProfesionalInfo profesional;
        private Integer duracionMinutos;
        private String notas = "";
        private String usuarioEmail;
        private String usuarioNombre;
        private String usuarioApellido;
        private LocalDateTime fechaCreacion = LocalDateTime.now();
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservaHistoricaData {
        private String id;
        private Date fecha;
        private String hora;
        private ServicioInfo servicio;
        private ProfesionalInfo profesional;
        private Integer duracionMinutos;
        private String notas = "";
        private String usuarioEmail;
        private String usuarioNombre;
        private String usuarioApellido;
        private LocalDateTime fechaCreacion;
        private LocalDateTime fechaArchivado = LocalDateTime.now();
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResenaData {
        private String id;
        private String usuarioEmail;
        private String usuarioNombre;
        private String usuarioApellido;
        private Integer rating;
        private String texto;
        private Boolean aprobada; // null = pendiente, true = aprobada, false = rechazada
        private LocalDateTime fechaCreacion;
        private LocalDateTime fechaAprobacion;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiaCanceladoData {
        private String id;
        private Date fecha;
        private String motivo;
        private Date fechaCreacion = new Date();
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HorarioBloqueadoData {
        private String id;
        private Date fecha;
        private String hora;
        private Integer profesionalId;
        private String motivo;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalData {
        private String id;
        private Integer idPersonal; // ID numérico único dentro del establecimiento
        private String nombre;
        private String rol;
        private String avatar;
        private List<String> specialties;
        private LocalDateTime fechaCreacion = LocalDateTime.now();
        private Boolean activo = true;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicioData {
        private String id;
        private Integer idServicio; // ID numérico único dentro del establecimiento
        private String nombre;
        private String categoria;
        private String duracion;
        private String precio;
        private String descripcion;
        private LocalDateTime fechaCreacion = LocalDateTime.now();
        private Boolean activo = true;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServicioInfo {
        private Integer id;
        private String name;
        private String duration;
        private String price;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfesionalInfo {
        private Integer id;
        private String name;
    }
}
