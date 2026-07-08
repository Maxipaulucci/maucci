package com.maxturnos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:604800000}") long expirationMs) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("jwt.secret debe tener al menos 32 caracteres");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email, String rol, String nombreNegocio, boolean isSuperAdmin) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("rol", rol)
                .claim("nombreNegocio", nombreNegocio)
                .claim("isSuperAdmin", isSuperAdmin)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public JwtUserPrincipal parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String email = claims.getSubject();
            String rol = claims.get("rol", String.class);
            String nombreNegocio = claims.get("nombreNegocio", String.class);
            Boolean isSuperAdmin = claims.get("isSuperAdmin", Boolean.class);

            return new JwtUserPrincipal(
                    email,
                    rol,
                    nombreNegocio,
                    Boolean.TRUE.equals(isSuperAdmin));
        } catch (JwtException | IllegalArgumentException e) {
            throw new JwtException("Token inválido o expirado", e);
        }
    }
}
