package com.vaas.paf.ticket.dto;

import java.time.Instant;

import com.vaas.paf.security.UserRole;

public record TicketCommentResponse(
		String id,
		String ticketId,
		String authorId,
		String authorName,
		UserRole authorRole,
		String message,
		Instant createdAt,
		Instant updatedAt) {
}
