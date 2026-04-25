package com.vaas.paf.notification.dto;

import com.vaas.paf.notification.model.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNotificationRequest(
		@NotBlank(message = "User ID is required.") String userId,
		@NotBlank(message = "Title is required.") String title,
		@NotBlank(message = "Message is required.") String message,
		@NotNull(message = "Type is required.") NotificationType type,
		String referenceId) {
}
