package com.vaas.paf.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.vaas.paf.common.AppException;

@Component
public class AccessGuard {

	public AuthenticatedUser currentUser() {
		return RequestUserContext.getCurrentUser();
	}

	public void requireAnyRole(UserRole... roles) {
		AuthenticatedUser user = currentUser();
		for (UserRole role : roles) {
			if (user.role() == role) {
				return;
			}
		}
		throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to perform this action.");
	}

	public void requireOwnerOrRole(String ownerId, UserRole... roles) {
		AuthenticatedUser user = currentUser();
		if (user.userId().equals(ownerId)) {
			return;
		}
		requireAnyRole(roles);
	}
}
