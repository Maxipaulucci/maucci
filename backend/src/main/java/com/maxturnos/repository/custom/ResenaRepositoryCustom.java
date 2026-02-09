package com.maxturnos.repository.custom;

import com.maxturnos.model.Resena;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class ResenaRepositoryCustom {
    
    private final MongoTemplate mongoTemplate;
    
    public ResenaRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public List<Resena> findByNegocioCodigo(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        return mongoTemplate.findAll(Resena.class, collectionName);
    }
    
    public List<Resena> findByNegocioCodigoAndAprobadaTrue(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("aprobada").is(true));
        query.with(Sort.by(Sort.Direction.DESC, "fechaCreacion"));
        return mongoTemplate.find(query, Resena.class, collectionName);
    }
    
    public List<Resena> findByNegocioCodigoAndAprobadaFalse(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("aprobada").is(false));
        return mongoTemplate.find(query, Resena.class, collectionName);
    }
    
    public Optional<Resena> findByIdAndNegocioCodigo(String id, String negocioCodigo) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("id").is(id));
        Resena resena = mongoTemplate.findOne(query, Resena.class, collectionName);
        return Optional.ofNullable(resena);
    }
    
    public boolean existsByNegocioCodigoAndUsuarioEmail(String negocioCodigo, String usuarioEmail) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("usuarioEmail").is(usuarioEmail));
        return mongoTemplate.exists(query, Resena.class, collectionName);
    }
    
    public List<Resena> findByAprobadaFalseAndFechaAprobacionBefore(LocalDateTime fecha) {
        // Este método necesita buscar en todas las colecciones de negocios
        // Por ahora, lo dejamos para implementar después si es necesario
        // O podemos pasar el negocioCodigo como parámetro
        throw new UnsupportedOperationException("Este método requiere negocioCodigo. Use findByNegocioCodigoAndAprobadaFalseAndFechaAprobacionBefore");
    }
    
    public List<Resena> findByNegocioCodigoAndAprobadaFalseAndFechaAprobacionBefore(
            String negocioCodigo, LocalDateTime fecha) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        Query query = new Query(Criteria.where("aprobada").is(false)
                .and("fechaAprobacion").lt(fecha));
        return mongoTemplate.find(query, Resena.class, collectionName);
    }
    
    public Resena save(String negocioCodigo, Resena resena) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        return mongoTemplate.save(resena, collectionName);
    }
    
    public void delete(String negocioCodigo, Resena resena) {
        String collectionName = CollectionNameHelper.getResenasCollection(negocioCodigo);
        mongoTemplate.remove(resena, collectionName);
    }
}
