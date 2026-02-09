package com.maxturnos.repository;

import com.maxturnos.model.Negocio;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NegocioRepository extends MongoRepository<Negocio, String> {
    Optional<Negocio> findByCodigo(String codigo);
    Optional<Negocio> findByCodigoAndActivoTrue(String codigo);
    Optional<Negocio> findByNombre(String nombre);
    Optional<Negocio> findByNombreAndActivoTrue(String nombre);
    List<Negocio> findByActivoTrue();
    boolean existsByCodigo(String codigo);
}


