package com.vaas.paf.booking.dto;

import java.time.LocalDate;
import java.util.List;

public record BookingAnalyticsResponse(
        long total,
        long pending,
        long approved,
        long rejected,
        long cancelled,
        List<DailyBookingStats> bookingsByDay
) {
    public record DailyBookingStats(
            LocalDate date,
            long count
    ) {}
}
