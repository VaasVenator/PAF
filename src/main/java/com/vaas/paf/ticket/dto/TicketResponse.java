package com.vaas.paf.ticket.dto;

import java.time.Instant;
import java.util.List;

import com.vaas.paf.ticket.model.TicketCategory;
import com.vaas.paf.ticket.model.TicketPriority;
import com.vaas.paf.ticket.model.TicketStatus;

public record TicketResponse(
		String id,
		String resourceId,
		String location,
		TicketCategory category,
		String description,
		TicketPriority priority,
		String preferredContact,
		List<String> attachmentUrls,
		TicketStatus status,
		String rejectionReason,
		String resolutionNotes,
		String reporterId,
		String reporterName,
		String assignedTechnicianId,
		String assignedTechnicianName,
		Instant createdAt,
		Instant updatedAt) {
}
