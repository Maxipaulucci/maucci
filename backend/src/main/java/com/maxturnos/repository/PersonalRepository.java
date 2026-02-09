package com.maxturnos.repository;

import com.maxturnos.model.Personal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalRepository extends MongoRepository<Personal, String> {
    
    // Encontrar todos los miembros del personal de un establecimiento
    List<Personal> findByEstablecimientoAndActivoTrue(String establecimiento);
    
    // Encontrar un miembro por establecimiento e ID numérico (puede haber múltiples, tomar el primero activo)
    default Optional<Personal> findByEstablecimientoAndIdPersonal(String establecimiento, Integer idPersonal) {
        List<Personal> personal = findAllByEstablecimientoAndIdPersonal(establecimiento, idPersonal);
        // Si hay múltiples, preferir el activo, o el primero si no hay activos
        return personal.stream()
                .filter(p -> p.getActivo() != null && p.getActivo())
                .findFirst()
                .or(() -> personal.stream().findFirst());
    }
    
    // Método auxiliar para obtener lista (puede haber múltiples) - usando @Query para evitar confusión con "List"
    @Query("{ 'establecimiento': ?0, 'idPersonal': ?1 }")
    List<Personal> findAllByEstablecimientoAndIdPersonal(String establecimiento, Integer idPersonal);
    
    // Encontrar el siguiente ID disponible para un establecimiento
    default Integer obtenerSiguienteIdPersonal(String establecimiento) {
        List<Personal> personal = findByEstablecimientoAndActivoTrue(establecimiento);
        if (personal.isEmpty()) {
            return 1;
        }
        return personal.stream()
                .mapToInt(Personal::getIdPersonal)
                .max()
                .orElse(0) + 1;
    }
}

