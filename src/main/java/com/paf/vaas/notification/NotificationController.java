package com.paf.vaas.notification;

import com.paf.vaas.notification.dto.CreateNotificationRequest;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/{userId}")
    public List<Notification> getNotificationsByUserId(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@Valid @RequestBody CreateNotificationRequest request) {
        Notification notification = new Notification(
                request.userId(),
                request.message().trim(),
                Boolean.TRUE.equals(request.read()),
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(notificationRepository.save(notification));
    }
}
