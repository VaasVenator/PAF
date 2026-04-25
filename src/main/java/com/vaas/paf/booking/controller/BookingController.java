// src/main/java/com/vaas/paf/booking/controller/BookingController.java
package com.vaas.paf.booking.controller;

import com.vaas.paf.booking.dto.BookingAnalyticsResponse;
import com.vaas.paf.booking.dto.CreateBookingRequest;
import com.vaas.paf.booking.dto.ReviewBookingRequest;
import com.vaas.paf.booking.dto.BookingResponse;
import com.vaas.paf.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bookingDate
    ) {
        return ResponseEntity.ok(bookingService.list(status, bookingDate));
    }

    @PatchMapping("/{bookingId}/review")
    public ResponseEntity<BookingResponse> reviewBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody ReviewBookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.review(bookingId, request));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String bookingId
    ) {
        return ResponseEntity.ok(bookingService.cancel(bookingId));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getBookingSummary() {
        return ResponseEntity.ok(bookingService.getSummary());
    }

    @GetMapping("/analytics")
    public ResponseEntity<BookingAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(bookingService.getAnalytics());
    }
}