package com.vaas.paf.booking.repo;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.vaas.paf.booking.model.BookingDocument;
import com.vaas.paf.booking.model.BookingStatus;

public interface BookingRepository extends MongoRepository<BookingDocument, String> {

	List<BookingDocument> findByRequesterId(String requesterId);

	List<BookingDocument> findByStatus(BookingStatus status);

	@Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'status': { $in: ?2 }, 'startTime': { $lt: ?4 }, 'endTime': { $gt: ?3 } }")
	List<BookingDocument> findConflicts(
			String resourceId,
			LocalDate bookingDate,
			Collection<BookingStatus> statuses,
			LocalTime startTime,
			LocalTime endTime);
}
