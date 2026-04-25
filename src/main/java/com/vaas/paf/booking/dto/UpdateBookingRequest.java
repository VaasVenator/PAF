package com.vaas.paf.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingRequest(
		@NotNull(message = "Booking date is required.") @FutureOrPresent(message = "Booking date must be today or later.") LocalDate bookingDate,
		@NotNull(message = "Start time is required.") LocalTime startTime,
		@NotNull(message = "End time is required.") LocalTime endTime,
		@NotBlank(message = "Purpose is required.") String purpose,
		@NotNull(message = "Expected attendees is required.") @Min(value = 1, message = "Expected attendees must be at least 1.") Integer expectedAttendees) {
}
