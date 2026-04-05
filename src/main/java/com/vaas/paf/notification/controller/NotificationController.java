package com.vaas.paf.notification.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vaas.paf.notification.dto.NotificationResponse;
import com.vaas.paf.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping
	public List<NotificationResponse> listMine() {
		return notificationService.currentUserNotifications();
	}

	@PatchMapping("/{notificationId}/read")
	public NotificationResponse markAsRead(@PathVariable String notificationId) {
		return notificationService.markAsRead(notificationId);
	}
}
