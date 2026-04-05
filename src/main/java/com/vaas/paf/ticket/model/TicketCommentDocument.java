package com.vaas.paf.ticket.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.vaas.paf.security.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ticket_comments")
public class TicketCommentDocument {

	@Id
	private String id;
	private String ticketId;
	private String authorId;
	private String authorName;
	private UserRole authorRole;
	private String message;
	private Instant createdAt;
	private Instant updatedAt;
}
