package com.maxturnos.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

@Component
public class AccessControlManager implements AuthorizationManager<RequestAuthorizationContext> {

    private final AccessControlService accessControlService;

    public AccessControlManager(AccessControlService accessControlService) {
        this.accessControlService = accessControlService;
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication,
                                       RequestAuthorizationContext context) {
        HttpServletRequest request = context.getRequest();
        Authentication auth = authentication.get();

        if (auth == null || !auth.isAuthenticated()) {
            return new AuthorizationDecision(false);
        }

        return new AuthorizationDecision(accessControlService.canAccess(auth, request));
    }
}
