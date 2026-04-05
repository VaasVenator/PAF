package com.vaas.paf.config;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.vaas.paf.security.AuthenticatedUser;
import com.vaas.paf.security.RequestUserContext;
import com.vaas.paf.security.UserRole;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RequestUserFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		String userId = headerOrDefault(request, "X-User-Id", "demo-user");
		String userName = headerOrDefault(request, "X-User-Name", "Demo User");
		String roleValue = headerOrDefault(request, "X-User-Role", "USER");
		UserRole role = UserRole.valueOf(roleValue.toUpperCase());
		RequestUserContext.setCurrentUser(new AuthenticatedUser(userId, userName, role));

		try {
			filterChain.doFilter(request, response);
		} finally {
			RequestUserContext.clear();
		}
	}

	private String headerOrDefault(HttpServletRequest request, String name, String fallback) {
		String value = request.getHeader(name);
		return value == null || value.isBlank() ? fallback : value;
	}
}
