package com.swiftdrop.backend.courier.controller;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Resolves the authenticated courier identity strictly from the verified JWT "sub" claim.
 * Never trusts a client-supplied courier ID.
 */
final class CurrentUser {

    private CurrentUser() {
    }

    static UUID id(Jwt token) {
        if (token == null || token.getSubject() == null) {
            throw new IllegalArgumentException("Authenticated token subject must not be null");
        }
        return UUID.fromString(token.getSubject());
    }
}
