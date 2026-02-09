package com.maxturnos.repository;

import com.maxturnos.model.Resena;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResenaRepository extends MongoRepository<Resena, String> {
    List<Resena> findByNegocioCodigo(String negocioCodigo);
    List<Resena> findByNegocioCodigoAndAprobadaTrue(String negocioCodigo);
    List<Resena> findByNegocioCodigoAndAprobadaFalse(String negocioCodigo);
    Optional<Resena> findByIdAndNegocioCodigo(String id, String negocioCodigo);
    boolean existsByNegocioCodigoAndUsuarioEmail(String negocioCodigo, String usuarioEmail);
    
    // Encontrar reseñas rechazadas con fechaAprobacion anterior a una fecha específica
    List<Resena> findByAprobadaFalseAndFechaAprobacionBefore(LocalDateTime fecha);
}

