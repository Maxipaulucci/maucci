package com.maxturnos.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static JwtUserPrincipal currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof JwtUserPrincipal principal) {
            return principal;
        }
        return null;
    }

    public static boolean canAccessEmail(String email) {
        JwtUserPrincipal principal = currentUser();
        if (principal == null || email == null) {
            return false;
        }
        return principal.getEmail().equalsIgnoreCase(email.trim());
    }
}
