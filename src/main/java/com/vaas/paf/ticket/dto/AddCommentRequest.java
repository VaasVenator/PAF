package com.vaas.paf.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record AddCommentRequest(@NotBlank(message = "Comment message is required.") String message) {
}
