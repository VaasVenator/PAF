package com.vaas.paf.booking.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import com.vaas.paf.booking.model.BookingStatus;

public record BookingResponse(
		String id,
		String resourceId,
		String resourceName,
		String requesterId,
		String requesterName,
		LocalDate bookingDate,
		LocalTime startTime,
		LocalTime endTime,
		String purpose,
		Integer expectedAttendees,
		BookingStatus status,
		String decisionReason,
		String reviewedBy,
		Instant reviewedAt,
		Instant createdAt,
		Instant updatedAt) {
}
