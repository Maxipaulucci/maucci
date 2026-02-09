package com.maxturnos.repository;

import com.maxturnos.model.HorarioBloqueado;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface HorarioBloqueadoRepository extends MongoRepository<HorarioBloqueado, String> {
    
    // Buscar horarios bloqueados por establecimiento, fecha y profesional
    List<HorarioBloqueado> findByEstablecimientoAndFechaAndProfesionalId(
        String establecimiento, 
        Date fecha, 
        Integer profesionalId
    );
    
    // Buscar un horario bloqueado específico
    Optional<HorarioBloqueado> findByEstablecimientoAndFechaAndHoraAndProfesionalId(
        String establecimiento,
        Date fecha,
        String hora,
        Integer profesionalId
    );
    
    // Eliminar horario bloqueado específico
    void deleteByEstablecimientoAndFechaAndHoraAndProfesionalId(
        String establecimiento,
        Date fecha,
        String hora,
        Integer profesionalId
    );
    
    // Obtener todos los horarios bloqueados de un establecimiento en una fecha
    List<HorarioBloqueado> findByEstablecimientoAndFecha(
        String establecimiento,
        Date fecha
    );
}

