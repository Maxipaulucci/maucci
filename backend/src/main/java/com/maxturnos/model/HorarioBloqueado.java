package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.util.Date;

@Document(collection = "horario_bloqueado")
@CompoundIndex(name = "establecimiento_fecha_hora_profesional", 
               def = "{'establecimiento': 1, 'fecha': 1, 'hora': 1, 'profesionalId': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HorarioBloqueado {
    
    @Id
    private String id;
    
    @Indexed
    private String establecimiento;
    
    private Date fecha;
    
    private String hora;
    
    private Integer profesionalId;
    
    private String motivo; // Opcional: motivo del bloqueo
}

