package com.vaas.paf.security;

public final class RequestUserContext {

	private static final ThreadLocal<AuthenticatedUser> CURRENT_USER = new ThreadLocal<>();

	private RequestUserContext() {
	}

	public static void setCurrentUser(AuthenticatedUser user) {
		CURRENT_USER.set(user);
	}

	public static AuthenticatedUser getCurrentUser() {
		AuthenticatedUser user = CURRENT_USER.get();
		if (user == null) {
			return new AuthenticatedUser("demo-user", "Demo User", UserRole.USER);
		}
		return user;
	}

	public static void clear() {
		CURRENT_USER.remove();
	}
}
