package com.vaas.paf.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCommentRequest(@NotBlank(message = "Comment message is required.") String message) {
}
