package com.vaas.paf.notification.dto;

import java.time.Instant;

import com.vaas.paf.notification.model.NotificationType;

public record NotificationResponse(
		String id,
		String userId,
		String title,
		String message,
		NotificationType type,
		String referenceId,
		boolean read,
		Instant createdAt) {
}
