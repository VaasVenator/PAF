package com.vaas.paf.notification.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.vaas.paf.notification.model.NotificationDocument;

public interface NotificationRepository extends MongoRepository<NotificationDocument, String> {

	List<NotificationDocument> findByUserIdOrderByCreatedAtDesc(String userId);
}
