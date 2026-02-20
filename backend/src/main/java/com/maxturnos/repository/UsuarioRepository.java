package com.maxturnos.repository;

import com.maxturnos.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Usuario> findByNombreNegocioAndRol(String nombreNegocio, String rol);
    boolean existsByNombreNegocioAndRol(String nombreNegocio, String rol);

    /**
     * Usuarios no verificados creados hace más de 1 hora, o sin fechaCreacion (migrados/antiguos).
     */
    @Query("{ 'emailVerificado' : false, $or: [ { 'fechaCreacion' : { $lt: ?0 } }, { 'fechaCreacion' : null } ] }")
    List<Usuario> findNoVerificadosParaEliminar(LocalDateTime fechaLimite);
}

