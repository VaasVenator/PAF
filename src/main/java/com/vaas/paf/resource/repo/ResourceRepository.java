package com.vaas.paf.resource.repo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vaas.paf.resource.model.ResourceDocument;

public interface ResourceRepository extends MongoRepository<ResourceDocument, String> {
}
