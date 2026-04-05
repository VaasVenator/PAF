package com.vaas.paf.config;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.mongodb.client.MongoClient;

@Component
public class MongoConnectionVerifier implements ApplicationRunner {

	private static final Logger logger = LoggerFactory.getLogger(MongoConnectionVerifier.class);

	private final MongoClient mongoClient;
	private final boolean verifyOnStartup;

	public MongoConnectionVerifier(
			MongoClient mongoClient,
			@Value("${app.mongodb.verify-on-startup:true}") boolean verifyOnStartup) {
		this.mongoClient = mongoClient;
		this.verifyOnStartup = verifyOnStartup;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (!verifyOnStartup) {
			logger.info("MongoDB startup verification is disabled.");
			return;
		}

		Document response = mongoClient.getDatabase("admin").runCommand(new Document("ping", 1));
		logger.info("MongoDB Atlas connection verified successfully: {}", response.toJson());
	}
}
