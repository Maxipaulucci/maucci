package com.maxturnos.repository.custom;

import com.maxturnos.model.DiaCancelado;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public class DiaCanceladoRepositoryCustom {
    
    private final MongoTemplate mongoTemplate;
    
    public DiaCanceladoRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public Optional<DiaCancelado> findByNegocioCodigoAndFecha(String negocioCodigo, Date fecha) {
        String collectionName = CollectionNameHelper.getDiasCanceladosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").is(fecha));
        DiaCancelado dia = mongoTemplate.findOne(query, DiaCancelado.class, collectionName);
        return Optional.ofNullable(dia);
    }
    
    public List<DiaCancelado> findByNegocioCodigo(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getDiasCanceladosCollection(negocioCodigo);
        return mongoTemplate.findAll(DiaCancelado.class, collectionName);
    }
    
    public List<DiaCancelado> findByNegocioCodigoAndFechaGreaterThanEqual(String negocioCodigo, Date fecha) {
        String collectionName = CollectionNameHelper.getDiasCanceladosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").gte(fecha));
        return mongoTemplate.find(query, DiaCancelado.class, collectionName);
    }
    
    public void deleteByNegocioCodigoAndFecha(String negocioCodigo, Date fecha) {
        String collectionName = CollectionNameHelper.getDiasCanceladosCollection(negocioCodigo);
        Query query = new Query(Criteria.where("fecha").is(fecha));
        mongoTemplate.remove(query, DiaCancelado.class, collectionName);
    }
    
    public DiaCancelado save(String negocioCodigo, DiaCancelado diaCancelado) {
        String collectionName = CollectionNameHelper.getDiasCanceladosCollection(negocioCodigo);
        return mongoTemplate.save(diaCancelado, collectionName);
    }
}
