package com.vaas.paf.config;

import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.vaas.paf.auth.model.UserDocument;
import com.vaas.paf.auth.repo.UserRepository;
import com.vaas.paf.security.UserRole;

@Component
public class AdminSeeder implements ApplicationRunner {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final String adminStudentId;
	private final String adminUsername;
	private final String adminPassword;

	public AdminSeeder(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.demo.admin.student-id:IT00000001}") String adminStudentId,
			@Value("${app.demo.admin.username:admin}") String adminUsername,
			@Value("${app.demo.admin.password:Admin@1234}") String adminPassword) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.adminStudentId = adminStudentId;
		this.adminUsername = adminUsername;
		this.adminPassword = adminPassword;
	}

	@Override
	public void run(ApplicationArguments args) {
		Optional<UserDocument> existingAdmin = userRepository.findByStudentId(adminStudentId);
		if (existingAdmin.isEmpty()) {
			existingAdmin = userRepository.findByUsernameIgnoreCase(adminUsername);
		}

		UserDocument admin = existingAdmin.orElseGet(() -> UserDocument.builder()
				.createdAt(Instant.now())
				.build());

		admin.setStudentId(adminStudentId);
		admin.setUsername(adminUsername);
		admin.setFirstName("System");
		admin.setLastName("Admin");
		admin.setPasswordHash(passwordEncoder.encode(adminPassword));
		admin.setRole(UserRole.ADMIN);

		userRepository.save(admin);
	}
}
