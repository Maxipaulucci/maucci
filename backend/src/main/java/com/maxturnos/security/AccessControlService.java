package com.maxturnos.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {

    public boolean isPublicRequest(HttpServletRequest request) {
        String method = request.getMethod();
        String path = normalizePath(request);

        if (path.startsWith("/api/auth/")) {
            return isPublicAuthPath(method, path);
        }

        if ("GET".equals(method) && "/api/negocios/locales-adheridos".equals(path)) {
            return true;
        }

        if ("GET".equals(method) && path.matches("/api/negocios/[^/]+")) {
            return true;
        }

        if ("GET".equals(method) && path.matches("/api/servicios/[^/]+")) {
            return true;
        }

        if ("GET".equals(method) && path.matches("/api/personal/[^/]+")) {
            return true;
        }

        if ("GET".equals(method) && path.matches("/api/dias-cancelados/[^/]+")) {
            return true;
        }

        if ("GET".equals(method) && path.matches("/api/resenas/negocio/[^/]+/publicas")) {
            return true;
        }

        if ("POST".equals(method) && "/api/reservas".equals(path)) {
            return true;
        }

        if ("GET".equals(method) && "/api/reservas/horarios-disponibles".equals(path)) {
            return true;
        }

        if ("POST".equals(method) && "/api/pagos/preferencia".equals(path)) {
            return true;
        }

        if ("POST".equals(method) && "/api/pagos/transferencia".equals(path)) {
            return true;
        }

        if ("POST".equals(method) && "/api/pagos/confirmar".equals(path)) {
            return true;
        }

        if ("POST".equals(method) && "/api/pagos/webhook".equals(path)) {
            return true;
        }

        return false;
    }

    private boolean isPublicAuthPath(String method, String path) {
        if (!"POST".equals(method)) {
            return false;
        }
        return path.equals("/api/auth/register")
                || path.equals("/api/auth/login")
                || path.equals("/api/auth/verify-email")
                || path.equals("/api/auth/resend-code")
                || path.equals("/api/auth/forgot-password")
                || path.equals("/api/auth/verify-password-reset-code")
                || path.equals("/api/auth/reset-password");
    }

    public boolean canAccess(Authentication authentication, HttpServletRequest request) {
        if (!(authentication.getPrincipal() instanceof JwtUserPrincipal principal)) {
            return false;
        }

        String method = request.getMethod();
        String path = normalizePath(request);

        if (path.startsWith("/api/superadmin/")) {
            return principal.isSuperAdmin();
        }

        if ("/api/auth/mi-historial".equals(path) && "GET".equals(method)) {
            return emailMatches(principal, request.getParameter("email"));
        }

        if ("/api/auth/change-password".equals(path) && "POST".equals(method)) {
            return true;
        }

        if ("/api/auth/delete-account".equals(path) && "POST".equals(method)) {
            return true;
        }

        if ("/api/resenas".equals(path) && "POST".equals(method)) {
            return true;
        }

        if (principal.isSuperAdmin()) {
            return true;
        }

        if (principal.isAdmin()) {
            String negocio = extractNegocioFromRequest(request, path);
            return negocio != null && negocioMatches(principal, negocio);
        }

        return false;
    }

    public boolean emailMatches(JwtUserPrincipal principal, String email) {
        if (email == null || principal.getEmail() == null) {
            return false;
        }
        return principal.getEmail().equalsIgnoreCase(email.trim());
    }

    public boolean negocioMatches(JwtUserPrincipal principal, String codigo) {
        if (codigo == null || principal.getNombreNegocio() == null) {
            return false;
        }
        String normalized = codigo.trim().toLowerCase().replaceAll("\\s+", "_");
        return principal.getNombreNegocio().equalsIgnoreCase(normalized);
    }

    private String extractNegocioFromRequest(HttpServletRequest request, String path) {
        String fromQuery = firstNonBlank(
                request.getParameter("establecimiento"),
                request.getParameter("negocioCodigo"));
        if (fromQuery != null) {
            return fromQuery;
        }

        String[] segments = path.split("/");
        if (segments.length >= 4 && "negocios".equals(segments[2])) {
            return segments[3];
        }
        if (segments.length >= 4 && ("personal".equals(segments[2]) || "servicios".equals(segments[2]))) {
            return segments[3];
        }
        if (segments.length >= 4 && "dias-cancelados".equals(segments[2])) {
            return segments[3];
        }
        if (segments.length >= 5 && "resenas".equals(segments[2]) && "negocio".equals(segments[3])) {
            return segments[4];
        }
        return null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value;
            }
        }
        return null;
    }

    private String normalizePath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        if (uri.length() > 1 && uri.endsWith("/")) {
            uri = uri.substring(0, uri.length() - 1);
        }
        return uri;
    }
}
