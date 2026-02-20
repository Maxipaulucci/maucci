package com.maxturnos.repository;

import com.maxturnos.model.NegocioData;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;
import com.maxturnos.util.CollectionNameHelper;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para manejar los datos de un negocio.
 * Cada negocio tiene su propia colección que contiene todos sus datos.
 */
@Repository
public class NegocioDataRepository {
    
    private final MongoTemplate mongoTemplate;
    
    public NegocioDataRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    /**
     * Obtiene o crea el documento de datos del negocio.
     * Si no existe, crea uno nuevo con listas vacías.
     */
    public NegocioData getOrCreate(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo));
        NegocioData data = mongoTemplate.findOne(query, NegocioData.class, collectionName);
        
        if (data == null) {
            data = new NegocioData();
            data.setId(negocioCodigo);
            mongoTemplate.save(data, collectionName);
        }
        
        return data;
    }
    
    /**
     * Guarda el documento de datos del negocio.
     */
    public NegocioData save(String negocioCodigo, NegocioData data) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        data.setId(negocioCodigo);
        return mongoTemplate.save(data, collectionName);
    }
    
    /**
     * Obtiene el documento de datos del negocio.
     */
    public Optional<NegocioData> findById(String negocioCodigo) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo));
        NegocioData data = mongoTemplate.findOne(query, NegocioData.class, collectionName);
        return Optional.ofNullable(data);
    }
    
    /**
     * Actualiza un campo específico del documento usando operadores de MongoDB.
     */
    public void updateField(String negocioCodigo, String field, Object value) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo));
        Update update = new Update().set(field, value);
        mongoTemplate.updateFirst(query, update, NegocioData.class, collectionName);
    }
    
    /**
     * Agrega un elemento a un array usando $push.
     * Si el documento no existe, lo crea primero.
     */
    public void pushToArray(String negocioCodigo, String arrayField, Object value) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo));
        NegocioData existing = mongoTemplate.findOne(query, NegocioData.class, collectionName);

        if (existing == null) {
            NegocioData newData = new NegocioData();
            newData.setId(negocioCodigo);
            mongoTemplate.save(newData, collectionName);
        }

        Update update = new Update().push(arrayField, value);
        mongoTemplate.updateFirst(query, update, NegocioData.class, collectionName);
    }
    
    /**
     * Elimina un elemento de un array usando $pull.
     */
    public void pullFromArray(String negocioCodigo, String arrayField, Object value) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo));
        Update update = new Update().pull(arrayField, value);
        mongoTemplate.updateFirst(query, update, NegocioData.class, collectionName);
    }
    
    /**
     * Actualiza un elemento específico dentro de un array.
     */
    public void updateArrayElement(String negocioCodigo, String arrayField, 
                                    String elementIdField, String elementId, 
                                    String fieldToUpdate, Object newValue) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo)
                .and(arrayField + "." + elementIdField).is(elementId));
        Update update;
        if (newValue == null) {
            // Si el valor es null, usar unset para eliminar el campo
            update = new Update().unset(arrayField + ".$." + fieldToUpdate);
        } else {
            update = new Update().set(arrayField + ".$." + fieldToUpdate, newValue);
        }
        mongoTemplate.updateFirst(query, update, NegocioData.class, collectionName);
    }
    
    /**
     * Elimina un elemento específico de un array usando $pull con query.
     */
    public void removeArrayElement(String negocioCodigo, String arrayField, 
                                   String elementIdField, String elementId) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo));
        // Usar $pull con un documento que coincida con el elemento
        org.bson.Document pullQuery = new org.bson.Document(elementIdField, elementId);
        Update update = new Update().pull(arrayField, pullQuery);
        mongoTemplate.updateFirst(query, update, NegocioData.class, collectionName);
    }
    
    /**
     * Reemplaza todo el array con un nuevo array.
     */
    public void replaceArray(String negocioCodigo, String arrayField, List<?> newArray) {
        String collectionName = CollectionNameHelper.getNegocioCollection(negocioCodigo);
        Query query = new Query(Criteria.where("_id").is(negocioCodigo));
        Update update = new Update().set(arrayField, newArray);
        mongoTemplate.updateFirst(query, update, NegocioData.class, collectionName);
    }
}
