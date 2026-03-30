package com.paf.vaas.auth.dto;

public record AuthResponse(
        String token,
        String userId,
        String email,
        String role
) {
}
