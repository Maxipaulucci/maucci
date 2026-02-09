package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "negocios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Negocio {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String codigo;
    
    private String nombre;
    
    private HorariosConfig horarios;
    
    private List<Integer> diasDisponibles; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    private String ordenResenas; // "antigua-reciente", "reciente-antigua", "mayor-menor", "menor-mayor"
    
    private List<String> categorias; // Lista de categorías disponibles para servicios
    
    private Boolean activo = true;
    
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HorariosConfig {
        private String inicio = "09:00";
        private String fin = "20:00";
        private Integer intervalo = 30; // minutos entre turnos
    }
}









