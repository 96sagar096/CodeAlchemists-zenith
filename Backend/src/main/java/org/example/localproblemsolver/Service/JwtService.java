package org.example.localproblemsolver.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.localproblemsolver.entity.Severity;
import org.example.localproblemsolver.entity.User;
import org.example.localproblemsolver.entity.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;



    @Service
    public class JwtService {

        private final SecretKey secretKey;
        private final long jwtExpiration;


        public JwtService(
                @Value("${jwt.secret}") String secret,
                @Value("${jwt.expiration}") long jwtExpiration
        ) {
            this.secretKey = Keys.hmacShaKeyFor(
                    secret.getBytes(StandardCharsets.UTF_8)
            );

            this.jwtExpiration = jwtExpiration;
        }

        public String generateUserToken(String email) {

            Date now = new Date();
            Date expiration = new Date(now.getTime() + jwtExpiration);

            return Jwts.builder()
                    .subject(email)
                    .claim("role", "USER")
                    .issuedAt(now)
                    .expiration(expiration)
                    .signWith(secretKey)
                    .compact();
        }

        public String extractEmail(String token) {

            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        }

        public boolean isTokenValid(String token, String email) {

            try {
                String extractedEmail = extractEmail(token);

                return extractedEmail.equals(email)
                        && !isTokenExpired(token);

            } catch (Exception exception) {
                return false;
            }
        }

        private boolean isTokenExpired(String token) {

            Date expiration = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();

            return expiration.before(new Date());
        }
        public String extractRole(String token) {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("role", String.class);
        }

        public String generateToken(
                Long adminId ,
                Long deptId

        ) {

            Date now = new Date();
            Date expiration = new Date(now.getTime() + jwtExpiration);

            return Jwts.builder()
                    .subject(adminId.toString())
                    .claim("deptId", deptId)
                    .claim("role", "DEPARTMENT_ADMIN")
                    .issuedAt(now)
                    .expiration(expiration)
                    .signWith(secretKey)
                    .compact();
        }
        public Long extractdeptId(String token) {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("deptId", Long.class);
        }
        public Long extractId(String token) {
            return Long.parseLong(
                    Jwts.parser()
                            .verifyWith(secretKey)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload()
                            .getSubject()
            );

        }
        public boolean isAdminTokenValid(String token, Long id) {

            try {
                String extractedId = extractId(token).toString();

                return extractedId.equals(id.toString())
                        && !isTokenExpired(token);

            } catch (Exception exception) {
                return false;
            }
        }



}
