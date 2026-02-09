package com.maxturnos.repository;

import com.maxturnos.model.Reserva;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ReservaRepository extends MongoRepository<Reserva, String> {
    
    @Query("{ 'establecimiento': ?0, 'fecha': { $gte: ?1, $lt: ?2 }, 'profesional.id': ?3 }")
    List<Reserva> findReservasByEstablecimientoFechaYProfesional(
        String establecimiento,
        Date fechaInicio,
        Date fechaFin,
        Integer profesionalId
    );
    
    List<Reserva> findByEstablecimiento(String establecimiento);
    
    List<Reserva> findByEstablecimientoAndFechaBetween(
        String establecimiento,
        Date fechaInicio,
        Date fechaFin
    );
    
    // Buscar reservas con fecha anterior a la fecha especificada
    List<Reserva> findByFechaBefore(Date fecha);
}

