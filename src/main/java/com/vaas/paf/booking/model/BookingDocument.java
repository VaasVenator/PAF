package com.vaas.paf.booking.model;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

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
@Document(collection = "bookings")
public class BookingDocument {

	@Id
	private String id;
	private String resourceId;
	private String resourceName;
	private String requesterId;
	private String requesterName;
	private LocalDate bookingDate;
	private LocalTime startTime;
	private LocalTime endTime;
	private String purpose;
	private Integer expectedAttendees;
	private BookingStatus status;
	private String decisionReason;
	private String reviewedBy;
	private Instant reviewedAt;
	private Instant createdAt;
	private Instant updatedAt;
}
