package com.vaas.paf.ticket.model;

import java.time.Instant;
import java.util.List;

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
@Document(collection = "tickets")
public class TicketDocument {

	@Id
	private String id;
	private String resourceId;
	private String location;
	private TicketCategory category;
	private String description;
	private TicketPriority priority;
	private String preferredContact;
	private List<String> attachmentUrls;
	private TicketStatus status;
	private String rejectionReason;
	private String resolutionNotes;
	private String reporterId;
	private String reporterName;
	private String assignedTechnicianId;
	private String assignedTechnicianName;
	private Instant createdAt;
	private Instant updatedAt;
}
