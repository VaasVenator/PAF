package com.vaas.paf.security;

public record AuthenticatedUser(
		String userId,
		String displayName,
		UserRole role) {
}
