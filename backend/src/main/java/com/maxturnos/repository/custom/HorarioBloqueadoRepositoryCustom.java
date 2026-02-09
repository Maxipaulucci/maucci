package com.maxturnos.repository.custom;

import com.maxturnos.model.HorarioBloqueado;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public class HorarioBloqueadoRepositoryCustom {
    
    private final MongoTemplate mongoTemplate;
    
    public HorarioBloqueadoRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public List<HorarioBloqueado> findByNegocioCodigoAndFechaAndProfesionalId(
            String negocioCodigo, Date fecha, Integer profesionalId) {
        String collectionName = CollectionNameHelper.getHorariosBloqueadosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").is(fecha)
                .and("profesionalId").is(profesionalId));
        return mongoTemplate.find(query, HorarioBloqueado.class, collectionName);
    }
    
    public Optional<HorarioBloqueado> findByNegocioCodigoAndFechaAndHoraAndProfesionalId(
            String negocioCodigo, Date fecha, String hora, Integer profesionalId) {
        String collectionName = CollectionNameHelper.getHorariosBloqueadosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").is(fecha)
                .and("hora").is(hora)
                .and("profesionalId").is(profesionalId));
        HorarioBloqueado horario = mongoTemplate.findOne(query, HorarioBloqueado.class, collectionName);
        return Optional.ofNullable(horario);
    }
    
    public void deleteByNegocioCodigoAndFechaAndHoraAndProfesionalId(
            String negocioCodigo, Date fecha, String hora, Integer profesionalId) {
        String collectionName = CollectionNameHelper.getHorariosBloqueadosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").is(fecha)
                .and("hora").is(hora)
                .and("profesionalId").is(profesionalId));
        mongoTemplate.remove(query, HorarioBloqueado.class, collectionName);
    }
    
    public List<HorarioBloqueado> findByNegocioCodigoAndFecha(String negocioCodigo, Date fecha) {
        String collectionName = CollectionNameHelper.getHorariosBloqueadosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").is(fecha));
        return mongoTemplate.find(query, HorarioBloqueado.class, collectionName);
    }
    
    public HorarioBloqueado save(String negocioCodigo, HorarioBloqueado horario) {
        String collectionName = CollectionNameHelper.getHorariosBloqueadosCollection(negocioCodigo);
        return mongoTemplate.save(horario, collectionName);
    }
    
    public void delete(String negocioCodigo, HorarioBloqueado horario) {
        String collectionName = CollectionNameHelper.getHorariosBloqueadosCollection(negocioCodigo);
        mongoTemplate.remove(horario, collectionName);
    }
}
