package com.maxturnos.repository.custom;

import com.maxturnos.model.ReservaHistorica;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.util.Date;
import java.util.List;

@Repository
public class ReservaHistoricaRepositoryCustom {
    
    private final MongoTemplate mongoTemplate;
    
    public ReservaHistoricaRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public List<ReservaHistorica> findByNegocioCodigo(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getReservasHistoricasCollection(negocioCodigo);
        return mongoTemplate.findAll(ReservaHistorica.class, collectionName);
    }
    
    public List<ReservaHistorica> findByNegocioCodigoAndFechaBetween(
            String negocioCodigo, Date fechaInicio, Date fechaFin) {
        String collectionName = CollectionNameHelper.getReservasHistoricasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").gte(fechaInicio).lte(fechaFin));
        return mongoTemplate.find(query, ReservaHistorica.class, collectionName);
    }
    
    public List<ReservaHistorica> findByNegocioCodigoAndFecha(String negocioCodigo, Date fecha) {
        String collectionName = CollectionNameHelper.getReservasHistoricasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").is(fecha));
        return mongoTemplate.find(query, ReservaHistorica.class, collectionName);
    }
    
    public ReservaHistorica save(String negocioCodigo, ReservaHistorica reserva) {
        String collectionName = CollectionNameHelper.getReservasHistoricasCollection(negocioCodigo);
        return mongoTemplate.save(reserva, collectionName);
    }
    
    public void saveAll(String negocioCodigo, List<ReservaHistorica> reservas) {
        String collectionName = CollectionNameHelper.getReservasHistoricasCollection(negocioCodigo);
        // Insertar todos en la colección específica del negocio
        for (ReservaHistorica reserva : reservas) {
            mongoTemplate.save(reserva, collectionName);
        }
    }
}
