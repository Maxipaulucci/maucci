package com.maxturnos.repository;

import com.maxturnos.model.ReservaHistorica;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ReservaHistoricaRepository extends MongoRepository<ReservaHistorica, String> {
    
    List<ReservaHistorica> findByEstablecimiento(String establecimiento);
    
    List<ReservaHistorica> findByEstablecimientoAndFechaBetween(
        String establecimiento, Date fechaInicio, Date fechaFin);
    
    List<ReservaHistorica> findByEstablecimientoAndFecha(
        String establecimiento, Date fecha);
}


