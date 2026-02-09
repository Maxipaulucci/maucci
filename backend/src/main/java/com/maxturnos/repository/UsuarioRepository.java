package com.maxturnos.repository;

import com.maxturnos.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Usuario> findByNombreNegocioAndRol(String nombreNegocio, String rol);
    boolean existsByNombreNegocioAndRol(String nombreNegocio, String rol);
}

