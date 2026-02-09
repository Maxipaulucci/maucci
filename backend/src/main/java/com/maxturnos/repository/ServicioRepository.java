package com.maxturnos.repository;

import com.maxturnos.model.Servicio;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ServicioRepository extends MongoRepository<Servicio, String> {
    
    // Buscar servicios activos por establecimiento
    List<Servicio> findByEstablecimientoAndActivoTrue(String establecimiento);
    
    // Buscar servicio por establecimiento e idServicio
    Optional<Servicio> findByEstablecimientoAndIdServicio(String establecimiento, Integer idServicio);
    
    // Buscar todos los servicios por establecimiento e idServicio (para manejar duplicados)
    List<Servicio> findAllByEstablecimientoAndIdServicio(String establecimiento, Integer idServicio);
    
    // Método para obtener el siguiente ID disponible
    default Integer obtenerSiguienteIdServicio(String establecimiento) {
        List<Servicio> servicios = findByEstablecimientoAndActivoTrue(establecimiento);
        if (servicios.isEmpty()) {
            return 1;
        }
        return servicios.stream()
                .mapToInt(Servicio::getIdServicio)
                .max()
                .orElse(0) + 1;
    }
}






