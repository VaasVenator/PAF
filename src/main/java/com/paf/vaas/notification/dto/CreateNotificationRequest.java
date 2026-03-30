package com.paf.vaas.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateNotificationRequest(
        @NotNull(message = "User ID is required")
        String userId,

        @NotBlank(message = "Message is required")
        @Size(max = 500, message = "Message must be 500 characters or less")
        String message,

        Boolean read
) {
}
