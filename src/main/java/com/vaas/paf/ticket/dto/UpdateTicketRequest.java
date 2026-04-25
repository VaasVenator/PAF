package com.vaas.paf.ticket.dto;

import java.util.List;

import com.vaas.paf.ticket.model.TicketCategory;
import com.vaas.paf.ticket.model.TicketPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketRequest(
		String resourceId,
		@NotBlank(message = "Location is required.") String location,
		@NotNull(message = "Category is required.") TicketCategory category,
		@NotBlank(message = "Description is required.") String description,
		@NotNull(message = "Priority is required.") TicketPriority priority,
		@NotBlank(message = "Preferred contact is required.") String preferredContact,
		List<String> attachmentUrls) {
}
