// src/main/java/com/vaas/paf/booking/service/BookingService.java
package com.vaas.paf.booking.service;

import com.vaas.paf.booking.dto.BookingResponse;
import com.vaas.paf.booking.dto.CreateBookingRequest;
import com.vaas.paf.booking.dto.ReviewBookingRequest;
import com.vaas.paf.booking.model.BookingDocument;
import com.vaas.paf.booking.model.BookingStatus;
import com.vaas.paf.booking.repo.BookingRepository;
import com.vaas.paf.common.AppException;
import com.vaas.paf.resource.model.ResourceDocument;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.service.ResourceService;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final AccessGuard accessGuard;

    public BookingService(BookingRepository bookingRepository, ResourceService resourceService, 
                          AccessGuard accessGuard) {
        this.bookingRepository = bookingRepository;
        this.resourceService = resourceService;
        this.accessGuard = accessGuard;
    }

    public BookingResponse create(CreateBookingRequest request) {
        AuthenticatedUser currentUser = accessGuard.currentUser();
        
        ResourceDocument resource = resourceService.getDocument(request.resourceId());
        
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Resource is not available for booking");
        }

        if (!request.startTime().isBefore(request.endTime())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }

        if (request.expectedAttendees() != null &&
                resource.getCapacity() != null &&
                request.expectedAttendees() > resource.getCapacity()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Expected attendees exceed resource capacity");
        }

        boolean conflictExists = !bookingRepository.findConflicts(
                request.resourceId(),
                request.bookingDate(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED),
                request.startTime(),
                request.endTime()
        ).isEmpty();

        if (conflictExists) {
            throw new AppException(HttpStatus.CONFLICT, "Selected time slot overlaps with another booking");
        }

        BookingDocument booking = BookingDocument.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .requesterId(currentUser.userId())
                .requesterName(currentUser.displayName())
                .bookingDate(request.bookingDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .purpose(request.purpose())
                .expectedAttendees(request.expectedAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        @SuppressWarnings("null")
        BookingDocument saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public List<BookingResponse> list(String status, String bookingDate) {
        AuthenticatedUser currentUser = accessGuard.currentUser();
        boolean isAdmin = currentUser.role().name().equals("ADMIN");

        List<BookingDocument> bookings = isAdmin
                ? bookingRepository.findAll()
                : bookingRepository.findByRequesterId(currentUser.userId());

        Stream<BookingDocument> stream = bookings.stream();

        if (status != null && !status.isBlank()) {
            String normalized = status.trim().toUpperCase();
            stream = stream.filter(b -> b.getStatus().name().equals(normalized));
        }

        if (bookingDate != null && !bookingDate.isBlank()) {
            LocalDate selectedDate = LocalDate.parse(bookingDate);
            stream = stream.filter(b -> selectedDate.equals(b.getBookingDate()));
        }

        return stream
                .sorted(Comparator.comparing(BookingDocument::getCreatedAt).reversed())
                .map(this::mapToResponse)
                .toList();
    }

    public BookingResponse review(String bookingId, ReviewBookingRequest request) {
        accessGuard.requireAnyRole(com.vaas.paf.security.UserRole.ADMIN);
        AuthenticatedUser currentUser = accessGuard.currentUser();

        @SuppressWarnings("null")
        BookingDocument booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only pending bookings can be reviewed");
        }

        String decision = request.decision().trim().toUpperCase();

        if (!decision.equals("APPROVED") && !decision.equals("REJECTED")) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Decision must be APPROVED or REJECTED");
        }

        if (decision.equals("REJECTED") &&
                (request.reason() == null || request.reason().trim().isEmpty())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Reason is required when rejecting a booking");
        }

        booking.setStatus(BookingStatus.valueOf(decision));
        booking.setDecisionReason(request.reason() == null ? null : request.reason().trim());
        booking.setReviewedBy(currentUser.displayName());
        booking.setReviewedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        BookingDocument saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public BookingResponse cancel(String bookingId) {
        AuthenticatedUser currentUser = accessGuard.currentUser();
        
        @SuppressWarnings("null")
        BookingDocument booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isAdmin = currentUser.role().name().equals("ADMIN");
        boolean isOwner = booking.getRequesterId().equals(currentUser.userId());

        if (!isAdmin && !isOwner) {
            throw new AppException(HttpStatus.FORBIDDEN, "You are not allowed to cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING &&
                booking.getStatus() != BookingStatus.APPROVED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());

        BookingDocument saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public Map<String, Long> getSummary() {
        AuthenticatedUser currentUser = accessGuard.currentUser();
        boolean isAdmin = currentUser.role().name().equals("ADMIN");

        List<BookingDocument> bookings = isAdmin
                ? bookingRepository.findAll()
                : bookingRepository.findByRequesterId(currentUser.userId());

        Map<String, Long> summary = new LinkedHashMap<>();
        summary.put("total", (long) bookings.size());
        summary.put("pending", bookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count());
        summary.put("approved", bookings.stream().filter(b -> b.getStatus() == BookingStatus.APPROVED).count());
        summary.put("rejected", bookings.stream().filter(b -> b.getStatus() == BookingStatus.REJECTED).count());
        summary.put("cancelled", bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count());

        return summary;
    }

    private BookingResponse mapToResponse(BookingDocument booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResourceId(),
                booking.getResourceName(),
                booking.getRequesterId(),
                booking.getRequesterName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus(),
                booking.getDecisionReason(),
                booking.getReviewedBy(),
                booking.getReviewedAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}