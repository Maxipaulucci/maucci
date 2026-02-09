package com.maxturnos.repository.custom;

import com.maxturnos.model.Servicio;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.util.List;
import java.util.Optional;

@Repository
public class ServicioRepositoryCustom {
    
    private final MongoTemplate mongoTemplate;
    
    public ServicioRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public List<Servicio> findByNegocioCodigoAndActivoTrue(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getServiciosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("activo").is(true));
        return mongoTemplate.find(query, Servicio.class, collectionName);
    }
    
    public Optional<Servicio> findByNegocioCodigoAndIdServicio(String negocioCodigo, Integer idServicio) {
        String collectionName = CollectionNameHelper.getServiciosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("idServicio").is(idServicio).and("activo").is(true));
        Servicio servicio = mongoTemplate.findOne(query, Servicio.class, collectionName);
        if (servicio == null) {
            query = new Query(Criteria.where("idServicio").is(idServicio));
            servicio = mongoTemplate.findOne(query, Servicio.class, collectionName);
        }
        return Optional.ofNullable(servicio);
    }
    
    public List<Servicio> findAllByNegocioCodigoAndIdServicio(String negocioCodigo, Integer idServicio) {
        String collectionName = CollectionNameHelper.getServiciosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("idServicio").is(idServicio));
        return mongoTemplate.find(query, Servicio.class, collectionName);
    }
    
    public Integer obtenerSiguienteIdServicio(String negocioCodigo) {
        List<Servicio> servicios = findByNegocioCodigoAndActivoTrue(negocioCodigo);
        if (servicios.isEmpty()) {
            return 1;
        }
        return servicios.stream()
                .mapToInt(Servicio::getIdServicio)
                .max()
                .orElse(0) + 1;
    }
    
    public Servicio save(String negocioCodigo, Servicio servicio) {
        String collectionName = CollectionNameHelper.getServiciosCollection(negocioCodigo);
        return mongoTemplate.save(servicio, collectionName);
    }
    
    public void delete(String negocioCodigo, Servicio servicio) {
        String collectionName = CollectionNameHelper.getServiciosCollection(negocioCodigo);
        mongoTemplate.remove(servicio, collectionName);
    }
    
    public List<Servicio> findAll(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getServiciosCollection(negocioCodigo);
        return mongoTemplate.findAll(Servicio.class, collectionName);
    }
}
