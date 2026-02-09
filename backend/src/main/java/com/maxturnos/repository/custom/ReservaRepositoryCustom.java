package com.maxturnos.repository.custom;

import com.maxturnos.model.Reserva;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.util.Date;
import java.util.List;

@Repository
public class ReservaRepositoryCustom {
    
    private final MongoTemplate mongoTemplate;
    
    public ReservaRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public List<Reserva> findByNegocioCodigo(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getReservasCollection(negocioCodigo);
        return mongoTemplate.findAll(Reserva.class, collectionName);
    }
    
    public List<Reserva> findByNegocioCodigoAndFechaBetween(String negocioCodigo, Date fechaInicio, Date fechaFin) {
        String collectionName = CollectionNameHelper.getReservasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").gte(fechaInicio).lte(fechaFin));
        return mongoTemplate.find(query, Reserva.class, collectionName);
    }
    
    public List<Reserva> findByFechaBefore(String negocioCodigo, Date fecha) {
        String collectionName = CollectionNameHelper.getReservasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").lt(fecha));
        return mongoTemplate.find(query, Reserva.class, collectionName);
    }
    
    public List<Reserva> findReservasByNegocioCodigoFechaYProfesional(
            String negocioCodigo,
            Date fechaInicio,
            Date fechaFin,
            Integer profesionalId) {
        String collectionName = CollectionNameHelper.getReservasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha")
                .gte(fechaInicio)
                .lt(fechaFin)
                .and("profesional.id").is(profesionalId));
        return mongoTemplate.find(query, Reserva.class, collectionName);
    }
    
    public Reserva save(String negocioCodigo, Reserva reserva) {
        String collectionName = CollectionNameHelper.getReservasCollection(negocioCodigo);
        return mongoTemplate.save(reserva, collectionName);
    }
    
    public void delete(String negocioCodigo, Reserva reserva) {
        String collectionName = CollectionNameHelper.getReservasCollection(negocioCodigo);
        mongoTemplate.remove(reserva, collectionName);
    }
    
    public void deleteAll(String negocioCodigo, List<Reserva> reservas) {
        String collectionName = CollectionNameHelper.getReservasCollection(negocioCodigo);
        mongoTemplate.remove(new Query(), Reserva.class, collectionName);
    }
}
