package com.maxturnos.repository.custom;

import com.maxturnos.model.Personal;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.util.List;
import java.util.Optional;

@Repository
public class PersonalRepositoryCustom {
    
    private final MongoTemplate mongoTemplate;
    
    public PersonalRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public List<Personal> findByNegocioCodigoAndActivoTrue(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getPersonalCollection(negocioCodigo);
        Query query = new Query(Criteria.where("activo").is(true));
        return mongoTemplate.find(query, Personal.class, collectionName);
    }
    
    public Optional<Personal> findByNegocioCodigoAndIdPersonal(String negocioCodigo, Integer idPersonal) {
        String collectionName = CollectionNameHelper.getPersonalCollection(negocioCodigo);
        Query query = new Query(Criteria.where("idPersonal").is(idPersonal).and("activo").is(true));
        Personal personal = mongoTemplate.findOne(query, Personal.class, collectionName);
        if (personal == null) {
            // Si no hay activo, buscar sin filtro de activo
            query = new Query(Criteria.where("idPersonal").is(idPersonal));
            personal = mongoTemplate.findOne(query, Personal.class, collectionName);
        }
        return Optional.ofNullable(personal);
    }
    
    public List<Personal> findAllByNegocioCodigoAndIdPersonal(String negocioCodigo, Integer idPersonal) {
        String collectionName = CollectionNameHelper.getPersonalCollection(negocioCodigo);
        Query query = new Query(Criteria.where("idPersonal").is(idPersonal));
        return mongoTemplate.find(query, Personal.class, collectionName);
    }
    
    public Integer obtenerSiguienteIdPersonal(String negocioCodigo) {
        List<Personal> personal = findByNegocioCodigoAndActivoTrue(negocioCodigo);
        if (personal.isEmpty()) {
            return 1;
        }
        return personal.stream()
                .mapToInt(Personal::getIdPersonal)
                .max()
                .orElse(0) + 1;
    }
    
    public Personal save(String negocioCodigo, Personal personal) {
        String collectionName = CollectionNameHelper.getPersonalCollection(negocioCodigo);
        return mongoTemplate.save(personal, collectionName);
    }
    
    public void delete(String negocioCodigo, Personal personal) {
        String collectionName = CollectionNameHelper.getPersonalCollection(negocioCodigo);
        mongoTemplate.remove(personal, collectionName);
    }
    
    public List<Personal> findAll(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getPersonalCollection(negocioCodigo);
        return mongoTemplate.findAll(Personal.class, collectionName);
    }
}
