package com.vaas.paf.booking;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import com.vaas.paf.booking.dto.CreateBookingRequest;
import com.vaas.paf.booking.model.BookingDocument;
import com.vaas.paf.booking.repo.BookingRepository;
import com.vaas.paf.booking.service.BookingService;
import com.vaas.paf.common.AppException;
import com.vaas.paf.resource.model.ResourceDocument;
import com.vaas.paf.resource.model.ResourceStatus;
import com.vaas.paf.resource.model.ResourceType;
import com.vaas.paf.resource.service.ResourceService;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.UserRole;

class BookingServiceTest {

	@Mock
	private BookingRepository bookingRepository;

	@Mock
	private ResourceService resourceService;

	@Mock
	private AccessGuard accessGuard;

	private BookingService bookingService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		bookingService = new BookingService(bookingRepository, resourceService, accessGuard);
		when(accessGuard.currentUser()).thenReturn(new AuthenticatedUser("user-1", "Demo User", UserRole.USER));
	}

	@Test
	void createShouldRejectOverlappingBooking() {
		CreateBookingRequest request = new CreateBookingRequest(
				"resource-1",
				LocalDate.now().plusDays(1),
				LocalTime.of(10, 0),
				LocalTime.of(12, 0),
				"Guest lecture",
				40);

		ResourceDocument resource = ResourceDocument.builder()
				.id("resource-1")
				.name("Main Hall")
				.type(ResourceType.LECTURE_HALL)
				.capacity(50)
				.location("A Block")
				.availabilityStart(LocalTime.of(8, 0))
				.availabilityEnd(LocalTime.of(18, 0))
				.status(ResourceStatus.ACTIVE)
				.build();

		when(resourceService.getDocument("resource-1")).thenReturn(resource);
		when(bookingRepository.findConflicts(any(), any(), any(), any(), any()))
				.thenReturn(List.of(new BookingDocument()));

		AppException exception = assertThrows(AppException.class, () -> bookingService.create(request));
		org.junit.jupiter.api.Assertions.assertEquals(HttpStatus.CONFLICT, exception.getStatus());
	}
}
