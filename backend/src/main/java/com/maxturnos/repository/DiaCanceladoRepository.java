package com.maxturnos.repository;

import com.maxturnos.model.DiaCancelado;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaCanceladoRepository extends MongoRepository<DiaCancelado, String> {
    
    // Buscar día cancelado por establecimiento y fecha
    Optional<DiaCancelado> findByEstablecimientoAndFecha(
        String establecimiento, 
        Date fecha
    );
    
    // Obtener todos los días cancelados de un establecimiento
    List<DiaCancelado> findByEstablecimiento(String establecimiento);
    
    // Obtener días cancelados de un establecimiento a partir de una fecha
    List<DiaCancelado> findByEstablecimientoAndFechaGreaterThanEqual(
        String establecimiento,
        Date fecha
    );
    
    // Eliminar día cancelado por establecimiento y fecha
    void deleteByEstablecimientoAndFecha(String establecimiento, Date fecha);
}






