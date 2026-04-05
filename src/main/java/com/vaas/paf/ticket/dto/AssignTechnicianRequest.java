package com.vaas.paf.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignTechnicianRequest(
		@NotBlank(message = "Technician ID is required.") String technicianId,
		@NotBlank(message = "Technician name is required.") String technicianName) {
}
