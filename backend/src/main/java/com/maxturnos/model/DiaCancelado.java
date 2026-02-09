package com.maxturnos.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.util.Date;

@Document(collection = "dias_cancelados")
@CompoundIndex(name = "establecimiento_fecha", 
               def = "{'establecimiento': 1, 'fecha': 1}", 
               unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaCancelado {
    
    @Id
    private String id;
    
    @Indexed
    private String establecimiento;
    
    private Date fecha;
    
    private String motivo; // Opcional: motivo de la cancelación
    
    private Date fechaCreacion = new Date();
}






