package com.mpt.financecontrol.config;

import com.mpt.financecontrol.usuario.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final Key  key;
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret}")     String secret,
            @Value("${jwt.expiration}") long   expiration
    ) {
        this.key        = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiration = expiration;
    }

    public String gerar(UUID id, Role role) {
        return Jwts.builder()
                .setSubject(id.toString())
                .claim("role", role.name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public UUID getId(String token) {
        return UUID.fromString(getClaims(token).getSubject());
    }

    public Role getRole(String token) {
        return Role.valueOf((String) getClaims(token).get("role"));
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
