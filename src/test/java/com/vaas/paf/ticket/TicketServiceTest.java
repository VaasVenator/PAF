package com.vaas.paf.ticket;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import com.vaas.paf.common.AppException;
import com.vaas.paf.notification.service.NotificationService;
import com.vaas.paf.security.AccessGuard;
import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.UserRole;
import com.vaas.paf.ticket.dto.CreateTicketRequest;
import com.vaas.paf.ticket.model.TicketCategory;
import com.vaas.paf.ticket.model.TicketPriority;
import com.vaas.paf.ticket.repo.TicketRepository;
import com.vaas.paf.ticket.service.TicketService;

class TicketServiceTest {

	@Mock
	private TicketRepository ticketRepository;

	@Mock
	private NotificationService notificationService;

	@Mock
	private AccessGuard accessGuard;

	private TicketService ticketService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		ticketService = new TicketService(ticketRepository, notificationService, accessGuard);
		when(accessGuard.currentUser()).thenReturn(new AuthenticatedUser("user-1", "Reporter", UserRole.USER));
	}

	@Test
	void createShouldRejectMoreThanThreeAttachments() {
		CreateTicketRequest request = new CreateTicketRequest(
				"resource-1",
				"Faculty Building A",
				TicketCategory.HARDWARE,
				"Projector damaged",
				TicketPriority.HIGH,
				"0771234567",
				List.of("1.png", "2.png", "3.png", "4.png"));

		AppException exception = assertThrows(AppException.class, () -> ticketService.create(request));
		assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
	}
}
