package com.vaas.paf.notification.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateNotificationRequest(
		@NotBlank(message = "Title is required.") String title,
		@NotBlank(message = "Message is required.") String message) {
}
