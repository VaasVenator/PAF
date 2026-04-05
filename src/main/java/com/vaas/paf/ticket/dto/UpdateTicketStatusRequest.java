package com.vaas.paf.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTicketStatusRequest(
		@NotBlank(message = "Status is required.") String status,
		String resolutionNotes,
		String rejectionReason) {
}
