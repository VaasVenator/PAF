package com.vaas.paf.booking.dto;

import jakarta.validation.constraints.NotBlank;

public record ReviewBookingRequest(
		@NotBlank(message = "Decision is required") String decision,
		String reason) {
}
