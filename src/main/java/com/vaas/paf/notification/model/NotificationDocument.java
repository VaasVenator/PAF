package com.vaas.paf.notification.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class NotificationDocument {

	@Id
	private String id;
	private String userId;
	private String title;
	private String message;
	private NotificationType type;
	private String referenceId;
	private boolean read;
	private Instant createdAt;
}
